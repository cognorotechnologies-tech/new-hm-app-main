'use server'

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

const CampaignSchema = z.object({
    title: z.string().min(2),
    type: z.enum(['EMAIL', 'SMS']),
    content: z.string().min(10),
    tenantId: z.string().uuid(),
    scheduledAt: z.coerce.date().optional().nullable(),
});

const SurveySchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    tenantId: z.string().uuid(),
    questions: z.array(z.object({
        question: z.string().min(2),
        type: z.enum(['TEXT', 'RATING', 'MULTIPLE_CHOICE']),
        options: z.string().optional(),
        order: z.number().int(),
    })),
});

export type CampaignActionState = {
    errors?: {
        general?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function createCampaign(
    prevState: any,
    formData: FormData
): Promise<CampaignActionState> {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
        return { message: "Unauthorized." };
    }

    const rawData = {
        title: formData.get('title') as string,
        type: formData.get('type') as 'EMAIL' | 'SMS',
        content: formData.get('content') as string,
        tenantId: formData.get('tenantId') as string,
        scheduledAt: formData.get('scheduledAt') ? new Date(formData.get('scheduledAt') as string) : null,
    };

    const validatedFields = CampaignSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { message: 'Validation failed.' };
    }

    try {
        await prisma.campaign.create({
            data: {
                title: validatedFields.data.title,
                type: validatedFields.data.type,
                content: validatedFields.data.content,
                tenantId: validatedFields.data.tenantId,
                scheduledAt: validatedFields.data.scheduledAt,
                status: 'SCHEDULED',
            },
        });

        revalidatePath(`/${validatedFields.data.tenantId}/hr/campaigns`);
        return { success: true, message: "Campaign created and scheduled." };
    } catch (error) {
        console.error(error);
        return { message: "Database Error: Failed to create campaign." };
    }
}

export async function createSurvey(
    data: z.infer<typeof SurveySchema>
): Promise<CampaignActionState> {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
        return { message: "Unauthorized." };
    }

    const validatedFields = SurveySchema.safeParse(data);

    if (!validatedFields.success) {
        return { message: 'Validation failed.' };
    }

    try {
        await prisma.survey.create({
            data: {
                title: validatedFields.data.title,
                description: validatedFields.data.description,
                tenantId: validatedFields.data.tenantId,
                status: 'ACTIVE',
                questions: {
                    create: validatedFields.data.questions
                }
            },
        });

        revalidatePath(`/${validatedFields.data.tenantId}/hr/surveys`);
        return { success: true, message: "Survey created and activated." };
    } catch (error) {
        console.error(error);
        return { message: "Database Error: Failed to create survey." };
    }
}

export async function submitSurveyResponse(
    surveyId: string,
    answers: any,
    patientId?: string
): Promise<CampaignActionState> {
    try {
        await prisma.surveyResponse.create({
            data: {
                surveyId,
                answers: JSON.stringify(answers),
                patientId,
            },
        });

        return { success: true, message: "Response submitted. Thank you!" };
    } catch (error) {
        console.error(error);
        return { message: "Database Error: Failed to submit response." };
    }
}
