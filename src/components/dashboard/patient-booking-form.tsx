'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { bookAppointment, BookingFormState } from '@/app/actions/booking-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar as CalendarIcon, Clock, Heart, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full rounded-xl h-11 font-bold shadow-lg premium-shadow transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Reservation
        </Button>
    );
}

const initialState: BookingFormState = {
    message: undefined,
    errors: {}
};

type Props = {
    tenantId: string;
    tenantSlug: string;
    doctors: { id: string; name: string; specialization: string }[];
    dependents: { id: string; user: { name: string | null } }[];
    departments: { id: string; name: string }[];
};

export default function PatientBookingForm({ tenantId, tenantSlug, doctors, dependents, departments }: Props) {
    const [state, dispatch] = useActionState(bookAppointment, initialState);
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedId = searchParams.get('for') || 'SELF';
    const [selectedIdentity, setSelectedIdentity] = useState<string>(preselectedId);

    useEffect(() => {
        if (state.success) {
            const timer = setTimeout(() => {
                router.push('./'); // Redirect to dashboard
                router.refresh();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state.success, router]);

    // Use tenant-specific departments as specialization categories
    const specializations = departments.length > 0
        ? departments.map(d => d.name)
        : Array.from(new Set(doctors.map(d => d.specialization)));

    const [selectedSpec, setSelectedSpec] = useState<string>("");

    const filteredDoctors = (selectedSpec && selectedSpec !== "ALL")
        ? doctors.filter(d => d.specialization === selectedSpec)
        : doctors;

    return (
        <Card className="w-full max-w-xl mx-auto border-none glass-card premium-shadow rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-b border-primary/10">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary italic">
                    <CalendarIcon className="h-6 w-6" />
                    Secure Clinical Slot
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                    Find the right specialist and book your consultation in seconds.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <form action={dispatch} className="space-y-6">
                    <input type="hidden" name="tenantId" value={tenantId} />
                    <input type="hidden" name="tenantSlug" value={tenantSlug} />

                    {state.message && (
                        <div className={cn(
                            "p-4 rounded-xl text-sm font-medium",
                            state.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        )}>
                            <div className="flex flex-col">
                                <span className="font-bold">{state.success ? "Booking Confirmed!" : "Reservation Failed"}</span>
                                <span>{state.message}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic ml-1">Identity Selection: Who is visiting?</Label>
                        <input type="hidden" name="patientProfileId" value={selectedIdentity} />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedIdentity('SELF')}
                                className={cn(
                                    "cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                                    selectedIdentity === 'SELF'
                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                        : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    selectedIdentity === 'SELF' ? "bg-primary text-white" : "bg-white text-slate-400 group-hover:text-primary"
                                )}>
                                    <Heart className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-black uppercase tracking-tight">Myself</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Primary</p>
                                </div>
                            </motion.div>

                            {dependents.map((dep, idx) => (
                                <motion.div
                                    key={dep.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedIdentity(dep.id)}
                                    className={cn(
                                        "cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                                        selectedIdentity === dep.id
                                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                            : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                        selectedIdentity === dep.id ? "bg-primary text-white" : "bg-white text-slate-400"
                                    )}>
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black uppercase tracking-tight truncate max-w-[80px]">{dep.user.name?.split(' ')[0]}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">Dependent</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
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
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Specialist</Label>
                            <Select name="doctorId" required>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visitation Date</Label>
                            <Input id="date" name="date" type="date" className="rounded-xl h-11 border-slate-200" required min={new Date().toISOString().split('T')[0]} />
                            {state.errors?.date && <p className="text-[10px] text-rose-500 font-bold">{state.errors.date}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Arrival Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                <Input id="time" name="time" type="time" className="pl-10 rounded-xl h-11 border-slate-200" required />
                            </div>
                            {state.errors?.time && <p className="text-[10px] text-rose-500 font-bold">{state.errors.time}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ailment Details (Optional)</Label>
                        <Textarea
                            id="reason"
                            name="reason"
                            placeholder="Briefly describe your symptoms or visit purpose..."
                            className="rounded-xl border-slate-200 min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
