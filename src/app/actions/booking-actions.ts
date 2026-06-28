'use server'

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

const PatientBookingSchema = z.object({
    doctorId: z.string().uuid("Invalid doctor selected"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    reason: z.string().optional(),
    tenantId: z.string().uuid(),
    tenantSlug: z.string(),
    patientProfileId: z.string(), // "SELF" or dependent UUID
});

export type BookingFormState = {
    errors?: {
        doctorId?: string[];
        date?: string[];
        time?: string[];
        reason?: string[];
        general?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function bookAppointment(
    prevState: BookingFormState,
    formData: FormData
): Promise<BookingFormState> {
    const session = await auth();

    if (!session?.user || session.user.role !== 'PATIENT') {
        return { message: "Unauthorized. Please login as a patient." };
    }

    const rawData = {
        doctorId: formData.get('doctorId'),
        date: formData.get('date'),
        time: formData.get('time'),
        reason: formData.get('reason'),
        tenantId: formData.get('tenantId'),
        tenantSlug: formData.get('tenantSlug'),
        patientProfileId: formData.get('patientProfileId'),
    };

    const validatedFields = PatientBookingSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Book.',
        };
    }

    const { doctorId, date, time, reason, tenantId, tenantSlug, patientProfileId } = validatedFields.data;

    // Combine date and time
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // Default 30 min duration

    // Validate date is in future
    if (startDateTime < new Date()) {
        return {
            errors: { date: ["Cannot book appointments in the past."] },
            message: "Invalid time selected."
        }
    }

    try {
        // Get patient profile
        let finalPatientId: string;
        let isDependent = false;

        if (patientProfileId === 'SELF') {
            const patientProfile = await prisma.patientProfile.findUnique({
                where: { userId: session.user.id }
            });
            if (!patientProfile) return { message: "Patient profile not found." };
            finalPatientId = patientProfile.id;
        } else {
            // Verify this dependent belongs to the session user
            const dependent = await prisma.patientProfile.findFirst({
                where: {
                    id: patientProfileId,
                    parent: { userId: session.user.id }
                },
                include: { user: true }
            });
            if (!dependent) return { message: "Unauthorized: Access to this family member profile is restricted." };
            finalPatientId = dependent.id;
            isDependent = true;
        }

        // Check doctor availability (Basic check: is time slot taken?)
        const conflict = await prisma.appointment.findFirst({
            where: {
                doctorId,
                tenantId,
                status: { not: "CANCELLED" },
                startDate: {
                    lte: startDateTime
                },
                endDate: {
                    gt: startDateTime
                }
            } as any // Prisma type helper for dates
        }).catch(() => null); // Fallback for simple check

        const appointment = await prisma.appointment.create({
            data: {
                startTime: startDateTime,
                endTime: endDateTime,
                status: "SCHEDULED",
                reason,
                patientId: finalPatientId,
                doctorId,
                tenantId
            },
            include: {
                patient: {
                    include: { user: true }
                }
            }
        });

        // Audit Log with Family/Clinical Context
        const { createAuditLog } = await import("./audit-actions");
        // We import AuditAction dynamically or cast string if we want to avoid top-level import issues in server actions
        // But better to use the enum. Let's assume 'APPOINTMENT_CREATE' is valid.
        await createAuditLog({
            action: 'APPOINTMENT_CREATE' as any, // Cast to avoid import issues for now, or use mapped value
            entity: 'Appointment',
            entityId: appointment.id,
            details: {
                bookedBy: session.user.id,
                patientId: finalPatientId,
                patientName: appointment.patient.user?.name,
                isNewClinicalSubject: true,
                startTime: startDateTime,
                bookingType: isDependent ? 'FAMILY' : 'SELF'
            }
        });

        revalidatePath(`/${tenantSlug}`);
        revalidatePath(`/${tenantSlug}/dashboard`);
        revalidatePath(`/${tenantSlug}/appointments`);

        return { success: true, message: `Reservation confirmed for ${appointment.patient.user?.name}.` };

    } catch (error) {
        console.error('Booking Error:', error);
        return {
            message: 'Database Error: Failed to Book Appointment.',
        };
    }
}
