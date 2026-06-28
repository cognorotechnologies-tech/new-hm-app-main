"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format, isBefore, addDays } from "date-fns"
import { MoreHorizontal, Edit, Trash, Package, AlertTriangle, ArrowUpRight } from "lucide-react"
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
import { deleteInventoryItem } from "@/app/actions/inventory-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type InventoryColumn = {
    id: string
    name: string
    category: string | null
    quantity: number
    unit: string | null
    reorderLevel: number
    expiryDate: Date | null
}

export const columns: ColumnDef<InventoryColumn>[] = [
    {
        accessorKey: "name",
        header: "Item Description",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <Package className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{row.original.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{row.original.category || "General"}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "quantity",
        header: "Stock Level",
        cell: ({ row }) => {
            const isLow = row.original.quantity <= row.original.reorderLevel
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold tabular-nums", isLow ? "text-rose-600" : "text-emerald-600")}>
                            {row.original.quantity}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">{row.original.unit || "units"}</span>
                    </div>
                    {isLow && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-tighter">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Low Stock Alert
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "expiryDate",
        header: "Expiry",
        cell: ({ row }) => (
            <div className="text-xs font-medium tabular-nums text-muted-foreground">
                {row.original.expiryDate ? format(row.original.expiryDate, "MMM d, yyyy") : "No Expiry"}
            </div>
        ),
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const item = row.original;
            const isLowStock = item.quantity <= item.reorderLevel;
            const isExpiringSoon = item.expiryDate ? isBefore(new Date(item.expiryDate), addDays(new Date(), 30)) : false;
            const isExpired = item.expiryDate ? isBefore(new Date(item.expiryDate), new Date()) : false;

            return (
                <div className="flex flex-wrap gap-1">
                    {isExpired ? (
                        <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-[10px] uppercase font-bold tracking-tighter">EXPIRED</Badge>
                    ) : isExpiringSoon ? (
                        <Badge className="rounded-full px-2 py-0.5 text-[10px] uppercase font-bold tracking-tighter bg-amber-500 hover:bg-amber-600">EXPIRING</Badge>
                    ) : null}

                    {isLowStock ? (
                        <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] uppercase font-bold tracking-tighter border-rose-200 bg-rose-50 text-rose-700">LOW STOCK</Badge>
                    ) : (
                        <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] uppercase font-bold tracking-tighter border-emerald-200 bg-emerald-50 text-emerald-700">GOOD</Badge>
                    )}
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

function CellAction({ data }: { data: InventoryColumn }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onConfirm = async () => {
        try {
            setLoading(true)
            const res = await deleteInventoryItem(data.id)
            if (res.success) {
                toast.success("Inventory item removed")
            } else {
                toast.error(res.message || "Failed to delete item")
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
                title="Remove from Inventory?"
                description="This will permanently remove the item from clinical stock records."
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Stock Control</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <ArrowUpRight className="mr-2 h-4 w-4" /> Usage History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete Item
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
