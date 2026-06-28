"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash, Mail, Phone, Award } from "lucide-react"
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
import { deleteDoctor } from "@/app/actions/doctor-actions"
import { toast } from "sonner"
import Link from "next/link"

export type DoctorColumn = {
    id: string
    name: string
    email: string
    phone: string | null
    specialization: string
    licenseNumber: string | null
}

export const columns: ColumnDef<DoctorColumn>[] = [
    {
        accessorKey: "name",
        header: "Doctor Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-xs text-indigo-600">
                    {(row.original.name || "D").substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">Dr. {row.original.name}</span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Award className="h-3 w-3" />
                        {row.original.licenseNumber || "No license recorded"}
                    </div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "specialization",
        header: "Specialization",
        cell: ({ row }) => (
            <Badge variant="outline" className="rounded-full bg-slate-50 dark:bg-slate-800 text-xs font-medium border-slate-200/60 transition-colors group-hover:bg-white">
                {row.original.specialization}
            </Badge>
        ),
    },
    {
        accessorKey: "contact",
        header: "Contact Info",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {row.original.email}
                </div>
                {row.original.phone && (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Phone className="h-3 w-3" />
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

function CellAction({ data }: { data: DoctorColumn }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onConfirm = async () => {
        try {
            setLoading(true)
            const res = await deleteDoctor(data.id)
            if (res.success) {
                toast.success("Doctor record deleted")
            } else {
                toast.error(res.message || "Failed to delete doctor")
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
                title="Delete Doctor Profile?"
                description="This will remove the doctor user and their clinical profile. Appointments history remains archived."
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-40">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground">Doctor Actions</DropdownMenuLabel>
                    <Link href={`./doctors/${data.id}/edit`}>
                        <DropdownMenuItem className="cursor-pointer text-xs">
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Remove Doctor
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
