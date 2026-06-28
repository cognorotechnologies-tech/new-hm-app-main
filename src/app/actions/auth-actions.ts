'use server';

import { signIn, signOut, auth } from '@/auth';
import { UserRole, AuditAction } from "@prisma/client"
import { AuthError } from 'next-auth';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-service';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    const data = Object.fromEntries(formData);
    const slug = data.slug as string;
    const ip = '127.0.0.1'; // In production, use headers to get IP

    // Pre-fetch tenant to avoid FK issues in audit logging and to validate slug early
    const tenant = await (prisma as any).tenant.findUnique({
        where: { slug }
    });

    if (!tenant && slug !== 'system') {
        return 'Invalid organization slug.';
    }

    // Rate Limiting: Check for too many failures in last 15 mins for this IP
    const recentFailures = await prisma.auditLog.count({
        where: {
            action: AuditAction.USER_LOGIN, // We should track failures specifically or check details
            details: { path: ['ip'], equals: ip },
            createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
        }
    });

    if (recentFailures >= 5) {
        return 'Too many login attempts. Please try again later.';
    }

    try {
        let redirectTo = '/dashboard';
        if (slug === 'system') {
            redirectTo = '/admin';
        } else {
            // Redirect to tenant subdomain
            redirectTo = `http://${slug}.localhost:3000/dashboard`;
        }

        // Remove redirect: false to allow NextAuth to throw the native redirect error
        await signIn('credentials', { ...data, redirectTo });

        return undefined; // Usually unreachable as signIn throws on success/redirect
    } catch (error: any) {
        // Handle next-auth redirect behavior
        if (error.message === 'NEXT_REDIRECT' || error.name === 'NextRedirect') {
            throw error;
        }

        // NextAuth throws AuthError for sign-in failures
        if (error instanceof AuthError) {
            if (tenant) {
                await createAuditLog({
                    action: AuditAction.USER_LOGIN,
                    entity: 'User',
                    details: { ip, email: data.email, status: 'FAILURE', reason: error.type },
                    tenantId: tenant.id
                });
            }

            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }

        // IMPORTANT: Rethrow error if it is NOT an AuthError
        // This includes Next.js internal redirect errors which MUST be rethrown
        throw error;
    }
}

export async function logout() {
    const session = await auth();
    let redirectTo = '/login';

    if (session?.user) {
        try {
            await createAuditLog({
                action: AuditAction.USER_LOGOUT,
                entity: 'User',
                userId: session.user.id,
                tenantId: session.user.tenantId
            });

            await prisma.session.deleteMany({
                where: { userId: session.user.id }
            });

            // Determine redirect URL based on tenant
            if (session.user.tenantId) {
                const tenant = await (prisma as any).tenant.findUnique({
                    where: { id: session.user.tenantId },
                    select: { slug: true }
                });

                if (tenant?.slug) {
                    redirectTo = `http://${tenant.slug}.localhost:3000/login`;
                } else if (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN') {
                    // potentially system admin
                    redirectTo = '/login';
                }
            }

        } catch (e) {
            console.error('Logout failed', e);
        }
    }
    await signOut({ redirectTo });
}
