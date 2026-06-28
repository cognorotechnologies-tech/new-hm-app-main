'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPrescription, PrescriptionFormState } from '@/app/actions/prescription-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full rounded-xl h-11 font-bold shadow-lg premium-shadow transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finalize Prescription & Sign-off
        </Button>
    );
}

const initialState: PrescriptionFormState = {
    message: '',
    errors: {}
};

type Props = {
    tenantId: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
};

type Medication = {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
};
import { PatientEHRView } from './patient-ehr-view';

export default function CreatePrescriptionForm({ tenantId, appointmentId, patientId, doctorId }: Props) {
    const [state, dispatch] = useActionState(createPrescription, initialState);
    const router = useRouter();
    const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);

    useEffect(() => {
        if (state.message === 'Prescription created successfully.') {
            router.refresh();
        }
    }, [state, router]);

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removeMedication = (index: number) => {
        const newMeds = [...medications];
        newMeds.splice(index, 1);
        setMedications(newMeds);
    };

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            <div className="lg:col-span-8">
                <Card className="w-full border-none glass-card premium-shadow rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent italic">
                            Clinical Prescription
                        </CardTitle>
                        <CardDescription>
                            Record patient diagnosis and medication regimen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 text-popover-foreground">
                        <form action={dispatch} className="space-y-4">
                            <input type="hidden" name="tenantId" value={tenantId} />
                            <input type="hidden" name="appointmentId" value={appointmentId} />
                            <input type="hidden" name="patientId" value={patientId} />
                            <input type="hidden" name="doctorId" value={doctorId} />
                            {/* JSON Stringify medications for server action */}
                            <input type="hidden" name="medications" value={JSON.stringify(medications)} />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosis" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Diagnosis</Label>
                                    <Input id="diagnosis" name="diagnosis" placeholder="Primary diagnosis or impression..." className="rounded-xl h-11 border-slate-200" required />
                                    {state.errors?.diagnosis && <p className="text-[10px] text-rose-500 font-bold">{state.errors.diagnosis}</p>}
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Proposed Medication Regimen</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addMedication} className="rounded-lg h-8 border-primary/20 text-primary hover:bg-primary/5 shadow-sm">
                                            <Plus className="h-3 w-3 mr-2" />
                                            Add Entry
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {medications.map((med, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-100 bg-white dark:bg-slate-950/50 dark:border-slate-800 relative group animate-in slide-in-from-top-1">
                                                <div className="md:col-span-4 space-y-1.5">
                                                    <Label className="text-[10px] font-bold text-muted-foreground">Drug Name</Label>
                                                    <Input
                                                        value={med.name}
                                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                        placeholder="Generic or Brand"
                                                        className="rounded-lg h-9 border-slate-200 text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-1.5">
                                                    <Label className="text-[10px] font-bold text-muted-foreground">Dosage</Label>
                                                    <Input
                                                        value={med.dosage}
                                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                        placeholder="e.g. 500mg"
                                                        className="rounded-lg h-9 border-slate-200 text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div className="md:col-span-3 space-y-1.5">
                                                    <Label className="text-[10px] font-bold text-muted-foreground">Frequency</Label>
                                                    <Input
                                                        value={med.frequency}
                                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                        placeholder="e.g. Twice Daily"
                                                        className="rounded-lg h-9 border-slate-200 text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-1.5">
                                                    <Label className="text-[10px] font-bold text-muted-foreground">Period</Label>
                                                    <Input
                                                        value={med.duration}
                                                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                        placeholder="e.g. 7 Days"
                                                        className="rounded-lg h-9 border-slate-200 text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div className="md:col-span-1 flex items-end pb-0.5">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeMedication(index)}
                                                        disabled={medications.length === 1}
                                                        className="h-9 w-9 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4">
                                    <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Physician Notes & Instructions</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        placeholder="Dietary restrictions, follow-up advice, etc."
                                        className="rounded-xl border-slate-200 min-h-[100px] resize-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <SubmitButton />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-4">
                <Card className="sticky top-6 border-none glass-card premium-shadow rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-900/50">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Patient Timeline & History</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <PatientEHRView patientId={patientId} tenantId={tenantId} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
