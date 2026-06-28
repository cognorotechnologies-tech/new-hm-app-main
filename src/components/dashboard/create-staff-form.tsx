'use client';

import { useActionState, useEffect, useState } from 'react';
import { addStaffMember, HRActionState } from '@/app/actions/hr-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { cn } from '@/lib/utils';

const initialState: HRActionState = {
    message: undefined,
};

export default function CreateStaffForm({
    tenantId,
    departments
}: {
    tenantId: string;
    departments: { id: string, name: string }[];
}) {
    const [state, dispatch] = useActionState(addStaffMember, initialState);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (state.success) {
            router.push('./'); // Go back to staff list
            router.refresh();
        }
    }, [state.success, router]);

    return (
        <Card className="w-full max-w-2xl mx-auto border-none glass-card premium-shadow rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent italic">
                            Onboard Staff Member
                        </CardTitle>
                        <CardDescription>
                            Initialize system access and employment profile for new medical or administrative staff.
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
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
                                    state.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                )}>
                                    {state.message}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                <Input id="name" name="name" placeholder="John Doe" className="rounded-xl h-11 border-slate-200" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                    <Input id="email" name="email" type="email" placeholder="john@hospital.com" className="rounded-xl h-11 border-slate-200" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Password</Label>
                                    <Input id="password" name="password" type="password" className="rounded-xl h-11 border-slate-200" required minLength={6} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personnel Role</Label>
                                    <Select name="role" required defaultValue={UserRole.NURSE}>
                                        <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={UserRole.NURSE}>Nurse</SelectItem>
                                            <SelectItem value={UserRole.RECEPTIONIST}>Receptionist</SelectItem>
                                            <SelectItem value={UserRole.HR_MANAGER}>HR Manager</SelectItem>
                                            <SelectItem value={UserRole.LAB_TECHNICIAN}>Lab Technician</SelectItem>
                                            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="departmentId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Department</Label>
                                    <Select name="departmentId">
                                        <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salary" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Salary / Compensation</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-sm text-slate-400">$</span>
                                    <Input id="salary" name="salary" type="number" className="rounded-xl h-11 border-slate-200 pl-7" placeholder="e.g. 5000" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full rounded-xl h-12 font-bold shadow-lg premium-shadow transition-all hover:scale-[1.01] active:scale-[0.99]">
                                    <UserPlus className="mr-2 h-5 w-5" />
                                    Confirm & Onboard Staff
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
