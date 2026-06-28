'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createDoctor, type DoctorFormState } from '@/app/actions/doctor-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full rounded-xl h-11 font-bold shadow-lg premium-shadow transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Initialize Profile
        </Button>
    );
}

const initialState: DoctorFormState = {
    message: '',
    errors: {}
};

export default function CreateDoctorForm({
    tenantId,
    departments
}: {
    tenantId: string;
    departments: { id: string, name: string }[]
}) {
    const [state, dispatch] = useActionState(createDoctor, initialState);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (state.message === 'Doctor created successfully.') {
            router.push('./'); // Go back to list
            router.refresh();
        }
    }, [state, router]);

    return (
        <Card className="w-full max-w-2xl mx-auto border-none glass-card premium-shadow rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent italic">
                    Onboard Health Professional
                </CardTitle>
                <CardDescription>
                    Initialize system access and clinical profile for new medical staff.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <form action={dispatch} className="space-y-6">
                    <input type="hidden" name="tenantId" value={tenantId} />

                    {!mounted ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                        </div>
                    ) : (
                        <>
                            {state.message && (
                                <div className={cn(
                                    "p-4 rounded-xl text-sm font-medium",
                                    state.message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                )}>
                                    {state.message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                    <Input id="name" name="name" placeholder="Dr. John Doe" className="rounded-xl h-11 border-slate-200" required />
                                    {state.errors?.name && <p className="text-[10px] text-rose-500 font-bold">{state.errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="departmentId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Department</Label>
                                    <Select name="departmentId" required>
                                        <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" name="specialization" value="General Practice" />
                                    {state.errors?.departmentId && <p className="text-[10px] text-rose-500 font-bold">{state.errors.departmentId}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                    <Input id="email" name="email" type="email" placeholder="john@hospital.com" className="rounded-xl h-11 border-slate-200" required />
                                    {state.errors?.email && <p className="text-[10px] text-rose-500 font-bold">{state.errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                                    <Input id="phone" name="phone" placeholder="+1 234 567 890" className="rounded-xl h-11 border-slate-200" required />
                                    {state.errors?.phone && <p className="text-[10px] text-rose-500 font-bold">{state.errors.phone}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</Label>
                                    <Select name="gender">
                                        <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experienceYears" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience (Years)</Label>
                                    <Input id="experienceYears" name="experienceYears" type="number" placeholder="0" className="rounded-xl h-11 border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="consultationFee" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consultation Fee</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-sm text-slate-400">$</span>
                                        <Input id="consultationFee" name="consultationFee" type="number" placeholder="0.00" className="rounded-xl h-11 border-slate-200 pl-7" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="qualifications" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medical Qualifications</Label>
                                <Input id="qualifications" name="qualifications" placeholder="e.g. MBBS, MD, FRCS" className="rounded-xl h-11 border-slate-200" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Biography</Label>
                                <Input id="bio" name="bio" placeholder="Brief overview of clinical expertise and background..." className="rounded-xl h-11 border-slate-200" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="licenseNumber" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medical License</Label>
                                    <Input id="licenseNumber" name="licenseNumber" placeholder="MED-123456" className="rounded-xl h-11 border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Password</Label>
                                    <Input id="password" name="password" type="password" className="rounded-xl h-11 border-slate-200" required minLength={6} />
                                    {state.errors?.password && <p className="text-[10px] text-rose-500 font-bold">{state.errors.password}</p>}
                                </div>
                            </div>

                            <div className="pt-4">
                                <SubmitButton />
                            </div>
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
