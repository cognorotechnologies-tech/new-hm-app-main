import prisma from "@/lib/prisma";
import BrandingEditor from "@/components/admin/branding-editor";
import FeatureManager from "@/components/admin/feature-manager";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Palette, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TenantManagementPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const { id } = params;

    const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
            _count: {
                select: { users: true, patients: true, doctors: true }
            }
        }
    });

    if (!tenant) notFound();

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{tenant.name}</h2>
                        <p className="text-muted-foreground">{tenant.slug}.yourdomain.com</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/tenants">
                        <Button variant="outline" className="rounded-xl">Back to Tenants</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass-card border-none">
                    <CardHeader className="pb-2">
                        <CardDescription>Total Users</CardDescription>
                        <CardTitle className="text-2xl">{tenant._count.users}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="glass-card border-none">
                    <CardHeader className="pb-2">
                        <CardDescription>Total Patients</CardDescription>
                        <CardTitle className="text-2xl">{tenant._count.patients}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="glass-card border-none">
                    <CardHeader className="pb-2">
                        <CardDescription>Total Doctors</CardDescription>
                        <CardTitle className="text-2xl">{tenant._count.doctors}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
                    <TabsTrigger value="branding" className="rounded-lg px-6 py-2">
                        <Palette className="mr-2 h-4 w-4" /> Branding
                    </TabsTrigger>
                    <TabsTrigger value="features" className="rounded-lg px-6 py-2">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Features
                    </TabsTrigger>
                    <TabsTrigger value="users" className="rounded-lg px-6 py-2">
                        <Users className="mr-2 h-4 w-4" /> Users
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="branding">
                        <BrandingEditor tenantId={tenant.id} initialBranding={tenant.branding} />
                    </TabsContent>

                    <TabsContent value="features">
                        <FeatureManager tenantId={tenant.id} initialSettings={tenant.settings} />
                    </TabsContent>

                    <TabsContent value="users">
                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle>User Seeding & Management</CardTitle>
                                <CardDescription>Create initial staff or manage existing users for this tenant.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground italic">User seeding interface coming soon...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
