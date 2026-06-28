import CreateAppointmentForm from "@/components/dashboard/create-appointment-form";
import PatientBookingForm from "@/components/dashboard/patient-booking-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function NewAppointmentPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;
    const session = await auth();

    if (!session?.user) return notFound();

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
        include: {
            patients: { include: { user: true } },
            departments: true,
            doctors: {
                include: {
                    user: true,
                    department: true
                }
            }
        }
    });

    if (!tenant) return notFound();

    // Mapping logic for tenant-specific structure
    const specializationMap = tenant.doctors.map(d => ({
        id: d.id,
        name: d.user.name || 'Unknown',
        specialization: d.department?.name || d.specialization || 'General Practice'
    }));

    const departments = tenant.departments.map(dept => ({
        id: dept.id,
        name: dept.name
    }));

    // Patient View
    if (session.user.role === 'PATIENT') {
        const patientProfile = await prisma.patientProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                dependents: {
                    include: { user: true }
                }
            }
        });

        const dependents = patientProfile?.dependents.map(dep => ({
            id: dep.id,
            user: { name: dep.user?.name || 'Linked Member' }
        })) || [];

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight italic text-primary">Secure Clinical Slot</h2>
                </div>
                <Suspense fallback={
                    <div className="w-full max-w-xl mx-auto h-[600px] flex items-center justify-center glass-card rounded-2xl">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                    </div>
                }>
                    <PatientBookingForm
                        tenantId={tenant.id}
                        tenantSlug={domain}
                        doctors={specializationMap}
                        dependents={dependents}
                        departments={departments}
                    />
                </Suspense>
            </div>
        );
    }

    // Admin/Doctor View
    const patients = tenant.patients.map(p => ({ id: p.id, name: p.user?.name || 'Unknown Patient' }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">New Appointment (Admin)</h2>
            </div>
            <CreateAppointmentForm
                tenantId={tenant.id}
                patients={patients}
                doctors={specializationMap}
                departments={departments}
            />
        </div>
    );
}
