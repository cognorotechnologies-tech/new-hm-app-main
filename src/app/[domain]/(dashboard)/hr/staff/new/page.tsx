import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CreateStaffForm from "@/components/dashboard/create-staff-form";

export default async function NewStaffPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return notFound();

    const departments = await prisma.department.findMany({
        where: { tenantId: tenant.id },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-8 pb-12">
            <CreateStaffForm
                tenantId={tenant.id}
                departments={departments}
            />
        </div>
    );
}
