'use server';

import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const CreateDoctorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number must be at least 8 characters"),
    specialization: z.string().min(2, "Specialization is required"),
    departmentId: z.string().min(1, "Department is required"),
    licenseNumber: z.string().optional().nullable().or(z.literal('')),
    password: z.string().min(6, "Password must be at least 6 characters"),
    availability: z.any().optional(), // JSON
    tenantId: z.string().min(1, "Tenant ID is required"),
    // New fields
    bio: z.string().optional().nullable().or(z.literal('')),
    qualifications: z.string().optional().nullable().or(z.literal('')),
    experienceYears: z.coerce.number().optional().default(0),
    gender: z.string().optional().nullable().or(z.literal('')),
    consultationFee: z.coerce.number().optional().default(0),
});

export type DoctorFormState = {
    errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        specialization?: string[];
        password?: string[];
        departmentId?: string[];
        tenantId?: string[];
        _form?: string[];
    };
    message?: string;
};

export async function createDoctor(
    prevState: DoctorFormState,
    formData: FormData
): Promise<DoctorFormState> {
    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        specialization: formData.get("specialization"),
        departmentId: formData.get("departmentId"),
        licenseNumber: formData.get("licenseNumber"),
        password: formData.get("password"),
        tenantId: formData.get("tenantId"),
        bio: formData.get("bio"),
        qualifications: formData.get("qualifications"),
        experienceYears: formData.get("experienceYears"),
        gender: formData.get("gender"),
        consultationFee: formData.get("consultationFee"),
    };

    console.log("Create Doctor Payload:", rawData);

    const validatedFields = CreateDoctorSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Doctor Validation Failed:", validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Please check the form for errors.",
        };
    }

    const {
        name, email, phone, specialization, departmentId,
        licenseNumber, password, tenantId,
        bio, qualifications, experienceYears, gender, consultationFee
    } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.$transaction(async (tx) => {
            // 1. Fetch department name to use as specialization if provided 'General Practice'
            const dept = await tx.department.findUnique({
                where: { id: departmentId }
            });
            const finalSpecialization = (specialization === 'General Practice' && dept)
                ? dept.name
                : specialization;

            // 2. Create User
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    phone,
                    password: hashedPassword,
                    role: UserRole.DOCTOR,
                    tenantId,
                },
            });

            // 3. Create Doctor Profile
            await tx.doctorProfile.create({
                data: {
                    userId: user.id,
                    tenantId,
                    specialization: finalSpecialization,
                    departmentId,
                    licenseNumber: licenseNumber || null,
                    availability: {}, // Default empty availability
                    bio: bio || null,
                    qualifications: qualifications || null,
                    experienceYears: experienceYears || 0,
                    gender: gender || null,
                    consultationFee: consultationFee || 0,
                },
            });
        });

        revalidatePath(`/${tenantId}/doctors`);
        return { message: "Doctor created successfully." };
    } catch (error: any) {
        console.error("Database Error:", error);
        if (error.code === 'P2002') {
            return {
                message: "Email already exists in this organization.",
            }
        }
        return {
            message: "Database Error: Failed to Create Doctor.",
        };
    }
}
export async function updateDoctor(doctorId: string, data: any) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Prepare User Update Data
            const userUpdateData: any = {
                name: data.name,
                email: data.email,
                phone: data.phone,
            };

            // 2. Hash password if provided
            if (data.password && data.password.length >= 6) {
                userUpdateData.password = await bcrypt.hash(data.password, 10);
            }

            // 3. Update User
            await tx.user.update({
                where: { id: doctorId },
                data: userUpdateData,
            });

            // 4. Update Doctor Profile
            await tx.doctorProfile.update({
                where: { userId: doctorId },
                data: {
                    specialization: data.specialization,
                    licenseNumber: data.licenseNumber,
                    bio: data.bio,
                    qualifications: data.qualifications,
                    experienceYears: Number(data.experienceYears) || 0,
                    gender: data.gender,
                    consultationFee: Number(data.consultationFee) || 0,
                    departmentId: data.departmentId,
                },
            });
        });

        revalidatePath(`/doctors`);
        return { success: true, message: "Doctor profile updated successfully!" };
    } catch (error) {
        console.error("Update Doctor Error:", error);
        return { success: false, message: "Failed to update doctor profile." };
    }
}

export async function deleteDoctor(doctorId: string) {
    try {
        // Soft delete or hard delete? Let's do hard delete for now as per plan
        await prisma.user.delete({
            where: { id: doctorId }
        });
        revalidatePath(`/doctors`);
        return { success: true, message: "Doctor deleted successfully!" };
    } catch (error) {
        console.error("Delete Doctor Error:", error);
        return { success: false, message: "Failed to delete doctor." };
    }
}
