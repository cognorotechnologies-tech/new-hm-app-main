'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AuditAction } from "@prisma/client";
import { createAuditLog } from "@/lib/audit-service";
import { auth } from "@/auth";

const MedicationSchema = z.object({
    name: z.string().min(1, "Medication name is required"),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    duration: z.string().min(1, "Duration is required"),
});

const PrescriptionSchema = z.object({
    appointmentId: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    medications: z.array(MedicationSchema).min(1, "At least one medication is required"),
    notes: z.string().optional(),
    tenantId: z.string(),
});

export type PrescriptionFormState = {
    errors?: {
        diagnosis?: string[];
        medications?: string[]; // Simplified error handling for array
        notes?: string[];
        _form?: string[];
    };
    message?: string;
};

export async function createPrescription(
    prevState: PrescriptionFormState,
    formData: FormData
): Promise<PrescriptionFormState> {
    // Parse medications from JSON string (client will stringify)
    let medications = [];
    try {
        const medsString = formData.get("medications") as string;
        medications = JSON.parse(medsString);
    } catch (e) {
        return { message: "Invalid medication data." };
    }

    const rawData = {
        appointmentId: formData.get("appointmentId"),
        patientId: formData.get("patientId"),
        doctorId: formData.get("doctorId"),
        diagnosis: formData.get("diagnosis"),
        medications: medications,
        notes: formData.get("notes"),
        tenantId: formData.get("tenantId"),
    };

    const validatedFields = PrescriptionSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error(validatedFields.error);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Prescription.",
        };
    }

    const { appointmentId, patientId, doctorId, diagnosis, medications: medsData, notes, tenantId } = validatedFields.data;

    try {
        const session = await auth();
        await prisma.$transaction(async (tx) => {
            // 1. Create Prescription
            const prescription = await tx.prescription.create({
                data: {
                    appointmentId,
                    patientId,
                    doctorId,
                    diagnosis,
                    medications: medsData, // Prisma handles JSON
                    notes,
                    tenantId,
                },
            });

            // 2. Update Appointment Status
            await tx.appointment.update({
                where: { id: appointmentId },
                data: { status: 'COMPLETED' }
            });

            // 3. Audit Log
            await createAuditLog({
                action: AuditAction.PRESCRIPTION_CREATE,
                entity: 'Prescription',
                entityId: prescription.id,
                details: { diagnosis, medicationCount: medsData.length },
                userId: session?.user?.id,
                tenantId: tenantId
            });
        });

        revalidatePath(`/${tenantId}/appointments/${appointmentId}`);
        revalidatePath(`/${tenantId}/appointments`);
        return { message: "Prescription created successfully." };
    } catch (error: any) {
        console.error(error);
        return {
            message: "Database Error: Failed to Create Prescription.",
        };
    }
}
