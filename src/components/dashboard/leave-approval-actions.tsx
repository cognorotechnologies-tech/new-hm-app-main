'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { updateLeaveStatus } from "@/app/actions/hr-actions";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export default function LeaveApprovalActions({
    leaveId,
    tenantId
}: {
    leaveId: string;
    tenantId: string;
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleStatus(status: 'APPROVED' | 'REJECTED') {
        setLoading(true);
        try {
            const result = await updateLeaveStatus(leaveId, status, tenantId);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.message || "Something went wrong");
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex gap-1 justify-end">
            <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleStatus('APPROVED')}
                disabled={loading}
            >
                <Check className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleStatus('REJECTED')}
                disabled={loading}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
