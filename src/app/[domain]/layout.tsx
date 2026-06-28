import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function TenantLayout(props: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { children } = props;
    const { domain } = params;
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Dynamic Tenant Branding could go here */}
            {children}
        </div>
    );
}
