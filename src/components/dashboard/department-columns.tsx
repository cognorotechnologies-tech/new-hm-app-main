"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash, Building2, Users } from "lucide-react"
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
import { deleteDepartment } from "@/app/actions/department-actions"
import { toast } from "sonner"

export type DepartmentColumn = {
    id: string
    name: string
    description: string | null
    doctorCount: number
}

export const columns: ColumnDef<DepartmentColumn>[] = [
    {
        accessorKey: "name",
        header: "Department Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                    <Building2 className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{row.original.name}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">
                        {row.original.description || "Clinical Unit"}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "doctorCount",
        header: "Clinical Staff",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/50 text-xs font-bold tabular-nums">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {row.original.doctorCount}
                </div>
                <span className="text-[10px] text-muted-foreground">Specialists</span>
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

function CellAction({ data }: { data: DepartmentColumn }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onConfirm = async () => {
        try {
            setLoading(true)
            const res = await deleteDepartment(data.id)
            if (res.success) {
                toast.success("Department record deleted")
            } else {
                toast.error(res.message || "Failed to delete department")
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
                title="Delete Clinical Department?"
                description="This will remove the department definition. Staff assigned to this department will need reassignment."
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Department Control</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <Users className="mr-2 h-4 w-4" /> Manage Staff
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete Department
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
