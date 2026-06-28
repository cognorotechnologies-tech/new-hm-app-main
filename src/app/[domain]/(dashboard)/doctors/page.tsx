import prisma from "@/lib/prisma";
import { columns, DoctorColumn } from "@/components/dashboard/doctor-columns";
import { DataTable } from "@/components/ui/data-table";
import { CrudHeader } from "@/components/dashboard/crud-header";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getDoctors(domain: string): Promise<DoctorColumn[]> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
        include: {
            users: {
                where: { role: "DOCTOR" },
                include: {
                    doctorProfile: true,
                }
            }
        }
    });

    if (!tenant) return [];

    return tenant.users.map(u => ({
        id: u.id,
        name: u.name || "Unknown Doctor",
        email: u.email || "",
        phone: u.phone,
        specialization: u.doctorProfile?.specialization || "General Medicine",
        licenseNumber: u.doctorProfile?.licenseNumber || null,
    }));
}

export default async function DoctorListPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const doctors = await getDoctors(domain);

    if (doctors.length === 0 && domain) {
        // Double check tenant exists
        const t = await prisma.tenant.findUnique({ where: { slug: domain } });
        if (!t) return null;
    }

    return (
        <div className="space-y-8 pb-12">
            <CrudHeader
                title="Medical Staff"
                description="Coordinate your clinical team and specializations."
                addButtonLabel="Add Doctor"
                addHref={`./doctors/new`}
            />

            <DataTable
                columns={columns}
                data={doctors}
                searchKey="name"
            />
        </div>
    );
}
