import prisma from "@/lib/prisma";
import { columns, DepartmentColumn } from "@/components/dashboard/department-columns";
import { DataTable } from "@/components/ui/data-table";
import { CrudHeader } from "@/components/dashboard/crud-header";

async function getDepartments(domain: string): Promise<DepartmentColumn[]> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
        include: {
            departments: {
                include: {
                    _count: {
                        select: { otherDoctors: true }
                    }
                }
            }
        }
    });

    if (!tenant) return [];

    return tenant.departments.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        doctorCount: d._count.otherDoctors,
    }));
}

export default async function DepartmentListPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const departments = await getDepartments(domain);

    return (
        <div className="space-y-8 pb-12">
            <CrudHeader
                title="Clinical Departments"
                description="Structure your medical facility with specialized units and staff allocation."
                addButtonLabel="Add Department"
                addHref={`./departments/new`}
            />

            <DataTable
                columns={columns}
                data={departments}
                searchKey="name"
            />
        </div>
    );
}
