import prisma from "@/lib/prisma";
import { columns, AppointmentColumn } from "@/components/dashboard/appointment-columns";
import { DataTable } from "@/components/ui/data-table";
import { CrudHeader } from "@/components/dashboard/crud-header";
import { auth } from "@/auth";

async function getAppointments(domain: string, userId?: string, role?: string): Promise<AppointmentColumn[]> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return [];

    let whereClause: any = { tenantId: tenant.id };

    if (role === 'DOCTOR' && userId) {
        const doctor = await prisma.doctorProfile.findUnique({
            where: { userId }
        });
        if (doctor) whereClause.doctorId = doctor.id;
    } else if (role === 'PATIENT' && userId) {
        const patient = await prisma.patientProfile.findUnique({
            where: { userId }
        });
        if (patient) whereClause.patientId = patient.id;
    }

    const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } }
        },
        orderBy: { startTime: 'desc' }
    });

    return appointments.map(a => ({
        id: a.id,
        startTime: a.startTime,
        patientName: a.patient.user?.name || "Unknown Patient",
        doctorName: a.doctor.user.name || "Unknown Doctor",
        status: a.status,
        reason: a.reason,
        tenantId: a.tenantId,
    }));
}

export default async function AppointmentListPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;
    const session = await auth();

    const appointments = await getAppointments(domain, session?.user?.id, session?.user?.role);

    return (
        <div className="space-y-8 pb-12">
            <CrudHeader
                title="Clinical Appointments"
                description="Coordinate patient visits and specialist scheduling."
                addButtonLabel="New Appointment"
                addHref={`./appointments/new`}
            />

            <DataTable
                columns={columns}
                data={appointments}
                searchKey="patientName"
            />
        </div>
    );
}
