import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerPatient } from "@/app/actions/patient-actions";
import RegisterFormClient from "./register-form-client"; // Client component for form logic

export default async function RegisterPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
    });

    if (!tenant) return notFound();

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        {tenant.branding ? (tenant.branding as any).name : tenant.name}
                    </CardTitle>
                    <CardDescription className="text-center">
                        Create a patient account to book appointments and view history.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterFormClient tenantId={tenant.id} domain={domain} />
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
                    <div>
                        Already have an account?{" "}
                        <Link href={`./login`} className="underline underline-offset-4 hover:text-primary">
                            Login here
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
