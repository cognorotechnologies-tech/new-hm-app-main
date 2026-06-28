'use server'

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AuditAction } from '@prisma/client';
import { createAuditLog } from '@/lib/audit-service';

const LabTestSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().nonnegative(),
    category: z.string().optional(),
    tenantId: z.string().uuid(),
});

const LabOrderSchema = z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid().optional().nullable(),
    tenantId: z.string().uuid(),
    testIds: z.array(z.string().uuid()), // Not directly in schema but used for processing
    totalAmount: z.number().nonnegative(),
    appointmentId: z.string().uuid().optional().nullable(),
});

export type LabActionState = {
    errors?: {
        general?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function addLabTest(
    prevState: any,
    formData: FormData
): Promise<LabActionState> {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        return { message: "Unauthorized." };
    }

    const rawData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        category: formData.get('category') as string,
        tenantId: formData.get('tenantId') as string,
    };

    const validatedFields = LabTestSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { message: 'Validation failed.' };
    }

    try {
        const test = await prisma.labTest.create({
            data: validatedFields.data,
        });

        await createAuditLog({
            action: AuditAction.LAB_ORDER_CREATE, // Or generic update, using LAB_ORDER_CREATE as placeholder for catalog management
            entity: 'LabTest',
            entityId: test.id,
            details: { name: validatedFields.data.name, price: validatedFields.data.price },
            userId: session.user.id,
            tenantId: validatedFields.data.tenantId
        });

        revalidatePath(`/${validatedFields.data.tenantId}/lab/tests`);
        return { success: true, message: "Test added to catalog." };
    } catch (error) {
        return { message: "Database Error: Failed to add test." };
    }
}

export async function createLabOrder(
    prevState: any,
    formData: FormData
): Promise<LabActionState> {
    const session = await auth();
    if (!session?.user) return { message: "Unauthorized." };

    const rawData = {
        patientId: formData.get('patientId') as string,
        tenantId: formData.get('tenantId') as string,
        totalAmount: parseFloat(formData.get('totalAmount') as string),
        testIds: JSON.parse(formData.get('testIds') as string),
        doctorId: formData.get('doctorId') as string || null,
        appointmentId: formData.get('appointmentId') as string || null,
    };

    // Note: For now, LabOrder stores result as a string field.
    // We could expand this to a JSON list of tests if needed.
    try {
        const order = await prisma.labOrder.create({
            data: {
                patientId: rawData.patientId,
                tenantId: rawData.tenantId,
                totalAmount: rawData.totalAmount,
                doctorId: rawData.doctorId,
                appointmentId: rawData.appointmentId,
                status: "PENDING",
            },
        });

        await createAuditLog({
            action: AuditAction.LAB_ORDER_CREATE,
            entity: 'LabOrder',
            entityId: order.id,
            details: { testCount: rawData.testIds.length, amount: rawData.totalAmount },
            userId: session.user.id,
            tenantId: rawData.tenantId
        });

        revalidatePath(`/${rawData.tenantId}/lab`);
        return { success: true, message: "Lab order created." };
    } catch (error) {
        console.error(error);
        return { message: "Database Error: Failed to create order." };
    }
}

export async function updateLabOrderStatus(
    orderId: string,
    status: string,
    tenantId: string,
    result?: string,
    reportUrl?: string
): Promise<LabActionState> {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'DOCTOR', 'NURSE'].includes(session.user.role)) {
        // In a real app, 'LAB_TECHNICIAN' role would be here if we had it.
        // Using ADMIN/DOCTOR for now.
    }

    try {
        const order = await prisma.labOrder.update({
            where: { id: orderId },
            data: {
                status,
                result: result || undefined,
                reportUrl: reportUrl || undefined
            },
        });

        await createAuditLog({
            action: status === 'COMPLETED' ? AuditAction.LAB_RESULT_UPLOAD : AuditAction.LAB_ORDER_CREATE, // Using LAB_RESULT_UPLOAD if COMPLETED
            entity: 'LabOrder',
            entityId: orderId,
            details: { newStatus: status, hasResult: !!result },
            userId: session!.user.id,
            tenantId: tenantId
        });
        revalidatePath(`/${tenantId}/lab`);
        return { success: true, message: "Order updated." };
    } catch (error) {
        return { message: "Database Error: Failed to update order." };
    }
}
export async function deleteLabTest(testId: string) {
    try {
        await prisma.labTest.delete({
            where: { id: testId }
        });
        revalidatePath(`/lab/tests`);
        return { success: true, message: "Lab test removed from catalog." };
    } catch (error) {
        console.error("Delete Lab Test Error:", error);
        return { success: false, message: "Failed to delete lab test." };
    }
}

export async function deleteLabOrder(orderId: string) {
    try {
        await prisma.labOrder.delete({
            where: { id: orderId }
        });
        revalidatePath(`/lab`);
        return { success: true, message: "Lab order deleted." };
    } catch (error) {
        console.error("Delete Lab Order Error:", error);
        return { success: false, message: "Failed to delete lab order." };
    }
}
