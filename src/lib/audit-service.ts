import prisma from './prisma';
import { AuditAction } from '@prisma/client';
import { headers } from 'next/headers';

export async function createAuditLog({
    action,
    entity,
    entityId,
    details,
    userId,
    tenantId
}: {
    action: AuditAction;
    entity: string;
    entityId?: string;
    details?: any;
    userId?: string;
    tenantId: string;
}) {
    try {
        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
        const userAgent = headersList.get('user-agent');

        return await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details: details ? JSON.parse(JSON.stringify(details)) : undefined,
                ipAddress,
                userAgent,
                userId,
                tenantId
            }
        });
    } catch (error) {
        // We don't want audit logging failures to crash the main operation,
        // but we should log them for investigation.
        console.error('Audit Log Error:', error);
    }
}
