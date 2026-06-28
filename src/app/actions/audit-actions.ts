'use server';

import { auth } from "@/auth";
import { AuditAction } from "@prisma/client";
import { createAuditLog as lowLevelCreateAuditLog } from "@/lib/audit-service";

export async function createAuditLog(data: {
    action: AuditAction;
    entity: string;
    entityId?: string;
    details?: any;
}) {
    try {
        const session = await auth();
        // Allow logging even without session if it's a login attempt, but for now we focus on authenticated actions
        if (!session?.user) return;

        await lowLevelCreateAuditLog({
            ...data,
            userId: session.user.id,
            tenantId: session.user.tenantId,
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}
