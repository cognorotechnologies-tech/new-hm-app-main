'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { addInventoryItem, InventoryState } from '@/app/actions/inventory-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const initialState: InventoryState = {
    message: undefined,
    errors: {}
};

export default function AddInventoryDialog({ tenantId }: { tenantId: string }) {
    const [state, dispatch] = useActionState(addInventoryItem, initialState);
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
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                        Add new medication or equipment to stock.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="grid gap-4 py-4">
                    <input type="hidden" name="tenantId" value={tenantId} />

                    {state.message && (
                        <div className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Input id="category" name="category" className="col-span-3" placeholder="e.g. Antibiotics" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">Qty</Label>
                        <Input id="quantity" name="quantity" type="number" className="col-span-3" required min="0" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">Unit</Label>
                        <Input id="unit" name="unit" className="col-span-3" placeholder="e.g. boxes, tablets" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiryDate" className="text-right">Expiry</Label>
                        <Input id="expiryDate" name="expiryDate" type="date" className="col-span-3" />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Save Item</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

