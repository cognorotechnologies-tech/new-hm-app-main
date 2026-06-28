'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AuditAction } from "@prisma/client";
import { createAuditLog } from "@/lib/audit-service";


const AppointmentSchema = z.object({
    patientId: z.string(),
    doctorId: z.string(),
    date: z.string(), // YYYY-MM-DD
    time: z.string(), // HH:mm
    reason: z.string().optional(),
    tenantId: z.string(),
});

export type AppointmentFormState = {
    errors?: {
        patientId?: string[];
        doctorId?: string[];
        date?: string[];
        time?: string[];
        _form?: string[];
    };
    message?: string;
};

export async function createAppointment(
    prevState: AppointmentFormState,
    formData: FormData
): Promise<AppointmentFormState> {
    const rawData = {
        patientId: formData.get("patientId"),
        doctorId: formData.get("doctorId"),
        date: formData.get("date"),
        time: formData.get("time"),
        reason: formData.get("reason"),
        tenantId: formData.get("tenantId"),
    };

    const validatedFields = AppointmentSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Book Appointment.",
        };
    }

    const { patientId, doctorId, date, time, reason, tenantId } = validatedFields.data;

    try {
        // Validation: If it's a patient booking, ensure they have rights (Self or Dependent)
        // Note: For simplicity in this demo, we assume the frontend sends a valid patientId 
        // that the user has access to. In a real prod app, we'd check against session.user.id

        // Combine Date and Time
        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes duration default

        const appointment = await prisma.appointment.create({
            data: {
                startTime,
                endTime,
                reason,
                status: 'SCHEDULED',
                patientId,
                doctorId,
                tenantId,
            },
            include: {
                patient: {
                    include: {
                        user: true
                    }
                }
            }
        });

        revalidatePath(`/${tenantId}/appointments`);
        revalidatePath(`/${tenantId}/dashboard`);

        // Audit Log with Actor/Subject context
        await createAuditLog({
            action: AuditAction.APPOINTMENT_CREATE,
            entity: 'Appointment',
            entityId: appointment.id,
            details: {
                patientId,
                patientName: appointment.patient.user?.name,
                isDependent: !!appointment.patient.parentId,
                doctorId,
                startTime
            },
            tenantId
        });

        return { message: "Appointment booked successfully." };
    } catch (error: any) {
        console.error(error);
        return {
            message: "Database Error: Failed to Book Appointment.",
        };
    }
}

export async function updateAppointmentStatus(
    id: string,
    status: string,
    tenantId: string
) {
    try {
        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status }
        });

        // Audit Log
        await createAuditLog({
            action: AuditAction.APPOINTMENT_UPDATE,
            entity: 'Appointment',
            entityId: id,
            details: { newStatus: status },
            tenantId
        });

        // Follow-up Automation: If completed, propose a follow-up in 7 days
        if (status === 'COMPLETED') {
            const current = await (prisma as any).appointment.findUnique({
                where: { id },
                include: { patient: true, doctor: true }
            });

            if (current) {
                const followUpTime = new Date(current.startTime);
                followUpTime.setDate(followUpTime.getDate() + 7);

                const followUp = await prisma.appointment.create({
                    data: {
                        startTime: followUpTime,
                        endTime: new Date(followUpTime.getTime() + 30 * 60000),
                        status: 'PROPOSED',
                        reason: `Follow-up: ${current.reason || 'General Consultation'}`,
                        patientId: current.patientId,
                        doctorId: current.doctorId,
                        tenantId: current.tenantId
                    }
                });

                await createAuditLog({
                    action: AuditAction.APPOINTMENT_CREATE,
                    entity: 'Appointment',
                    entityId: followUp.id,
                    details: { followUpDate: followUpTime, triggeredBy: id },
                    tenantId: current.tenantId
                });
            }
        }

        revalidatePath(`/${tenantId}/dashboard`);
        revalidatePath(`/${tenantId}/appointments`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to update status." };
    }
}
export async function deleteAppointment(appointmentId: string, tenantId: string) {
    try {
        await prisma.appointment.delete({
            where: { id: appointmentId }
        });

        await createAuditLog({
            action: AuditAction.APPOINTMENT_CANCEL,
            entity: 'Appointment',
            entityId: appointmentId,
            tenantId
        });

        revalidatePath(`/appointments`);
        return { success: true, message: "Appointment cancelled and removed." };
    } catch (error) {
        console.error("Delete Appointment Error:", error);
        return { success: false, message: "Failed to delete appointment." };
    }
}
