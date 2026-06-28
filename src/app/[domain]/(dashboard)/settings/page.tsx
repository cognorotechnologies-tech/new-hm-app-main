import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BrandingEditor from "@/components/admin/branding-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Settings, ShieldCheck } from "lucide-react";
import { updateOwnBranding } from "@/app/actions/tenant-actions";

export default async function SettingsPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const session = await auth();

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        redirect("/dashboard");
    }

    const tenant = await prisma.tenant.findUnique({
        where: { slug: params.domain },
    });

    if (!tenant) {
        redirect("/dashboard");
    }

    return (
        <div className="container mx-auto py-8 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                <p className="text-muted-foreground">Manage your clinic&apos;s configuration, visual identity, and security preferences.</p>
            </div>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mb-8">
                    <TabsTrigger value="branding" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Branding
                    </TabsTrigger>
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="space-y-6">
                    <BrandingEditor
                        tenantId={tenant.id}
                        initialBranding={tenant.branding}
                        action={updateOwnBranding}
                    />
                </TabsContent>

                <TabsContent value="general">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Organization Details</CardTitle>
                            <CardDescription>Basic information about your organization.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 text-sm">
                                    <p className="font-semibold">Name</p>
                                    <p className="text-muted-foreground">{tenant.name}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="font-semibold">Plan</p>
                                    <p className="text-muted-foreground uppercase">{tenant.plan}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="font-semibold">Organization URL</p>
                                    <p className="text-muted-foreground">{params.domain}.localhost:3000</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Manage security and access controls.</CardDescription>
                        </CardHeader>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Advanced security settings (MFA, IP Whitelisting) are coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
