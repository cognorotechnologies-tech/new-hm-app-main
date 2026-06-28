'use client';

import { useActionState, useEffect, useState } from 'react';
import { addStaffMember, HRActionState } from '@/app/actions/hr-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { cn } from '@/lib/utils';

const initialState: HRActionState = {
    message: undefined,
};

export default function AddStaffDialog({
    tenantId,
    departments
}: {
    tenantId: string;
    departments: { id: string, name: string }[];
}) {
    const [state, dispatch] = useActionState(addStaffMember, initialState);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            setOpen(false);
            router.refresh();
        }
    }, [state.success, router]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Onboard Staff Member</DialogTitle>
                    <DialogDescription>
                        Create a new user account and staff profile.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="space-y-4 py-4">
                    <input type="hidden" name="tenantId" value={tenantId} />

                    {state.message && (
                        <div className={cn(
                            "p-3 rounded-lg text-xs font-medium",
                            state.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        )}>
                            {state.message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" className="rounded-xl border-slate-200" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" placeholder="john@hospital.com" className="rounded-xl border-slate-200" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Initial Password</Label>
                                <Input id="password" name="password" type="password" className="rounded-xl border-slate-200" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Assign Role</Label>
                                <Select name="role" required defaultValue={UserRole.NURSE}>
                                    <SelectTrigger className="rounded-xl border-slate-200">
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
                                <Label htmlFor="departmentId">Department</Label>
                                <Select name="departmentId">
                                    <SelectTrigger className="rounded-xl border-slate-200">
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
                            <Label htmlFor="salary">Salary / Compensation</Label>
                            <Input id="salary" name="salary" type="number" className="rounded-xl border-slate-200" placeholder="e.g. 5000" />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full rounded-xl premium-shadow">Onboard Staff</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
