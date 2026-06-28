import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditDoctorForm from "@/components/dashboard/edit-doctor-form";

export default async function EditDoctorPage(props: {
    params: Promise<{ domain: string; id: string }>;
}) {
    const params = await props.params;
    const { domain, id } = params;

    const doctor = await prisma.user.findUnique({
        where: { id },
        include: {
            doctorProfile: true,
        }
    });

    if (!doctor || doctor.role !== "DOCTOR") {
        return notFound();
    }

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain }
    });

    if (!tenant) return notFound();

    const departments = await prisma.department.findMany({
        where: { tenantId: tenant.id }
    });

    return (
        <div className="space-y-8 pb-12">
            <EditDoctorForm doctor={doctor} departments={departments} />
        </div>
    );
}
