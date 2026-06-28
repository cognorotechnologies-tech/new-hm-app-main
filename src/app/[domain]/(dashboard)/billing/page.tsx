import prisma from "@/lib/prisma";
import { columns, BillColumn } from "@/components/dashboard/bill-columns";
import { DataTable } from "@/components/ui/data-table";
import { CrudHeader } from "@/components/dashboard/crud-header";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { isModuleEnabled } from "@/lib/feature-flags";
import { redirect } from "next/navigation";

async function getBills(domain: string): Promise<BillColumn[]> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return [];

    const bills = await prisma.bill.findMany({
        where: { tenantId: tenant.id },
        include: {
            patient: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return bills.map(b => ({
        id: b.id,
        createdAt: b.createdAt,
        patientName: b.patient?.user?.name || "Walk-in Patient",
        amount: b.amount,
        paymentMethod: b.paymentMethod || "CASH",
        status: b.status,
        tenantId: b.tenantId,
    }));
}

export default async function BillingPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant || !isModuleEnabled(tenant, 'billing')) {
        redirect(`/dashboard`);
    }

    const bills = await getBills(domain);

    const todayRev = bills.filter(b => b.createdAt.toDateString() === new Date().toDateString())
        .reduce((acc, b) => acc + b.amount, 0);
    const monthRev = bills.filter(b => b.createdAt.getMonth() === new Date().getMonth())
        .reduce((acc, b) => acc + b.amount, 0);

    const stats = [
        { label: "Today's Revenue", value: `$${todayRev.toFixed(0)}`, icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Monthly Cumulative", value: `$${monthRev.toFixed(0)}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Processed Payroll", value: bills.length, icon: FileCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    return (
        <div className="space-y-8 pb-12">
            <CrudHeader
                title="Financial Operations"
                description="Monitor revenue streams, manage clinical invoices, and track payments."
                addButtonLabel="Create New Bill"
                addHref={`./billing/new`}
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
                data={bills}
                searchKey="patientName"
            />
        </div>
    );
}
