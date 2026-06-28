import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, Calendar, Activity } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import DoctorDashboard from "@/components/dashboard/doctor-dashboard";
import { OPDQueueMonitor } from "@/components/dashboard/opd-queue-monitor";
import SetupWizard from "@/components/dashboard/setup-wizard";


export default async function TenantDashboard(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;
    const session = await auth();

    if (!session?.user) return null;

    // Check if user is a doctor
    if (session.user.role === 'DOCTOR') {
        const doctor = await prisma.doctorProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                appointments: {
                    where: {
                        startTime: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)) // From today
                        }
                    },
                    include: {
                        patient: {
                            include: { user: true }
                        }
                    },
                    orderBy: { startTime: 'asc' },
                    take: 5
                }
            }
        });

        const doctorAppointments = doctor?.appointments.map(appt => ({
            ...appt,
            patient: {
                ...appt.patient,
                user: { name: appt.patient.user?.name || 'Unknown Patient' }
            }
        })) || [];

        return <DoctorDashboard doctorName={session.user.name || 'Doctor'} appointments={doctorAppointments as any} />;
    }

    // Check if user is a patient
    if (session.user.role === 'PATIENT') {
        const patient = await prisma.patientProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                appointments: {
                    where: {
                        startTime: { gte: new Date() }
                    },
                    include: {
                        doctor: {
                            include: { user: true }
                        }
                    },
                    orderBy: { startTime: 'asc' },
                    take: 3
                },
                prescriptions: {
                    include: {
                        doctor: {
                            include: { user: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 3
                },
                dependents: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        const PatientDashboard = (await import("@/components/dashboard/patient-dashboard")).default;

        const patientAppointments = patient?.appointments.map(appt => ({
            ...appt,
            doctor: {
                ...appt.doctor,
                user: { name: appt.doctor.user?.name || 'Unknown Doctor' }
            }
        })) || [];

        return <PatientDashboard
            patientName={session.user.name || 'Patient'}
            patientId={session.user.id}
            appointments={patientAppointments as any}
            prescriptions={patient?.prescriptions || []}
            dependents={patient?.dependents || []}
        />;
    }

    // Admin Dashboard Logic (existing)
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
        include: {
            _count: {
                select: {
                    users: true,
                    patients: true,
                    doctors: true,
                    appointments: true
                }
            }
        }
    });

    if (!tenant) return null;

    // Fetch today's appointments for the OPD Queue Monitor
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await prisma.appointment.findMany({
        where: {
            tenant: { slug: domain },
            startTime: {
                gte: today,
                lt: tomorrow
            }
        },
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } }
        },
        orderBy: { startTime: 'asc' }
    });

    const stats = [
        {
            title: "Total Patients",
            value: tenant._count.patients,
            icon: Users,
            description: "Active records"
        },
        {
            title: "Doctors",
            value: tenant._count.doctors,
            icon: Stethoscope,
            description: "On duty"
        },
        {
            title: "Appointments",
            value: tenant._count.appointments,
            icon: Calendar,
            description: "Scheduled today"
        },
        {
            title: "Total Staff",
            value: tenant._count.users,
            icon: Activity,
            description: "Registered users"
        }
    ];

    return (
        <div className="space-y-8 pb-12">
            <div>
                {!(tenant.settings as any)?.setupCompleted && session.user.role === 'ADMIN' && (
                    <SetupWizard
                        tenantId={tenant.id}
                        tenantName={tenant.name}
                        initialBranding={tenant.branding}
                    />
                )}
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    Admin Dashboard
                </h2>
                <p className="text-muted-foreground mt-1">Operational overview for {tenant.name}.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="glass-card border-none group hover:scale-[1.02] transition-transform duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <stat.icon className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* OPD Queue Monitor for Staff/Admin */}
            <div className="grid gap-6 md:grid-cols-1">
                <Card className="glass-card border-none">
                    <CardHeader>
                        <CardTitle>Live OPD Queue Monitor</CardTitle>
                        <p className="text-xs text-muted-foreground">Real-time status of today's appointments.</p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <OPDQueueMonitor
                            initialAppointments={todayAppointments as any}
                            tenantId={tenant.id}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
