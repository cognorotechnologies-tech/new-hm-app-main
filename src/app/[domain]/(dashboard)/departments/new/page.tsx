import CreateDepartmentForm from "@/components/dashboard/create-department-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NewDepartmentPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Add Department</h2>
            </div>
            <CreateDepartmentForm tenantId={tenant.id} />
        </div>
    );
}
