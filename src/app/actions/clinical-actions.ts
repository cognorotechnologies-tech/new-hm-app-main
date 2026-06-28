'use server';

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { createAuditLog } from "@/lib/audit-service";
import { AuditAction } from "@prisma/client";

export async function getPatientEHRData(patientId: string, tenantId: string) {
    const session = await auth();
    if (!session || !session.user || !['DOCTOR', 'ADMIN', 'NURSE'].includes(session.user.role)) {
        throw new Error("Unauthorized");
    }

    // Fetch patient profile for medical history
    const profile = await prisma.patientProfile.findUnique({
        where: { id: patientId },
        select: {
            medicalHistory: true,
            dob: true,
            gender: true,
            user: {
                select: { name: true }
            }
        }
    });

    // Fetch recent prescriptions
    const prescriptions = await prisma.prescription.findMany({
        where: { patientId, tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            doctor: {
                include: { user: { select: { name: true } } }
            }
        }
    });

    // Fetch recent lab orders
    const labOrders = await (prisma as any).labOrder.findMany({
        where: { patientId, tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    // Fetch vitals
    let vitals = [];
    try {
        vitals = await (prisma as any).vitals.findMany({
            where: { patientId, tenantId },
            orderBy: { recordedAt: 'desc' },
            take: 10
        });
    } catch (error) {
        console.error("Vitals fetch failed (might need prisma generate):", error);
    }

    return {
        profile,
        prescriptions,
        labOrders,
        vitals
    };
}

export async function recordVitals(formData: FormData) {
    const session = await auth();
    if (!session || !session.user || !['DOCTOR', 'ADMIN', 'NURSE'].includes(session.user.role)) {
        return { error: "Unauthorized" };
    }

    const patientId = formData.get('patientId') as string;
    const tenantId = formData.get('tenantId') as string;
    const appointmentId = formData.get('appointmentId') as string || null;

    const vitalsData = {
        bloodPressure: formData.get('bloodPressure') as string || null,
        heartRate: parseInt(formData.get('heartRate') as string) || null,
        temperature: parseFloat(formData.get('temperature') as string) || null,
        weight: parseFloat(formData.get('weight') as string) || null,
        height: parseFloat(formData.get('height') as string) || null,
        spO2: parseInt(formData.get('spO2') as string) || null,
        respiratoryRate: parseInt(formData.get('respiratoryRate') as string) || null,
        patientId,
        tenantId,
        appointmentId
    };

    try {
        const vitals = await (prisma as any).vitals.create({
            data: vitalsData
        });

        await createAuditLog({
            action: AuditAction.APPOINTMENT_UPDATE,
            entity: 'Vitals',
            entityId: vitals.id,
            details: { vitalsData },
            userId: session.user.id,
            tenantId
        });

        return { success: true, data: vitals };
    } catch (error) {
        console.error("Failed to record vitals:", error);
        return { error: "Failed to record vitals. (Prisma types might need sync)" };
    }
}
