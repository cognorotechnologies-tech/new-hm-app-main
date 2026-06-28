'use server'

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { UserRole, AuditAction } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '@/lib/audit-service';

const StaffSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(UserRole),
    departmentId: z.string().uuid().optional().nullable(),
    tenantId: z.string().uuid(),
    salary: z.number().nonnegative().optional().nullable(),
});

const LeaveSchema = z.object({
    staffId: z.string().uuid(),
    tenantId: z.string().uuid(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    type: z.string(),
    reason: z.string().optional(),
});

export type HRActionState = {
    errors?: {
        general?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function addStaffMember(
    prevState: any,
    formData: FormData
): Promise<HRActionState> {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
        return { message: "Unauthorized." };
    }

    const rawData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as UserRole,
        departmentId: formData.get('departmentId') as string || null,
        tenantId: formData.get('tenantId') as string,
        salary: formData.get('salary') ? parseFloat(formData.get('salary') as string) : null,
    };

    const validatedFields = StaffSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { message: 'Validation failed.' };
    }

    try {
        const hashedPassword = await bcrypt.hash(validatedFields.data.password, 10);

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: validatedFields.data.email,
                    password: hashedPassword,
                    role: validatedFields.data.role,
                    name: validatedFields.data.name,
                    tenantId: validatedFields.data.tenantId,
                },
            });

            const staff = await tx.staffProfile.create({
                data: {
                    userId: user.id,
                    tenantId: validatedFields.data.tenantId,
                    departmentId: validatedFields.data.departmentId,
                    salary: validatedFields.data.salary,
                },
            });

            await createAuditLog({
                action: AuditAction.USER_CREATE,
                entity: 'StaffProfile',
                entityId: staff.id,
                details: { role: validatedFields.data.role, departmentId: validatedFields.data.departmentId },
                userId: session.user.id,
                tenantId: validatedFields.data.tenantId,
            });
        });

        revalidatePath(`/${validatedFields.data.tenantId}/hr/staff`);
        return { success: true, message: "Staff member onboarded." };
    } catch (error) {
        console.error(error);
        return { message: "Database Error: Failed to add staff member." };
    }
}

export async function markAttendance(
    staffId: string,
    tenantId: string,
    type: 'IN' | 'OUT'
): Promise<HRActionState> {
    const session = await auth();
    if (!session?.user) return { message: "Unauthorized." };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        if (type === 'IN') {
            await prisma.attendance.create({
                data: {
                    staffId,
                    tenantId,
                    date: today,
                    checkIn: new Date(),
                    status: "PRESENT",
                },
            });
        } else {
            const attendance = await prisma.attendance.findFirst({
                where: {
                    staffId,
                    date: today,
                    checkOut: null,
                },
            });

            if (attendance) {
                await prisma.attendance.update({
                    where: { id: attendance.id },
                    data: { checkOut: new Date() },
                });
            }
        }

        revalidatePath(`/${tenantId}/hr`);
        return { success: true, message: `Clocked ${type.toLowerCase()} successfully.` };
    } catch (error) {
        return { message: "Database Error: Failed to mark attendance." };
    }
}

export async function requestLeave(
    prevState: any,
    formData: FormData
): Promise<HRActionState> {
    const session = await auth();
    if (!session?.user) return { message: "Unauthorized." };

    const rawData = {
        staffId: formData.get('staffId') as string,
        tenantId: formData.get('tenantId') as string,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        type: formData.get('type') as string,
        reason: formData.get('reason') as string,
    };

    const validatedFields = LeaveSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { message: 'Validation failed.' };
    }

    try {
        await prisma.leave.create({
            data: {
                ...validatedFields.data,
                status: "PENDING",
            },
        });

        revalidatePath(`/${validatedFields.data.tenantId}/hr/leaves`);
        return { success: true, message: "Leave request submitted." };
    } catch (error) {
        return { message: "Database Error: Failed to submit leave request." };
    }
}

export async function updateLeaveStatus(
    leaveId: string,
    status: 'APPROVED' | 'REJECTED',
    tenantId: string
): Promise<HRActionState> {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
        return { message: "Unauthorized." };
    }

    try {
        await prisma.leave.update({
            where: { id: leaveId },
            data: { status },
        });

        revalidatePath(`/${tenantId}/hr/leaves`);
        return { success: true, message: `Leave ${status.toLowerCase()}.` };
    } catch (error) {
        return { message: "Database Error: Failed to update leave status." };
    }
}
export async function deleteStaffMember(staffId: string) {
    const session = await auth();
    if (!session?.user) return { success: false, message: "Unauthorized." };

    try {
        await prisma.staffProfile.delete({
            where: { id: staffId }
        });

        await createAuditLog({
            action: AuditAction.USER_DELETE,
            entity: 'StaffProfile',
            entityId: staffId,
            userId: session.user.id,
            tenantId: session.user.tenantId
        });

        revalidatePath(`/hr/staff`);
        return { success: true, message: "Staff record removed." };
    } catch (error) {
        console.error("Delete Staff Error:", error);
        return { success: false, message: "Failed to delete staff member." };
    }
}
