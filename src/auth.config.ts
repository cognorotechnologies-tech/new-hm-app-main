import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Redirect authenticated users to dashboard if they visit login page
                // But we need to handle tenant specific logic here eventually
                // For now, let's keep it simple
                return true;
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;

            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;

            // Allow subdomains of localhost
            if (url.includes('localhost') && baseUrl.includes('localhost')) {
                return url;
            }

            return baseUrl;
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
