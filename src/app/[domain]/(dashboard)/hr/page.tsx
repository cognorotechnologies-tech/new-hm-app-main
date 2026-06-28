import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import prisma from "@/lib/prisma";
import { Briefcase, Users, Clock, CalendarDays } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import AttendanceButton from "@/components/dashboard/attendance-button";
import { isModuleEnabled } from "@/lib/feature-flags";
import { redirect } from "next/navigation";

export default async function HRDashboard(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;
    const session = await auth();

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return null;

    if (!isModuleEnabled(tenant, 'hr')) {
        redirect(`/dashboard`);
    }

    const staff = await prisma.staffProfile.findMany({
        where: { tenantId: tenant.id },
        include: { user: true, department: true }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceToday = await prisma.attendance.findMany({
        where: {
            tenantId: tenant.id,
            date: today
        },
        include: { staff: { include: { user: true } } }
    });

    const activeLeaves = await prisma.leave.findMany({
        where: {
            tenantId: tenant.id,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            status: 'APPROVED'
        }
    });

    const myProfile = await prisma.staffProfile.findFirst({
        where: { userId: session?.user?.id, tenantId: tenant.id }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">HR Management</h2>
                    <p className="text-muted-foreground">Manage staff, attendance, and leaves.</p>
                </div>
                <div className="flex gap-2">
                    {myProfile && (
                        <AttendanceButton staffId={myProfile.id} tenantId={tenant.id} />
                    )}
                    <Link href={`/hr/staff`}>
                        <Button>Manage Staff</Button>
                    </Link>
                </div>
            </div>

            {!myProfile && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Clock className="h-5 w-5 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <span className="font-bold">Staff Features Hidden:</span> You are logged in as an Admin but don't have a personal Staff Profile yet.
                                To use Clock-In/Out or Leave Requests, please <Link href={`/hr/staff`} className="font-medium underline hover:text-blue-600">onboard yourself as staff</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staff.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendanceToday.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeLeaves.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Set(staff.map(s => s.departmentId).filter(Boolean)).size}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff Name</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceToday.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                            No attendance records for today.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    attendanceToday.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.staff.user.name}</TableCell>
                                            <TableCell>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "-"}</TableCell>
                                            <TableCell>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {record.status}
                                                </Badge>
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
                        <CardTitle>Pending Leaves</CardTitle>
                        <Link href={`/hr/leaves`}>
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {/* Summary or list of pending leaves would go here */}
                        <div className="text-sm text-muted-foreground text-center py-8">
                            Go to Leaves Management to review requests.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
