'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAppointmentStatus } from '@/app/actions/appointment-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

type Appointment = {
    id: string;
    startTime: Date;
    status: string;
    reason: string | null;
    patient: {
        user: {
            name: string | null;
        }
    };
    doctor: {
        user: {
            name: string | null;
        }
    };
};

export function OPDQueueMonitor({
    initialAppointments,
    tenantId
}: {
    initialAppointments: Appointment[];
    tenantId: string;
}) {
    const [appointments, setAppointments] = useState(initialAppointments);
    const router = useRouter();

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const res = await updateAppointmentStatus(id, newStatus, tenantId);
        if (res.success) {
            setAppointments(current =>
                current.map(app => app.id === id ? { ...app, status: newStatus } : app)
            );

            if (newStatus === 'IN_CONSULTATION') {
                router.push(`./appointments/${id}`);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return <Badge variant="outline">Scheduled</Badge>;
            case 'CHECKED_IN': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Checked In</Badge>;
            case 'IN_CONSULTATION': return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Consulting</Badge>;
            case 'COMPLETED': return <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" /> Live OPD Queue
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {appointments.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No appointments for today.</p>
                    ) : (
                        appointments.map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{format(new Date(app.startTime), 'hh:mm a')}</span>
                                        {getStatusBadge(app.status)}
                                    </div>
                                    <p className="font-medium text-slate-900">{app.patient.user.name}</p>
                                    <p className="text-sm text-muted-foreground">Dr. {app.doctor.user.name} • {app.reason || 'Routine Checkup'}</p>
                                </div>
                                <div className="flex gap-2">
                                    {app.status === 'SCHEDULED' && (
                                        <Button size="sm" onClick={() => handleStatusUpdate(app.id, 'CHECKED_IN')}>
                                            Check In
                                        </Button>
                                    )}
                                    {app.status === 'CHECKED_IN' && (
                                        <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(app.id, 'IN_CONSULTATION')}>
                                            <PlayCircle className="mr-2 h-4 w-4" /> Start
                                        </Button>
                                    )}
                                    {app.status === 'IN_CONSULTATION' && (
                                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}>
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Finish
                                        </Button>
                                    )}
                                    {app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}>
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
