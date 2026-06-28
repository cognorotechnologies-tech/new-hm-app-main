'use client'

import { useActionState } from 'react'
import { startTransition, useEffect, useState } from 'react'
import { registerPatient } from '@/app/actions/patient-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const initialState = {
    message: undefined,
    errors: {}
}

export default function RegisterFormClient({ tenantId, domain }: { tenantId: string, domain: string }) {
    const [state, formAction, isPending] = useActionState(registerPatient, initialState)
    const router = useRouter()

    useEffect(() => {
        if (state.success) {
            const timer = setTimeout(() => {
                router.push(`./login?registered=true`)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [state.success, router])

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="tenantId" value={tenantId} />

            {state.message && (
                <Alert variant={state.success ? "default" : "destructive"} className={state.success ? "border-green-500 text-green-700" : ""}>
                    {state.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{state.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
                {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="1234567890" required />
                {state.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" name="dob" type="date" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select name="gender">
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
                {state.errors?.password && <p className="text-sm text-red-500">{state.errors.password[0]}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Registering...' : 'Create Account'}
            </Button>
        </form>
    )
}
