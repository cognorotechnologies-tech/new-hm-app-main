'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createAppointment, AppointmentFormState } from '@/app/actions/appointment-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full rounded-xl h-11 font-bold shadow-lg premium-shadow transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Slot & Sign-off
        </Button>
    );
}

const initialState: AppointmentFormState = {
    message: '',
    errors: {}
};

type Props = {
    tenantId: string;
    patients: { id: string; name: string }[];
    doctors: { id: string; name: string; specialization: string }[];
    departments: { id: string; name: string }[];
};

export default function CreateAppointmentForm({ tenantId, patients, doctors, departments }: Props) {
    const [state, dispatch] = useActionState(createAppointment, initialState);
    const router = useRouter();

    const [selectedSpec, setSelectedSpec] = (useState as any)("ALL");
    const specializations = departments.length > 0
        ? departments.map(d => d.name)
        : Array.from(new Set(doctors.map(d => d.specialization)));

    const filteredDoctors = (selectedSpec && selectedSpec !== "ALL")
        ? doctors.filter(d => d.specialization === selectedSpec)
        : doctors;

    useEffect(() => {
        if (state.message === 'Appointment booked successfully.') {
            router.push('./');
            router.refresh();
        }
    }, [state, router]);

    return (
        <Card className="w-full max-w-lg mx-auto border-none glass-card premium-shadow rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent italic">
                    Schedule Consultation
                </CardTitle>
                <CardDescription>
                    Secure a clinical slot for your patient.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <form action={dispatch} className="space-y-6">
                    <input type="hidden" name="tenantId" value={tenantId} />

                    {state.message && (
                        <div className={cn(
                            "p-4 rounded-xl text-sm font-medium",
                            state.message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        )}>
                            {state.message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Patient</Label>
                            <Select name="patientId" required>
                                <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                    <SelectValue placeholder="Search patient database..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state.errors?.patientId && <p className="text-[10px] text-rose-500 font-bold">{state.errors.patientId}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialization</Label>
                                <Select onValueChange={setSelectedSpec} defaultValue="ALL">
                                    <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Specialties</SelectItem>
                                        {specializations.map(spec => (
                                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Clinical Specialist</Label>
                                <Select name="doctorId" required key={selectedSpec}>
                                    <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                        <SelectValue placeholder="Choose doctor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredDoctors.length > 0 ? (
                                            filteredDoctors.map(d => (
                                                <SelectItem key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>No specialists found</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {state.errors?.doctorId && <p className="text-[10px] text-rose-500 font-bold">{state.errors.doctorId}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Date</Label>
                                <Input id="date" name="date" type="date" className="rounded-xl h-11 border-slate-200" required />
                                {state.errors?.date && <p className="text-[10px] text-rose-500 font-bold">{state.errors.date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Time</Label>
                                <Input id="time" name="time" type="time" className="rounded-xl h-11 border-slate-200" required />
                                {state.errors?.time && <p className="text-[10px] text-rose-500 font-bold">{state.errors.time}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consultation Notes (Optional)</Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                placeholder="Symptoms, medical history summary, or specific requests..."
                                className="rounded-xl border-slate-200 min-h-[100px] resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
