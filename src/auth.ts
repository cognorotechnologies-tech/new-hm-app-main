import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

async function getUser(email: string, tenantId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email_tenantId: {
                    email,
                    tenantId
                }
            }
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

// Augment NextAuth types
declare module "next-auth" {
    interface User {
        id: string
        role: string // UserRole
        tenantId: string
    }
    interface Session {
        user: User & {
            id: string
            role: string // UserRole
            tenantId: string
        }
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    trustHost: true,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("Authorize called with:", { ...credentials, password: '***' });
                const parsedCredentials = z
                    .object({
                        email: z.string().email(),
                        password: z.string().min(6),
                        slug: z.string().optional()
                    })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password, slug } = parsedCredentials.data;

                    if (!slug) {
                        return null;
                    }

                    const tenant = await prisma.tenant.findUnique({
                        where: { slug }
                    });

                    if (!tenant) {
                        return null;
                    }

                    const user = await getUser(email, tenant.id);
                    if (!user) {
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password as string);
                    if (passwordsMatch) {
                        return user;
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                console.log('JWT Callback: User found, creating session', user.id);
                token.id = user.id;
                token.role = user.role;
                token.tenantId = user.tenantId;

                // Active session tracking
                try {
                    await (prisma as any).session.create({
                        data: {
                            userId: user.id,
                            tenantId: user.tenantId,
                            token: token.jti as string || Math.random().toString(36),
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                        }
                    });
                } catch (e) {
                    console.error('Session tracking failed', e);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.tenantId = token.tenantId as string;
            }
            return session;
        }
    }
});
