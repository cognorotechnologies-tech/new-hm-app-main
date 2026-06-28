"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreHorizontal, Printer, Trash, Receipt, CreditCard, User } from "lucide-react"
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
import { deleteBill } from "@/app/actions/billing-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type BillColumn = {
    id: string
    createdAt: Date
    patientName: string
    amount: number
    paymentMethod: string
    status: string
    tenantId: string
}

export const columns: ColumnDef<BillColumn>[] = [
    {
        accessorKey: "createdAt",
        header: "Date Issued",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground tabular-nums">
                <Receipt className="h-3 w-3" />
                {format(row.original.createdAt, "MMM d, yyyy")}
            </div>
        ),
    },
    {
        accessorKey: "patientName",
        header: "Recipient",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold">{row.original.patientName}</span>
            </div>
        ),
    },
    {
        accessorKey: "amount",
        header: "Total Amount",
        cell: ({ row }) => (
            <div className="text-sm font-bold tabular-nums">
                ${row.original.amount.toFixed(2)}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Payment Status",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        status === 'PAID' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-rose-50 text-rose-700 border-rose-200"
                    )}
                >
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "paymentMethod",
        header: "Method",
        cell: ({ row }) => (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                <CreditCard className="h-2.5 w-2.5" />
                {row.original.paymentMethod}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

function CellAction({ data }: { data: BillColumn }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onConfirm = async () => {
        try {
            setLoading(true)
            const res = await deleteBill(data.id, data.tenantId)
            if (res.success) {
                toast.success("Invoice removed")
            } else {
                toast.error(res.message || "Failed to delete bill")
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
                title="Delete Invoice?"
                description="This will remove the financial record. Ensure this is archived specifically for auditing if necessary."
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Billing Ops</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <Printer className="mr-2 h-4 w-4" /> Print Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <CreditCard className="mr-2 h-4 w-4" /> Mark as Paid
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete Record
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
