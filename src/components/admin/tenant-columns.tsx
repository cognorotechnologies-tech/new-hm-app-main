"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreHorizontal, Edit, Trash, ExternalLink, ShieldCheck } from "lucide-react"
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
import { deleteTenant } from "@/app/actions/admin-actions"
import { toast } from "sonner"
import Link from "next/link"


export type TenantColumn = {
    id: string
    name: string
    slug: string
    plan: string
    userCount: number
    createdAt: Date
    settings: any
}

export const columns: ColumnDef<TenantColumn>[] = [
    {
        accessorKey: "name",
        header: "Organization",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-sm">{row.original.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{row.original.slug}.hospital.com</span>
            </div>
        ),
    },
    {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => {
            const plan = row.original.plan
            return (
                <Badge
                    className={cn(
                        "rounded-full px-2 text-[10px] font-bold uppercase",
                        plan === "ENTERPRISE" ? "bg-indigo-500" :
                            plan === "PROFESSIONAL" ? "bg-blue-500" :
                                plan === "BASIC" ? "bg-emerald-500" : "bg-slate-400"
                    )}
                >
                    {plan}
                </Badge>
            )
        },
    },
    {
        accessorKey: "userCount",
        header: "Users",
        cell: ({ row }) => (
            <div className="text-center font-medium tabular-nums">{row.original.userCount}</div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
            <div className="text-xs text-muted-foreground">
                {format(row.original.createdAt, "MMM d, yyyy")}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

// Helper function for the actions cell to manage state
function CellAction({ data }: { data: TenantColumn }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onConfirm = async () => {
        try {
            setLoading(true)
            const res = await deleteTenant(data.id)
            if (res.success) {
                toast.success("Tenant deleted successfully")
            } else {
                toast.error(res.message || "Failed to delete tenant")
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
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-40">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground">Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => window.open(`http://${data.slug}.localhost:3000`, '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" /> Visit Site
                    </DropdownMenuItem>
                    <Link href={`/admin/tenants/${data.id}`}>
                        <DropdownMenuItem className="cursor-pointer text-xs">
                            <Edit className="mr-2 h-4 w-4" /> Manage
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

// Utility function for conditional classes (inline since we need it)
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
