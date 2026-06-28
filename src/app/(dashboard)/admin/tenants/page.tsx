import prisma from "@/lib/prisma";
import CreateTenantForm from "@/components/admin/create-tenant-form";
import { columns, TenantColumn } from "@/components/admin/tenant-columns";
import { DataTable } from "@/components/ui/data-table";
import { CrudHeader } from "@/components/dashboard/crud-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getTenants(): Promise<TenantColumn[]> {
    const tenants = await prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { users: true }
            }
        }
    });

    return tenants.map(t => ({
        id: t.id,
        name: t.name || "Unnamed Organization",
        slug: t.slug,
        plan: t.plan,
        userCount: t._count.users,
        createdAt: t.createdAt,
        settings: t.settings
    }));
}

export default async function TenantsPage() {
    const tenants = await getTenants();

    return (
        <div className="space-y-8 pb-12">
            <CrudHeader
                title="Tenants Administration"
                description="Monitor and manage all healthcare organizations on the platform."
            />

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="glass mb-6 rounded-xl p-1 bg-slate-100/50 dark:bg-slate-800/50">
                    <TabsTrigger value="list" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all text-xs font-bold uppercase tracking-wider">
                        Existing Tenants
                    </TabsTrigger>
                    <TabsTrigger value="create" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all text-xs font-bold uppercase tracking-wider">
                        Add New Organization
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                    <DataTable
                        columns={columns}
                        data={tenants}
                        searchKey="name"
                    />
                </TabsContent>

                <TabsContent value="create" className="mt-0">
                    <div className="max-w-2xl">
                        <CreateTenantForm />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
