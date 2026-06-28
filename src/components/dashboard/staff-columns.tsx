"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Mail, Phone, Briefcase, Trash, UserPlus, ShieldCheck } from "lucide-react"
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
import { deleteStaffMember } from "@/app/actions/hr-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type StaffColumn = {
    id: string
    name: string
    role: string
    departmentName: string
    email: string
    phone: string | null
    joiningDate: Date
}

export const columns: ColumnDef<StaffColumn>[] = [
    {
        accessorKey: "name",
        header: "Staff Member",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600">
                    {row.original.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight">{row.original.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">#{row.original.id.split('-')[0]}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "role",
        header: "System Role",
        cell: ({ row }) => (
            <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-slate-50 border-slate-200">
                <ShieldCheck className="mr-1 h-3 w-3 text-primary" />
                {row.original.role.replace('_', ' ')}
            </Badge>
        ),
    },
    {
        accessorKey: "departmentName",
        header: "Department",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                {row.original.departmentName}
            </div>
        ),
    },
    {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {row.original.email}
                </div>
                {row.original.phone && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Phone className="h-2.5 w-2.5" />
                        {row.original.phone}
                    </div>
                )}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

function CellAction({ data }: { data: StaffColumn }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onConfirm = async () => {
        try {
            setLoading(true)
            const res = await deleteStaffMember(data.id)
            if (res.success) {
                toast.success("Staff record removed")
            } else {
                toast.error(res.message || "Failed to delete record")
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
                title="Remove Staff Record?"
                description="This will permanently delete the staff profile and associated system access."
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Employee Controls</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <UserPlus className="mr-2 h-4 w-4" /> Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <Briefcase className="mr-2 h-4 w-4" /> Update Dept
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Offboard/Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
