import prisma from "@/lib/prisma";
import { columns, LabOrderColumn } from "@/components/dashboard/lab-order-columns";
import { DataTable } from "@/components/ui/data-table";
import { CrudHeader } from "@/components/dashboard/crud-header";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { isModuleEnabled } from "@/lib/feature-flags";
import { redirect } from "next/navigation";

async function getLabOrders(domain: string): Promise<LabOrderColumn[]> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return [];

    const orders = await prisma.labOrder.findMany({
        where: { tenantId: tenant.id },
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    return orders.map(o => ({
        id: o.id,
        createdAt: o.createdAt,
        patientName: o.patient.user?.name || "Unknown Patient",
        doctorName: o.doctor?.user.name || "N/A",
        status: o.status,
        totalAmount: o.totalAmount,
    }));
}

export default async function LabDashboard(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant || !isModuleEnabled(tenant, 'lab')) {
        redirect(`/dashboard`);
    }

    const orders = await getLabOrders(domain);

    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const completedCount = orders.filter(o => o.status === 'COMPLETED').length;

    const stats = [
        { label: "Pending Orders", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Completed Success", value: completedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Volume Index", value: orders.length, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
    ];

    return (
        <div className="space-y-8 pb-12">
            <CrudHeader
                title="Laboratory Diagnostics"
                description="Monitor processing workflow, record diagnostics, and manage results."
                addButtonLabel="Lab Catalog"
                addHref={`./lab/tests`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="glass-card border-none overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-3xl font-bold mt-1 tabular-nums">{stat.value}</h3>
                                </div>
                                <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300", stat.bg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={orders}
                searchKey="patientName"
            />
        </div>
    );
}
