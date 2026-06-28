"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreHorizontal, Edit, Trash, FileText, User, Calendar } from "lucide-react"
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
import { deletePatient } from "@/app/actions/patient-actions"
import { toast } from "sonner"
import Link from "next/link"

export type PatientColumn = {
    id: string
    name: string
    email: string
    phone: string | null
    dob: Date | null
    gender: string | null
}

export const columns: ColumnDef<PatientColumn>[] = [
    {
        accessorKey: "name",
        header: "Patient Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-xs text-blue-600">
                    {(row.original.name || "P").substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{row.original.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">ID: {row.original.id.substring(0, 8)}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "dob",
        header: "Date of Birth",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {row.original.dob ? format(row.original.dob, "MMM d, yyyy") : "N/A"}
            </div>
        ),
    },
    {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => (
            <Badge variant="outline" className="rounded-full bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase border-slate-200/60">
                {row.original.gender || "Unspecified"}
            </Badge>
        ),
    },
    {
        accessorKey: "contact",
        header: "Contact",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-xs font-medium">{row.original.email}</span>
                <span className="text-[10px] text-muted-foreground">{row.original.phone || "No phone"}</span>
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

function CellAction({ data }: { data: PatientColumn }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onConfirm = async () => {
        try {
            setLoading(true)
            const res = await deletePatient(data.id)
            if (res.success) {
                toast.success("Patient record deleted")
            } else {
                toast.error(res.message || "Failed to delete patient")
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
                title="Delete Patient Record?"
                description="This will permanently remove the patient demographics and access. Clinical history will be archived for compliance."
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Medical Registry</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <User className="mr-2 h-4 w-4" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <FileText className="mr-2 h-4 w-4" /> Medical History
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-xs">
                        <Edit className="mr-2 h-4 w-4" /> Edit Demographics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Remove Patient
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
