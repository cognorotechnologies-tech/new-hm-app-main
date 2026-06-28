'use client';

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function GracePeriodBanner({
    status,
    domain
}: {
    status: 'GRACE' | 'RESTRICTED' | 'EXPIRED' | string;
    domain: string;
}) {
    if (status === 'ACTIVE' || !status) return null;

    const getConfig = (s: string) => {
        switch (s) {
            case 'GRACE':
                return {
                    title: "Subscription Overdue",
                    description: "Your subscription payment is overdue. Please settle it to avoid feature interruption.",
                    variant: "warning",
                    icon: AlertTriangle
                };
            case 'RESTRICTED':
                return {
                    title: "Access Restricted",
                    description: "Premium features are currently locked due to non-payment. Please upgrade or renew.",
                    variant: "destructive",
                    icon: ShieldAlert
                };
            case 'EXPIRED':
                return {
                    title: "Subscription Expired",
                    description: "Your subscription has expired. Most features are now locked.",
                    variant: "destructive",
                    icon: ShieldAlert
                };
            default:
                return null;
        }
    };

    const config = getConfig(status);
    if (!config) return null;

    return (
        <div className="mb-6">
            <Alert variant={config.variant === 'warning' ? 'default' : 'destructive'} className={config.variant === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : ''}>
                <config.icon className="h-4 w-4" />
                <AlertTitle className="font-bold">{config.title}</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                    <span>{config.description}</span>
                    <Button variant={config.variant === 'warning' ? 'outline' : 'secondary'} size="sm" asChild className="ml-4">
                        <Link href={`/${domain}/billing`}>Solve Now</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    );
}
