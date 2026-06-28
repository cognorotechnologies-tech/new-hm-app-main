'use client';

import { useActionState } from "react";
// import { useFormState } from "react-dom"; // React 18
import { createTenant } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Tenant
        </Button>
    );
}

const initialState = {
    success: false,
    message: "",
    errors: {},
};

export default function CreateTenantForm() {
    const [state, dispatch] = useActionState(createTenant, initialState);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Tenant</CardTitle>
                <CardDescription>Add a new hospital or clinic to the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input id="name" name="name" placeholder="City General Hospital" required />
                            {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Subdomain Slug</Label>
                            <Input id="slug" name="slug" placeholder="city-general" required />
                            {state?.errors?.slug && <p className="text-sm text-red-500">{state.errors.slug}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="plan">Subscription Plan</Label>
                        <Select name="plan" defaultValue="FREE">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FREE">Free</SelectItem>
                                <SelectItem value="BASIC">Basic</SelectItem>
                                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-medium mb-4">Admin User</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="adminName">Admin Name</Label>
                                <Input id="adminName" name="adminName" placeholder="Admin Name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="adminEmail">Admin Email</Label>
                                <Input id="adminEmail" name="adminEmail" type="email" placeholder="admin@example.com" required />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="adminPassword">Password</Label>
                                <Input id="adminPassword" name="adminPassword" type="password" required />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        {state?.message && (
                            <p className={`text-sm mb-4 ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                                {state.message}
                            </p>
                        )}
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
