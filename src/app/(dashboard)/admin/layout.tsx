import AdminSidebar from "@/components/admin/sidebar";
import { Metadata } from "next";
import { requireRole } from "@/lib/access-control";
import { UserRole } from "@prisma/client";

export const metadata: Metadata = {
    title: "Super Admin Portal | HealthManager",
    description: "Manage tenants and system settings.",
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireRole([UserRole.SUPER_ADMIN]);

    return (
        <div className="min-h-screen bg-mesh pl-64 transition-all duration-500">
            <AdminSidebar />
            <main className="p-10 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
