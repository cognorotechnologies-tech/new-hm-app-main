import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const url = req.nextUrl;
    let hostname = req.headers.get("host") || "";

    // Remove port if present (for localhost)
    hostname = hostname.replace("www.", "");
    // Handle localhost port
    if (hostname.includes(":")) {
        hostname = hostname.split(":")[0];
    }

    const searchParams = req.nextUrl.searchParams.toString();
    // Get the pathname of the request (e.g. /, /about, /blog/first-post)
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
        }`;

    // Environment dependent base domain
    const publicDomain = "localhost"; // TODO: Move to env var

    // Check if the hostname is the main domain or a subdomain
    const isPublicDomain = hostname === publicDomain;

    // Extract subdomain
    const subdomain = isPublicDomain ? null : hostname.split(".")[0];

    console.log("Middleware Debug:", { url: url.href, hostname, subdomain, path });

    // Rewrite for App/Dashboard (Subdomains)
    if (subdomain) {
        const rewriteUrl = new URL(`/${subdomain}${path}`, req.url);
        console.log("Rewriting to:", rewriteUrl.href);
        return NextResponse.rewrite(rewriteUrl);
    }

    // Rewrite for Landing Page (Public Domain)
    // If we are on the main domain, we show the (site) content.
    // We can rewrite to /site for clarity or just let it fall through if file structure handles it.
    // Given: src/app/(site)/page.tsx -> accessible at /
    // src/app/(dashboard)/layout.tsx -> accessible at /? No, protected.

    // If we want to strictly separate:
    if (isPublicDomain && url.pathname === "/") {
        // No rewrite needed if (site) is the default page.
        // But we have (site)/page.tsx. 
        // Next.js Route Groups usually handle this without rewrite if folders are set up right.
        // But since we want to handle tenant separation clearly:
        // Let's rewrite strictly? 
        // For now, let's keep it simple: No rewrite for main domain, assume Next.js routing handles it.
        return NextResponse.next();
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
