'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DepartmentSchema = z.object({
    name: z.string().min(2, "Department name must be at least 2 characters"),
    description: z.string().optional().nullable(),
    headDoctorId: z.union([z.string(), z.null(), z.literal('')]).optional(), // Handle empty string as optional
    tenantId: z.string().min(1, "Tenant ID is required"),
});

export type DepartmentFormState = {
    errors?: {
        name?: string[];
        description?: string[];
        headDoctorId?: string[];
        tenantId?: string[];
        _form?: string[];
    };
    message?: string;
    data?: any;
};

export async function createDepartment(
    prevState: DepartmentFormState,
    formData: FormData
): Promise<DepartmentFormState> {
    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        headDoctorId: formData.get("headDoctorId"),
        tenantId: formData.get("tenantId"),
    };

    console.log("Create Department Payload:", rawData);

    const validatedFields = DepartmentSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Department Validation Failed:", validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Please check the form for errors.",
        };
    }

    const { name, description, headDoctorId, tenantId } = validatedFields.data;

    try {
        const department = await prisma.department.create({
            data: {
                name,
                description,
                headDoctorId: headDoctorId || null,
                tenantId,
            },
        });

        revalidatePath(`/${tenantId}/departments`);
        return {
            message: "Department created successfully.",
            data: department
        };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return {
                message: "Department with this name already exists.",
            }
        }
        return {
            message: "Database Error: Failed to Create Department.",
        };
    }
}

export async function updateDepartment(departmentId: string, data: any) {
    try {
        await prisma.department.update({
            where: { id: departmentId },
            data: {
                name: data.name,
                description: data.description,
                headDoctorId: data.headDoctorId || null,
            }
        });
        revalidatePath(`/departments`);
        return { success: true, message: "Department updated successfully!" };
    } catch (error) {
        console.error("Update Department Error:", error);
        return { success: false, message: "Failed to update department." };
    }
}

export async function deleteDepartment(departmentId: string) {
    try {
        await prisma.department.delete({
            where: { id: departmentId }
        });
        revalidatePath(`/departments`);
        return { success: true, message: "Department deleted successfully!" };
    } catch (error) {
        console.error("Delete Department Error:", error);
        return { success: false, message: "Failed to delete department." };
    }
}
