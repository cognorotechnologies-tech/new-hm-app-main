"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"

interface DeleteDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    loading?: boolean
    title?: string
    description?: string
}

export function DeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
    title = "Are you sure?",
    description = "This action cannot be undone. This will permanently delete the record from our servers.",
}: DeleteDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-2xl max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                            <AlertTriangle className="h-5 w-5 text-rose-600" />
                        </div>
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-xl shadow-lg shadow-rose-200 dark:shadow-rose-950"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Record
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
