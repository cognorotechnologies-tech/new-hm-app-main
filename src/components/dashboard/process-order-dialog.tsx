'use client';

import { useState } from 'react';
import { updateLabOrderStatus } from '@/app/actions/lab-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ClipboardCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProcessOrderDialog({
    orderId,
    tenantId,
    patientName,
    currentStatus
}: {
    orderId: string,
    tenantId: string,
    patientName: string,
    currentStatus: string
}) {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [result, setResult] = useState("");
    const [reportUrl, setReportUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateLabOrderStatus(orderId, status, tenantId, result, reportUrl);
        setLoading(false);
        if (res.success) {
            setOpen(false);
            router.refresh();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <ClipboardCheck className="mr-2 h-4 w-4" /> Process
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Process Lab Order</DialogTitle>
                    <DialogDescription>
                        Update status and results for <span className="font-semibold">{patientName}</span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="COLLECTED">Sample Collected</option>
                            <option value="COMPLETED">Completed (Results Ready)</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    {status === 'COMPLETED' && (
                        <>
                            <div className="space-y-2">
                                <Label>Test Results / Notes</Label>
                                <Textarea
                                    placeholder="Enter textual results or diagnostic notes..."
                                    value={result}
                                    onChange={(e) => setResult(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Report URL (PDF/Image)</Label>
                                <Input
                                    placeholder="Link to diagnostic report file..."
                                    value={reportUrl}
                                    onChange={(e) => setReportUrl(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <DialogFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Updating..." : "Update Order"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
