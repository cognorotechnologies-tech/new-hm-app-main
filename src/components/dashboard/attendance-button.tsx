'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { markAttendance } from "@/app/actions/hr-actions";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export default function AttendanceButton({
    staffId,
    tenantId
}: {
    staffId: string;
    tenantId: string;
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleClock(type: 'IN' | 'OUT') {
        setLoading(true);
        try {
            const result = await markAttendance(staffId, tenantId, type);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.message || "Something went wrong");
            }
        } catch (error) {
            toast.error("Failed to mark attendance");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleClock('IN')}
                disabled={loading}
            >
                <Clock className="h-4 w-4" />
                Clock In
            </Button>
            <Button
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleClock('OUT')}
                disabled={loading}
            >
                <LogOut className="h-4 w-4" />
                Clock Out
            </Button>
        </div>
    );
}
