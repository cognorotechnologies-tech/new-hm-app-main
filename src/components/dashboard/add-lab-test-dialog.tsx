'use client';

import { useState, useActionState, useEffect } from 'react';
import { addLabTest, LabActionState } from '@/app/actions/lab-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddLabTestDialog({ tenantId }: { tenantId: string }) {
    const [state, dispatch] = useActionState(addLabTest, { message: undefined, errors: {} });
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
                    <Plus className="mr-2 h-4 w-4" /> Add Test to Catalog
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Lab Test</DialogTitle>
                    <DialogDescription>
                        Define a new test available in your laboratory.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="space-y-4 py-4">
                    <input type="hidden" name="tenantId" value={tenantId} />

                    <div className="space-y-2">
                        <Label htmlFor="name">Test Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Complete Blood Count" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" placeholder="e.g. Hematology, Radiology" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" name="description" placeholder="Short description of the test..." />
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="w-full">Save Test</Button>
                    </DialogFooter>
                    {state.message && (
                        <p className={`text-sm text-center ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                            {state.message}
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
