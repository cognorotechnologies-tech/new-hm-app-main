import prisma from "@/lib/prisma";
import { columns, StaffColumn } from "@/components/dashboard/staff-columns";
import { DataTable } from "@/components/ui/data-table";
import { CrudHeader } from "@/components/dashboard/crud-header";

async function getStaff(domain: string): Promise<StaffColumn[]> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return [];

    const staff = await prisma.staffProfile.findMany({
        where: { tenantId: tenant.id },
        include: {
            user: true,
            department: true
        },
        orderBy: { joiningDate: 'desc' }
    });

    return staff.map(s => ({
        id: s.id,
        name: s.user.name || "Unknown Staff",
        role: s.user.role,
        departmentName: s.department?.name || "Unassigned",
        email: s.user.email || "No Email",
        phone: s.user.phone,
        joiningDate: s.joiningDate,
    }));
}

export default async function StaffPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const staff = await getStaff(domain);

    return (
        <div className="space-y-8 pb-12">
            <CrudHeader
                title="Staff Management"
                description="Coordinate your clinical and administrative workforce."
                addButtonLabel="Add Staff Member"
                addHref={`./staff/new`}
            />

            <DataTable
                columns={columns}
                data={staff}
                searchKey="name"
            />
        </div>
    );
}
