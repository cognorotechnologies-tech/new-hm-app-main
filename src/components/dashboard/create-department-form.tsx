'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createDepartment, DepartmentFormState } from '@/app/actions/department-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full rounded-xl h-11 font-bold shadow-lg premium-shadow transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Initialize Unit
        </Button>
    );
}

const initialState: DepartmentFormState = {
    message: '',
    errors: {}
};

export default function CreateDepartmentForm({ tenantId }: { tenantId: string }) {
    const [state, dispatch] = useActionState(createDepartment, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.message === 'Department created successfully.') {
            router.push('./');
            router.refresh();
        }
    }, [state, router]);

    return (
        <Card className="w-full max-w-lg mx-auto border-none glass-card premium-shadow rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent italic">
                    Establish Medical Unit
                </CardTitle>
                <CardDescription>
                    Define a new clinical or administrative department.
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

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Cardiology, Radiology" className="rounded-xl h-11 border-slate-200" required />
                            {state.errors?.name && <p className="text-[10px] text-rose-500 font-bold">{state.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Operational Mandate</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the focus and services of this unit..."
                                className="rounded-xl border-slate-200 min-h-[120px] resize-none"
                            />
                            {state.errors?.description && <p className="text-[10px] text-rose-500 font-bold">{state.errors.description}</p>}
                        </div>
                    </div>

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
