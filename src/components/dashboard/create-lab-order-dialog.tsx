'use client';

import { useState, useActionState, useEffect } from 'react';
import { createLabOrder, LabActionState } from '@/app/actions/lab-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FlaskConical, Search, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LabTest {
    id: string;
    name: string;
    price: number;
    category?: string | null;
}

export default function CreateLabOrderDialog({
    tenantId,
    patientId,
    patientName,
    availableTests,
    appointmentId
}: {
    tenantId: string,
    patientId: string,
    patientName: string,
    availableTests: LabTest[],
    appointmentId?: string
}) {
    const [state, dispatch] = useActionState(createLabOrder, { message: undefined, errors: {} });
    const [open, setOpen] = useState(false);
    const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const toggleTest = (test: LabTest) => {
        if (selectedTests.find(t => t.id === test.id)) {
            setSelectedTests(selectedTests.filter(t => t.id !== test.id));
        } else {
            setSelectedTests([...selectedTests, test]);
        }
    };

    const totalAmount = selectedTests.reduce((acc, curr) => acc + curr.price, 0);

    useEffect(() => {
        if (state.success) {
            setOpen(false);
            setSelectedTests([]);
            router.refresh();
        }
    }, [state.success, router]);

    const filteredTests = availableTests.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <FlaskConical className="mr-2 h-4 w-4" /> Order Lab Test
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Order Lab Tests</DialogTitle>
                    <DialogDescription>
                        Ordering tests for <span className="font-semibold">{patientName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tests..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[250px] border rounded-md p-2">
                        <div className="space-y-1">
                            {filteredTests.map((test) => (
                                <div
                                    key={test.id}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${selectedTests.find(t => t.id === test.id) ? 'bg-primary/10 border-primary border' : ''}`}
                                    onClick={() => toggleTest(test)}
                                >
                                    <div>
                                        <div className="font-medium text-sm">{test.name}</div>
                                        <div className="text-xs text-muted-foreground">{test.category || 'General'}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">${test.price}</span>
                                        {selectedTests.find(t => t.id === test.id) && <Check className="h-4 w-4 text-primary" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {selectedTests.length > 0 && (
                        <div className="p-3 bg-muted rounded-md space-y-2">
                            <div className="text-xs font-semibold uppercase text-muted-foreground">Selected Tests</div>
                            <div className="flex flex-wrap gap-2">
                                {selectedTests.map(t => (
                                    <Badge key={t.id} variant="secondary" className="flex items-center gap-1">
                                        {t.name}
                                        <Plus className="h-3 w-3 rotate-45 cursor-pointer" onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTest(t);
                                        }} />
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t mt-2">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <form action={dispatch}>
                    <input type="hidden" name="tenantId" value={tenantId} />
                    <input type="hidden" name="patientId" value={patientId} />
                    <input type="hidden" name="appointmentId" value={appointmentId || ""} />
                    <input type="hidden" name="totalAmount" value={totalAmount} />
                    <input type="hidden" name="testIds" value={JSON.stringify(selectedTests.map(t => t.id))} />

                    <DialogFooter>
                        <Button type="submit" className="w-full" disabled={selectedTests.length === 0}>
                            Confirm Lab Order
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
