import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import prisma from "@/lib/prisma";
import { CalendarDays, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import Link from "next/link";
import LeaveRequestDialog from "@/components/dashboard/leave-request-dialog";
import LeaveApprovalActions from "@/components/dashboard/leave-approval-actions";

export default async function LeavesPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;
    const session = await auth();

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return null;

    const leaves = await prisma.leave.findMany({
        where: { tenantId: tenant.id },
        include: { staff: { include: { user: true } } },
        orderBy: { startDate: 'desc' }
    });

    const myProfile = await prisma.staffProfile.findFirst({
        where: { userId: session?.user?.id, tenantId: tenant.id }
    });

    const isAdmin = ['ADMIN', 'HR_MANAGER'].includes(session?.user?.role || '');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
                    <p className="text-muted-foreground">Request time off and manage team availability.</p>
                </div>
                {myProfile && (
                    <LeaveRequestDialog staffId={myProfile.id} tenantId={tenant.id} />
                )}
            </div>

            {!myProfile && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <CalendarDays className="h-5 w-5 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <span className="font-bold">Leave Requests Hidden:</span> You need a Staff Profile to request leaves.
                                <Link href={`/hr/staff`} className="font-medium underline hover:text-blue-600 block mt-1">Visit Staff Management to onboard yourself.</Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" /> Leave Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Member</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaves.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center h-24 text-muted-foreground">
                                        No leave requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leaves.map((leave) => (
                                    <TableRow key={leave.id}>
                                        <TableCell>
                                            <div className="font-medium">{leave.staff.user.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{leave.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={leave.reason || ""}>
                                            {leave.reason || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                }
                                            >
                                                {leave.status}
                                            </Badge>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right">
                                                {leave.status === 'PENDING' && (
                                                    <LeaveApprovalActions leaveId={leave.id} tenantId={tenant.id} />
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
