'use client';

import { useState, useActionState, useEffect } from 'react';
import { createBill, BillState } from '@/app/actions/billing-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Item {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export default function CreateBillDialog({ tenantId, patients }: { tenantId: string, patients: any[] }) {
    const [state, dispatch] = useActionState(createBill, { message: undefined, errors: {} });
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
    const router = useRouter();

    const [currentItem, setCurrentItem] = useState({ name: "", quantity: 1, price: 0 });

    const addItem = () => {
        if (!currentItem.name || currentItem.quantity <= 0) return;
        const newItem: Item = {
            id: Math.random().toString(36).substr(2, 9),
            name: currentItem.name,
            quantity: currentItem.quantity,
            price: currentItem.price,
            total: currentItem.quantity * currentItem.price
        };
        setItems([...items, newItem]);
        setCurrentItem({ name: "", quantity: 1, price: 0 });
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const totalAmount = items.reduce((acc, curr) => acc + curr.total, 0);

    useEffect(() => {
        if (state.success) {
            setOpen(false);
            setItems([]);
            router.refresh();
        }
    }, [state.success, router]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Bill
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Pharmacy Bill</DialogTitle>
                    <DialogDescription>
                        Generate a new invoice for medication or services.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="space-y-4 py-4">
                    <input type="hidden" name="tenantId" value={tenantId} />
                    <input type="hidden" name="items" value={JSON.stringify(items)} />
                    <input type="hidden" name="patientId" value={selectedPatient} />
                    <input type="hidden" name="paymentMethod" value={paymentMethod} />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Patient (Optional)</Label>
                            <Select onValueChange={setSelectedPatient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select defaultValue="CASH" onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="UPI">UPI / Digital</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold text-sm">Add Items</h4>
                        <div className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-6 space-y-1">
                                <Label className="text-xs">Item Name</Label>
                                <Input
                                    placeholder="Medicine name"
                                    value={currentItem.name}
                                    onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-xs">Qty</Label>
                                <Input
                                    type="number"
                                    value={currentItem.quantity}
                                    onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-span-3 space-y-1">
                                <Label className="text-xs">Price</Label>
                                <Input
                                    type="number"
                                    value={currentItem.price}
                                    onChange={e => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-span-1">
                                <Button type="button" size="icon" onClick={addItem} variant="secondary">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {items.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                                        <div className="flex-1">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="ml-2 text-muted-foreground">x{item.quantity} @ ${item.price}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">${item.total.toFixed(2)}</span>
                                            <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeItem(item.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-2 border-t font-bold mt-2">
                                    <span>Total Amount</span>
                                    <span className="text-lg">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="w-full" disabled={items.length === 0}>
                            Complete Purchase & Generate Bill
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
