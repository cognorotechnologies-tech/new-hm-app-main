import CreateDoctorForm from "@/components/dashboard/create-doctor-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NewDoctorPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
        include: {
            departments: true
        }
    });

    if (!tenant) return notFound();

    const departments = tenant.departments.map(d => ({
        id: d.id,
        name: d.name
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Add Doctor</h2>
            </div>
            <CreateDoctorForm tenantId={tenant.id} departments={departments} />
        </div>
    );
}
