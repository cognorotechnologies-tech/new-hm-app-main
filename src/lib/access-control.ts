import { getCurrentUser } from "./session";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function requireRole(allowedRoles: UserRole[]) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
        redirect("/unauthorized"); // Or dashboard
    }

    return user;
}

export async function requireTenantConfig() {
    // TODO: Check if tenant exists and is active
    return true;
}
