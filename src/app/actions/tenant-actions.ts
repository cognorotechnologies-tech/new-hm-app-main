'use server'

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createAuditLog } from "@/lib/audit-service";
import { AuditAction } from "@prisma/client";

/**
 * Updates the enabled modules for a specific tenant.
 * Restricted to SUPER_ADMIN role.
 */
export async function updateTenantModules(tenantId: string, modules: Record<string, boolean>) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
        return { success: false, message: "Unauthorized. Super Admin access required." };
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) return { success: false, message: "Tenant not found." };

        const currentSettings = (tenant.settings as any) || {};

        // Merge module configurations
        const newSettings = {
            ...currentSettings,
            modules: {
                ...(currentSettings.modules || {}),
                ...Object.fromEntries(
                    Object.entries(modules).map(([key, value]) => [key, { enabled: value }])
                )
            }
        };

        await prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: newSettings }
        });

        // Log the security-sensitive change
        await createAuditLog({
            action: AuditAction.TENANT_MODULE_TOGGLE,
            entity: 'Tenant',
            entityId: tenantId,
            details: { changedModules: modules },
            userId: session.user.id,
            tenantId: tenantId // Context of the systemic change
        });

        revalidatePath(`/admin/organizations`); // For Super Admin view
        revalidatePath(`/${tenant.slug}/dashboard`); // For Tenant view

        return { success: true, message: "Tenant modules updated successfully." };
    } catch (error) {
        console.error("Update Modules Error:", error);
        return { success: false, message: "Failed to update modules. Database error." };
    }
}

/**
 * Updates the visual identity (branding) for a tenant.
 * Restricted to tenant ADMIN or SUPER_ADMIN.
 */
export async function updateOwnBranding(tenantId: string, branding: any) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        return { success: false, message: "Unauthorized. Admin access required." };
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) return { success: false, message: "Tenant not found." };

        // Security check for non-super admins (tenantId is available in session)
        if (session.user.role !== 'SUPER_ADMIN' && session.user.tenantId !== tenant.id) {
            console.error("Unauthorized Branding Update:", {
                userRole: session.user.role,
                userTenantId: session.user.tenantId,
                targetTenantId: tenant.id
            });
            return { success: false, message: "Unauthorized. You can only manage your own organization's branding." };
        }

        await prisma.tenant.update({
            where: { id: tenantId },
            data: { branding }
        });

        await createAuditLog({
            action: AuditAction.TENANT_UPDATE,
            entity: 'Tenant',
            entityId: tenantId,
            details: { branding },
            userId: session.user.id,
            tenantId
        });

        revalidatePath(`/${tenant.slug}/settings`);
        return { success: true, message: "Branding updated successfully!" };
    } catch (error) {
        console.error("Update Branding Error:", error);
        return { success: false, message: "Failed to update branding." };
    }
}

/**
 * Marks the tenant setup as completed.
 */
export async function completeSetup(tenantId: string) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        return { success: false, message: "Unauthorized." };
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) return { success: false, message: "Tenant not found." };

        const currentSettings = (tenant.settings as any) || {};
        const newSettings = {
            ...currentSettings,
            setupCompleted: true
        };

        await prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: newSettings }
        });

        await createAuditLog({
            action: AuditAction.TENANT_UPDATE,
            entity: 'Tenant',
            entityId: tenantId,
            details: { setupCompleted: true },
            userId: session.user.id,
            tenantId
        });

        revalidatePath(`/${tenant.slug}/dashboard`);
        return { success: true };
    } catch (error) {
        console.error("Complete Setup Error:", error);
        return { success: false, message: "Failed to finalize setup." };
    }
}
