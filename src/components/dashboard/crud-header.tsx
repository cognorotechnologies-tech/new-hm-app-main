"use client"

import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import Link from "next/link"

interface CrudHeaderProps {
    title: string
    description: string
    addButtonLabel?: string
    addHref?: string
    exportHref?: string
}

export function CrudHeader({
    title,
    description,
    addButtonLabel,
    addHref,
    exportHref,
}: CrudHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {title}
                </h2>
                <p className="text-muted-foreground mt-1">{description}</p>
            </div>
            <div className="flex gap-2">
                {exportHref && (
                    <Link href={exportHref}>
                        <Button variant="outline" className="rounded-xl border-slate-200/60 shadow-sm transition-all hover:bg-slate-50">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </Link>
                )}
                {addButtonLabel && addHref && (
                    <Link href={addHref}>
                        <Button className="rounded-xl shadow-md premium-shadow hover:scale-[1.02] active:scale-95 transition-all">
                            <Plus className="mr-2 h-4 w-4" />
                            {addButtonLabel}
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}
