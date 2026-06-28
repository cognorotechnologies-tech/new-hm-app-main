"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreHorizontal, FlaskConical, User, Stethoscope, Trash, FileText, CheckCircle2, Clock } from "lucide-react"
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
import { deleteLabOrder } from "@/app/actions/lab-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type LabOrderColumn = {
    id: string
    createdAt: Date
    patientName: string
    doctorName: string
    status: string
    totalAmount: number
}

export const columns: ColumnDef<LabOrderColumn>[] = [
    {
        accessorKey: "createdAt",
        header: "Order Date",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-xs font-semibold tabular-nums">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {format(row.original.createdAt, "MMM d, yyyy")}
            </div>
        ),
    },
    {
        accessorKey: "patientName",
        header: "Clinical Patient",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">{row.original.patientName}</span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                    <Stethoscope className="h-2.5 w-2.5" />
                    Dr. {row.original.doctorName}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Processing Status",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                        status === 'COMPLETED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            status === 'PENDING' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-slate-50 text-slate-700 border-slate-200"
                    )}
                >
                    {status === 'COMPLETED' && <CheckCircle2 className="mr-1 h-2.5 w-2.5" />}
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "totalAmount",
        header: "Fees",
        cell: ({ row }) => (
            <div className="text-xs font-bold tabular-nums">
                ${row.original.totalAmount.toFixed(2)}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

function CellAction({ data }: { data: LabOrderColumn }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onConfirm = async () => {
        try {
            setLoading(true)
            const res = await deleteLabOrder(data.id)
            if (res.success) {
                toast.success("Lab order deleted")
            } else {
                toast.error(res.message || "Failed to delete order")
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
                title="Discard Lab Order?"
                description="This will permanently nullify the diagnostic request record."
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Lab Operations</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <FileText className="mr-2 h-4 w-4" /> Enter Results
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <FlaskConical className="mr-2 h-4 w-4" /> View Tests
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete Order
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
