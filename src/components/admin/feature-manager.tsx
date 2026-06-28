'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, ShieldCheck, Box, FlaskConical, Users, CreditCard, Megaphone, ClipboardList } from "lucide-react";
import { updateTenantSettings } from "@/app/actions/admin-actions";

interface FeatureManagerProps {
    tenantId: string;
    initialSettings: any;
}

const AVAILABLE_MODULES = [
    { id: "appointments", name: "Appointments & Scheduling", icon: ClipboardList, description: "Core booking engine and doctor calendars." },
    { id: "patients", name: "Patient Registry", icon: Users, description: "Unified patient profiles and medical history." },
    { id: "pharmacy", name: "Pharmacy & Inventory", icon: Box, description: "Inventory tracking and medication dispensing." },
    { id: "lab", name: "Laboratory Management", icon: FlaskConical, description: "Test orders, samples, and results processing." },
    { id: "billing", name: "Financials & Billing", icon: CreditCard, description: "Invoicing, payments, and revenue analytics." },
    { id: "campaigns", name: "Campaigns & Marketing", icon: Megaphone, description: "Health drives and patient engagement tools." },
    { id: "hr", name: "Human Resources", icon: Users, description: "Staff profiles, attendance, and payroll." },
];

export default function FeatureManager({ tenantId, initialSettings }: FeatureManagerProps) {
    const [settings, setSettings] = useState(initialSettings || {
        modules: {},
        quotas: {}
    });
    const [loading, setLoading] = useState(false);

    const toggleModule = (moduleId: string) => {
        const currentModules = settings.modules || {};
        const isEnabled = currentModules[moduleId]?.enabled !== false; // Default true if not explicitly false

        const newModules = {
            ...currentModules,
            [moduleId]: { enabled: !isEnabled }
        };

        setSettings({ ...settings, modules: newModules });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await updateTenantSettings(tenantId, settings);
            if (result.success) {
                toast.success("Settings updated successfully!");
            } else {
                toast.error(result.message || "Failed to update settings");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Feature Entitlements
                </CardTitle>
                <CardDescription>Enable or disable modules based on client requirements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    {AVAILABLE_MODULES.map((module) => {
                        const Icon = module.icon;
                        const isEnabled = settings.modules?.[module.id]?.enabled !== false;

                        return (
                            <div key={module.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{module.name}</p>
                                        <p className="text-xs text-muted-foreground">{module.description}</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={isEnabled}
                                    onCheckedChange={() => toggleModule(module.id)}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Module Access
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
