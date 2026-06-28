'use server'

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

const InventorySchema = z.object({
    name: z.string().min(2, "Name is required"),
    category: z.string().optional(),
    quantity: z.number().int().nonnegative("Quantity must be non-negative"),
    unit: z.string().optional(),
    reorderLevel: z.number().int().nonnegative().default(10),
    expiryDate: z.string().optional().nullable(),
    tenantId: z.string().uuid(),
});

export type InventoryState = {
    errors?: {
        name?: string[];
        quantity?: string[];
        general?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function addInventoryItem(
    prevState: InventoryState,
    formData: FormData
): Promise<InventoryState> {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'].includes(session.user.role)) {
        return { message: "Unauthorized." };
    }

    const rawData = {
        name: formData.get('name'),
        category: formData.get('category'),
        quantity: parseInt(formData.get('quantity') as string) || 0,
        unit: formData.get('unit'),
        reorderLevel: parseInt(formData.get('reorderLevel') as string) || 10,
        expiryDate: formData.get('expiryDate') || null,
        tenantId: formData.get('tenantId'),
    };

    const validatedFields = InventorySchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Add Item.',
        };
    }

    const { name, category, quantity, unit, reorderLevel, expiryDate, tenantId } = validatedFields.data;

    try {
        await prisma.inventory.create({
            data: {
                name,
                category,
                quantity,
                unit,
                reorderLevel,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                tenantId
            }
        });

        revalidatePath(`/${tenantId}/inventory`);
        return { success: true, message: "Item added successfully." };
    } catch (error) {
        console.error('Inventory Error:', error);
        return { message: "Database Error: Failed to Add Item." };
    }
}
export async function updateInventoryItem(itemId: string, data: any) {
    try {
        await prisma.inventory.update({
            where: { id: itemId },
            data: {
                name: data.name,
                category: data.category,
                quantity: data.quantity,
                unit: data.unit,
                reorderLevel: data.reorderLevel,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
            }
        });
        revalidatePath(`/inventory`);
        return { success: true, message: "Item updated successfully!" };
    } catch (error) {
        console.error("Update Inventory Error:", error);
        return { success: false, message: "Failed to update item." };
    }
}

export async function deleteInventoryItem(itemId: string) {
    try {
        await prisma.inventory.delete({
            where: { id: itemId }
        });
        revalidatePath(`/inventory`);
        return { success: true, message: "Item deleted successfully!" };
    } catch (error) {
        console.error("Delete Inventory Error:", error);
        return { success: false, message: "Failed to delete item." };
    }
}
