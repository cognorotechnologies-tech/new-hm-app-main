"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreHorizontal, Calendar, User, Stethoscope, Trash, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { DeleteDialog } from "@/components/dashboard/delete-dialog"
import { deleteAppointment } from "@/app/actions/appointment-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

export type AppointmentColumn = {
    id: string
    startTime: Date
    patientName: string
    doctorName: string
    status: string
    reason: string | null
    tenantId: string
}

// ... (skipping to CellAction to avoid huge replacement, oh wait, replace_file_content is for contiguous block)
// I should do two replace calls. One for type, one for usage.

export const columns: ColumnDef<AppointmentColumn>[] = [
    {
        accessorKey: "startTime",
        header: "Date & Time",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold tabular-nums">
                    <Calendar className="h-3 w-3 text-primary" />
                    {format(row.original.startTime, "MMM d, yyyy")}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium pl-5">
                    {format(row.original.startTime, "h:mm aa")}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "patientName",
        header: "Patient",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {row.original.patientName.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{row.original.patientName}</span>
            </div>
        ),
    },
    {
        accessorKey: "doctorName",
        header: "Clinical Specialist",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Dr. {row.original.doctorName}</span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        status === 'SCHEDULED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            status === 'COMPLETED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                status === 'CANCELLED' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                    "bg-slate-50 text-slate-700 border-slate-200"
                    )}
                >
                    {status}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

function CellAction({ data }: { data: AppointmentColumn }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onConfirm = async () => {
        try {
            setLoading(true)
            const res = await deleteAppointment(data.id, data.tenantId)
            if (res.success) {
                toast.success("Appointment cancelled/removed")
            } else {
                toast.error(res.message || "Failed to delete appointment")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <>
            <DeleteDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onConfirm}
                loading={loading}
                title="Cancel Appointment?"
                description="This will permanently remove the scheduled slot. A notification will be sent to the patient."
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Clinical Ops</DropdownMenuLabel>
                    <Link href={`/appointments/${data.id}`}>
                        <DropdownMenuItem className="cursor-pointer text-xs">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                    </Link>
                    <Link href={`/appointments/${data.id}`}>
                        <DropdownMenuItem className="cursor-pointer text-xs">
                            <Edit className="mr-2 h-4 w-4" /> Reschedule
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Cancel/Remove
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
