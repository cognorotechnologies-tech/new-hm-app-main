'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Loader2 } from 'lucide-react';
import { recordVitals } from '@/app/actions/clinical-actions';
import { toast } from "sonner";

type Props = {
    patientId: string;
    tenantId: string;
    appointmentId?: string;
    patientName: string;
};

export default function RecordVitalsDialog({ patientId, tenantId, appointmentId, patientName }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const result = await recordVitals(formData);

        setLoading(false);
        if (result.success) {
            toast.success("Vitals recorded successfully");
            setOpen(false);
            window.location.reload(); // Refresh to show new vitals
        } else {
            toast.error(result.error || "Failed to record vitals");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Record Vitals
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Vitals</DialogTitle>
                    <DialogDescription>
                        Enter physical metrics for {patientName}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 pt-4">
                    <input type="hidden" name="patientId" value={patientId} />
                    <input type="hidden" name="tenantId" value={tenantId} />
                    {appointmentId && <input type="hidden" name="appointmentId" value={appointmentId} />}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bloodPressure">BP (mmHg)</Label>
                            <Input id="bloodPressure" name="bloodPressure" placeholder="120/80" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                            <Input id="heartRate" name="heartRate" type="number" placeholder="72" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="temperature">Temp (°C)</Label>
                            <Input id="temperature" name="temperature" type="number" step="0.1" placeholder="36.6" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="spO2">SpO2 (%)</Label>
                            <Input id="spO2" name="spO2" type="number" placeholder="98" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input id="weight" name="weight" type="number" step="0.1" placeholder="70.5" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input id="height" name="height" type="number" placeholder="175" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Vitals
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
