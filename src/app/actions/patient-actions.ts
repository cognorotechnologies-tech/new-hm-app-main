'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const RegisterPatientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    dob: z.string().optional(), // YYYY-MM-DD
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    tenantId: z.string().uuid(),
})

export type RegisterPatientState = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        phone?: string[];
        general?: string[];
    };
    message?: string;
    success?: boolean;
}

export async function registerPatient(
    prevState: RegisterPatientState,
    formData: FormData
): Promise<RegisterPatientState> {
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        dob: formData.get('dob'),
        gender: formData.get('gender'),
        tenantId: formData.get('tenantId'),
    }

    const validatedFields = RegisterPatientSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Register.',
        }
    }

    const { name, email, password, phone, dob, gender, tenantId } = validatedFields.data

    try {
        // Check if user already exists in this tenant
        const existingUser = await prisma.user.findUnique({
            where: {
                email_tenantId: {
                    email,
                    tenantId
                }
            }
        })

        if (existingUser) {
            return {
                errors: { email: ['Email already exists for this organization.'] },
                message: 'User already exists.'
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    role: 'PATIENT',
                    tenantId
                }
            })

            // 2. Create Patient Profile
            await tx.patientProfile.create({
                data: {
                    userId: user.id,
                    tenantId,
                    gender: gender || null,
                    dob: dob ? new Date(dob) : null
                }
            })
        })

    } catch (error) {
        console.error('Registration Error:', error)
        return {
            message: 'Database Error: Failed to Register.',
        }
    }

    // Return success to trigger client-side redirect
    return { success: true, message: "Registration successful!" }
}
export async function updatePatient(patientId: string, data: any) {
    try {
        await prisma.$transaction(async (tx) => {
            // Update User
            await tx.user.update({
                where: { id: patientId },
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                },
            });

            // Update Patient Profile
            await tx.patientProfile.update({
                where: { userId: patientId },
                data: {
                    gender: data.gender,
                    dob: data.dob ? new Date(data.dob) : null,
                },
            });
        });

        revalidatePath(`/patients`);
        return { success: true, message: "Patient updated successfully!" };
    } catch (error) {
        console.error("Update Patient Error:", error);
        return { success: false, message: "Failed to update patient." };
    }
}

export async function deletePatient(patientId: string) {
    try {
        await prisma.user.delete({
            where: { id: patientId }
        });
        revalidatePath(`/patients`);
        return { success: true, message: "Patient record deleted successfully!" };
    } catch (error) {
        console.error("Delete Patient Error:", error);
        return { success: false, message: "Failed to delete patient." };
    }
}

export async function addDependent(parentId: string, data: { name: string, dob: string, relationship: string }) {
    try {
        const parent = await prisma.patientProfile.findUnique({
            where: { userId: parentId },
            include: { tenant: true }
        });

        if (!parent) return { success: false, message: "Parent profile not found" };

        await prisma.user.create({
            data: {
                name: data.name,
                email: `dep_${Math.random().toString(36).substring(7)}@bharticlinic.internal`,
                password: 'nopassword_dependent',
                role: UserRole.PATIENT,
                tenantId: parent.tenantId,
                patientProfile: {
                    create: {
                        tenantId: parent.tenantId,
                        parentId: parent.id,
                        dob: new Date(data.dob),
                        relationship: data.relationship,
                    }
                }
            }
        });

        revalidatePath('/dashboard');
        return { success: true, message: "Dependent added successfully" };
    } catch (error) {
        console.error("Add Dependent Error:", error);
        return { success: false, message: "Failed to add dependent" };
    }
}
