'use client';

import { useActionState, useEffect, useState } from 'react';
import { requestLeave, HRActionState } from '@/app/actions/hr-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';

const initialState: HRActionState = {
    message: undefined,
};

export default function LeaveRequestDialog({
    staffId,
    tenantId
}: {
    staffId: string;
    tenantId: string;
}) {
    const [state, dispatch] = useActionState(requestLeave, initialState);
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
                <Button variant="outline">
                    <CalendarDays className="mr-2 h-4 w-4" /> Request Leave
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Leave</DialogTitle>
                    <DialogDescription>
                        Submit a request for time off.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="grid gap-4 py-4">
                    <input type="hidden" name="staffId" value={staffId} />
                    <input type="hidden" name="tenantId" value={tenantId} />

                    {state.message && (
                        <div className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">Start</Label>
                        <Input id="startDate" name="startDate" type="date" className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">End</Label>
                        <Input id="endDate" name="endDate" type="date" className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <div className="col-span-3">
                            <Select name="type" required defaultValue="CASUAL">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASUAL">Casual Leave</SelectItem>
                                    <SelectItem value="SICK">Sick Leave</SelectItem>
                                    <SelectItem value="VACATION">Vacation</SelectItem>
                                    <SelectItem value="MATERNITY">Maternity/Paternity</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">Reason</Label>
                        <Textarea id="reason" name="reason" className="col-span-3" placeholder="Explain your request..." />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Submit Request</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
