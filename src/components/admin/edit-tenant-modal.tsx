"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTenant } from "@/app/actions/admin-actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(3),
    plan: z.enum(["FREE", "BASIC", "PROFESSIONAL", "ENTERPRISE"]),
})

interface EditTenantModalProps {
    tenant: {
        id: string
        name: string
        plan: string
    }
    isOpen: boolean
    onClose: () => void
}

export function EditTenantModal({
    tenant,
    isOpen,
    onClose,
}: EditTenantModalProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: tenant.name,
            plan: tenant.plan as any,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true)
            const res = await updateTenant(tenant.id, values as any)
            if (res.success) {
                toast.success("Tenant updated successfully")
                onClose()
            } else {
                toast.error(res.message || "Failed to update tenant")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-2xl max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Organization</DialogTitle>
                    <DialogDescription>
                        Update the organization name and subscription plan.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                        Organization Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Enter name" {...field} className="rounded-xl" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="plan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                        Subscription Plan
                                    </FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder="Select a plan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="FREE">Free</SelectItem>
                                            <SelectItem value="BASIC">Basic</SelectItem>
                                            <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                                            <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <div className="pt-6 flex items-center justify-end gap-2">
                            <Button
                                disabled={loading}
                                variant="ghost"
                                onClick={onClose}
                                type="button"
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                type="submit"
                                className="rounded-xl px-8 shadow-lg premium-shadow"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
