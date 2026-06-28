import prisma from "@/lib/prisma";
import { columns, PatientColumn } from "@/components/dashboard/patient-columns";
import { DataTable } from "@/components/ui/data-table";
import { CrudHeader } from "@/components/dashboard/crud-header";

async function getPatients(domain: string): Promise<PatientColumn[]> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
        include: {
            patients: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!tenant) return [];

    return tenant.patients.map(p => ({
        id: p.id,
        name: p.user?.name || "Unknown Patient",
        email: p.user?.email || "",
        phone: p.user?.phone || null,
        dob: p.dob,
        gender: p.gender,
    }));
}

export default async function PatientListPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const patients = await getPatients(domain);

    return (
        <div className="space-y-8 pb-12">
            <CrudHeader
                title="Patient Care Registry"
                description="Monitor and manage clinical records for all registered patients."
                addButtonLabel="Register Patient"
                addHref={`./patients/new`}
                exportHref={`./patients/export`}
            />

            <DataTable
                columns={columns}
                data={patients}
                searchKey="name"
            />
        </div>
    );
}
