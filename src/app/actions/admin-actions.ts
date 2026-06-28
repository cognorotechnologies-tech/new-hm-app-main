'use server';

import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";
import { UserRole, PlanType, AuditAction } from "@prisma/client";
import { createAuditLog } from "@/lib/audit-service";
import { auth } from "@/auth";

const createTenantSchema = z.object({
    name: z.string().min(3),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric"),
    plan: z.enum(["FREE", "BASIC", "PROFESSIONAL", "ENTERPRISE"]),
    adminName: z.string().min(2),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(6),
});

export async function createTenant(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const validated = createTenantSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Validation Error",
            errors: validated.error.flatten().fieldErrors,
        };
    }

    const { name, slug, plan, adminName, adminEmail, adminPassword } = validated.data;

    try {
        // 1. Check if slug exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { slug },
        });

        if (existingTenant) {
            return { success: false, message: "Tenant slug already exists." };
        }

        // 2. Hash Password
        const hashedPassword = await hashPassword(adminPassword);

        // 3. Transaction: Create Tenant + Admin User
        await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    slug,
                    plan: plan as PlanType,
                    branding: {
                        primaryColor: "#3b82f6", // Default Blue
                        secondaryColor: "#64748b", // Default Slate
                        typography: "Inter",
                        theme: "light",
                    },
                    settings: {
                        modules: {
                            appointments: { enabled: true },
                            patients: { enabled: true },
                            billing: { enabled: true },
                            hr: { enabled: true },
                        },
                        quotas: {
                            maxUsers: plan === "FREE" ? 5 : plan === "BASIC" ? 20 : 100,
                            maxDoctors: plan === "FREE" ? 2 : plan === "BASIC" ? 10 : 50,
                            monthlyAppointments: plan === "FREE" ? 100 : plan === "BASIC" ? 500 : 5000,
                        }
                    }
                },
            });

            await tx.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: UserRole.ADMIN, // Admin for this tenant
                    tenantId: tenant.id,
                }
            });
        });

        revalidatePath("/admin/tenants");
        return { success: true, message: "Tenant created successfully!" };

    } catch (error) {
        console.error("Create Tenant Error:", error);
        return { success: false, message: "Failed to create tenant." };
    }
}

export async function updateTenantBranding(tenantId: string, branding: any) {
    try {
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { branding }
        });
        revalidatePath(`/admin/tenants/${tenantId}`);
        revalidatePath("/admin/tenants");
        return { success: true };
    } catch (error) {
        console.error("Update Branding Error:", error);
        return { success: false, message: "Failed to update branding" };
    }
}

export async function updateTenantSettings(tenantId: string, settings: any) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
        return { success: false, message: "Unauthorized." };
    }

    try {
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { settings }
        });

        // Audit Logging
        await createAuditLog({
            action: AuditAction.TENANT_MODULE_TOGGLE,
            entity: 'Tenant',
            entityId: tenantId,
            details: { settings },
            userId: session.user.id,
            tenantId: tenantId
        });

        revalidatePath(`/admin/tenants/${tenantId}`);
        revalidatePath("/admin/tenants");
        return { success: true };
    } catch (error) {
        console.error("Update Settings Error:", error);
        return { success: false, message: "Failed to update settings" };
    }
}
export async function updateTenant(tenantId: string, data: Partial<z.infer<typeof createTenantSchema>>) {
    try {
        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: data.name,
                plan: data.plan as PlanType,
            }
        });
        revalidatePath("/admin/tenants");
        return { success: true, message: "Tenant updated successfully!" };
    } catch (error) {
        console.error("Update Tenant Error:", error);
        return { success: false, message: "Failed to update tenant." };
    }
}

export async function deleteTenant(tenantId: string) {
    try {
        await prisma.tenant.delete({
            where: { id: tenantId }
        });
        revalidatePath("/admin/tenants");
        return { success: true, message: "Tenant deleted successfully!" };
    } catch (error) {
        console.error("Delete Tenant Error:", error);
        return { success: false, message: "Failed to delete tenant." };
    }
}
