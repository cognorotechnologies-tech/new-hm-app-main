import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import prisma from "@/lib/prisma";
import { Megaphone, ClipboardList, Send, BarChart3, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import CreateCampaignDialog from "@/components/dashboard/create-campaign-dialog";
import CreateSurveyDialog from "@/components/dashboard/create-survey-dialog";

export default async function CampaignsPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return null;

    const [campaigns, surveys] = await Promise.all([
        prisma.campaign.findMany({
            where: { tenantId: tenant.id },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.survey.findMany({
            where: { tenantId: tenant.id },
            include: { responses: true },
            orderBy: { createdAt: 'desc' }
        })
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Campaigns & Surveys</h2>
                    <p className="text-muted-foreground">Manage patient engagement and feedback.</p>
                </div>
                <div className="flex gap-2">
                    <CreateCampaignDialog tenantId={tenant.id} />
                    <CreateSurveyDialog tenantId={tenant.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" /> Recent Campaigns
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No campaigns created yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    campaigns.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{c.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={c.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                    {c.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {c.scheduledAt ? new Date(c.scheduledAt).toLocaleDateString() : 'Draft'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-primary" /> Active Surveys
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Survey Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Responses</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {surveys.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No surveys built yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    surveys.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium">{s.title}</TableCell>
                                            <TableCell>
                                                <Badge className={s.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                                                    {s.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <BarChart3 className="h-3 w-3" /> {s.responses.length}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/hr/surveys/${s.id}`}>
                                                    <Button variant="ghost" size="sm">Results</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
