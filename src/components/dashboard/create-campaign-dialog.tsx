'use client';

import { useActionState, useEffect, useState } from 'react';
import { createCampaign, CampaignActionState } from '@/app/actions/campaign-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

const initialState: CampaignActionState = {
    message: undefined,
};

export default function CreateCampaignDialog({
    tenantId
}: {
    tenantId: string;
}) {
    const [state, dispatch] = useActionState(createCampaign, initialState);
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
                    <Megaphone className="mr-2 h-4 w-4" /> Create Campaign
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Engagement Campaign</DialogTitle>
                    <DialogDescription>
                        Draft an email or SMS blast for your patients.
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
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" name="title" className="col-span-3" placeholder="e.g. Summer Health Checkup" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <div className="col-span-3">
                            <Select name="type" required defaultValue="EMAIL">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EMAIL">Email Blast</SelectItem>
                                    <SelectItem value="SMS">SMS Message</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="content" className="text-right">Content</Label>
                        <Textarea id="content" name="content" className="col-span-3" placeholder="Write your message here..." required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="scheduledAt" className="text-right">Schedule</Label>
                        <Input id="scheduledAt" name="scheduledAt" type="datetime-local" className="col-span-3" />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Schedule Campaign</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
