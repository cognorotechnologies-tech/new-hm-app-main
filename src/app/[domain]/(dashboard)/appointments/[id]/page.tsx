import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CreatePrescriptionForm from "@/components/dashboard/create-prescription-form";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/auth";
import CreateLabOrderDialog from "@/components/dashboard/create-lab-order-dialog";
import RecordVitalsDialog from "@/components/dashboard/record-vitals-dialog";
import { FlaskConical } from "lucide-react";

export default async function AppointmentDetailsPage(props: {
    params: Promise<{ domain: string; id: string }>;
}) {
    const params = await props.params;
    const { domain, id } = params;
    const session = await auth();

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return notFound();

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
        }
    });

    if (!appointment) return notFound();

    // Check if prescription exists
    const prescription = await prisma.prescription.findFirst({
        where: { appointmentId: id }
    });

    const labTests = await prisma.labTest.findMany({
        where: { tenantId: tenant.id }
    });

    const labOrders = await prisma.labOrder.findMany({
        where: { appointmentId: id }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Appointment Details</h2>
                    <p className="text-muted-foreground">ID: {appointment.id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <RecordVitalsDialog
                        patientId={appointment.patientId}
                        tenantId={tenant.id}
                        appointmentId={appointment.id}
                        patientName={appointment.patient.user?.name || "Patient"}
                    />
                    <CreateLabOrderDialog
                        tenantId={tenant.id}
                        patientId={appointment.patientId}
                        patientName={appointment.patient.user?.name || "Unknown"}
                        availableTests={labTests}
                        appointmentId={appointment.id}
                    />
                    <Badge variant={appointment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {appointment.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span>{appointment.patient.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Email:</span>
                                <span>{appointment.patient.user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Gender:</span>
                                <span>{appointment.patient.gender || '-'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Appointment Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Date:</span>
                                <span>{new Date(appointment.startTime).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Time:</span>
                                <span>{new Date(appointment.startTime).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Reason:</span>
                                <span>{appointment.reason || '-'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {prescription ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Prescription</CardTitle>
                        <CardDescription>Created on {new Date(prescription.createdAt).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">Diagnosis</h4>
                            <p className="p-2 bg-slate-50 rounded-md border">{prescription.diagnosis}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Medications</h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Drug Name</TableHead>
                                        <TableHead>Dosage</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Duration</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(prescription.medications as any[]).map((med: any, i: number) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{med.name}</TableCell>
                                            <TableCell>{med.dosage}</TableCell>
                                            <TableCell>{med.frequency}</TableCell>
                                            <TableCell>{med.duration}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{prescription.notes || 'No additional notes.'}</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                session?.user?.role === 'DOCTOR' ? (
                    <CreatePrescriptionForm
                        tenantId={tenant.id}
                        appointmentId={appointment.id}
                        patientId={appointment.patientId}
                        doctorId={appointment.doctorId || ""}
                    />
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground" id="no-prescription-message">
                            No prescription has been issued yet.
                        </CardContent>
                    </Card>
                )
            )}

            {labOrders.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5" /> Lab Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Test Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Results</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {labOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{order.status}</Badge>
                                        </TableCell>
                                        <TableCell>{order.result || "Awaiting processing..."}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
