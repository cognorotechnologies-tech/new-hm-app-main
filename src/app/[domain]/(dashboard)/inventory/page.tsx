import prisma from "@/lib/prisma";
import { columns, InventoryColumn } from "@/components/dashboard/inventory-columns";
import { DataTable } from "@/components/ui/data-table";
import { CrudHeader } from "@/components/dashboard/crud-header";
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, Calendar } from "lucide-react";
import { isBefore, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { isModuleEnabled } from "@/lib/feature-flags";
import { redirect } from "next/navigation";

async function getInventory(domain: string): Promise<InventoryColumn[]> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return [];

    const inventory = await prisma.inventory.findMany({
        where: { tenantId: tenant.id },
        orderBy: { name: 'asc' }
    });

    return inventory.map(i => ({
        id: i.id,
        name: i.name || "Unnamed Item",
        category: i.category,
        quantity: i.quantity,
        unit: i.unit,
        reorderLevel: i.reorderLevel,
        expiryDate: i.expiryDate,
    }));
}

export default async function InventoryPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant || !isModuleEnabled(tenant, 'pharmacy')) {
        redirect(`/dashboard`);
    }

    const inventory = await getInventory(domain);
    const lowStockCount = inventory.filter(i => i.quantity <= i.reorderLevel).length;
    const expiringSoonCount = inventory.filter(i => i.expiryDate && isBefore(new Date(i.expiryDate), addDays(new Date(), 30))).length;
    const totalItems = inventory.length;

    const stats = [
        { label: "Total Items", value: totalItems, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Low Stock Alert", value: lowStockCount, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Expiring Soon", value: expiringSoonCount, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-8 pb-12">
            <CrudHeader
                title="Inventory & Stock"
                description="Manage medical supplies, medications, and clinical equipment levels."
                addButtonLabel="Add Stock Item"
                addHref={`./inventory/new`}
                exportHref={`./inventory/export`}
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
                data={inventory}
                searchKey="name"
            />
        </div>
    );
}
