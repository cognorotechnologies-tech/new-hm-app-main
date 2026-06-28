'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, Palette } from "lucide-react";
import { updateTenantBranding } from "@/app/actions/admin-actions";

interface BrandingEditorProps {
    tenantId: string;
    initialBranding: any;
    action?: (tenantId: string, branding: any) => Promise<{ success: boolean; message?: string }>;
}

export default function BrandingEditor({ tenantId, initialBranding, action }: BrandingEditorProps) {
    const [branding, setBranding] = useState(initialBranding || {
        primaryColor: "#3b82f6",
        secondaryColor: "#64748b",
        typography: "Inter",
        theme: "light",
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updateAction = action || updateTenantBranding;
            const result = await updateAction(tenantId, branding);
            if (result && 'success' in result && result.success) {
                toast.success("Branding updated successfully!");
                // Force a refresh if the primary color changed to update UI immediately
                if (branding.primaryColor !== (initialBranding as any)?.primaryColor) {
                    setTimeout(() => window.location.reload(), 1000);
                }
            } else {
                toast.error((result as any)?.message || "Failed to update branding");
            }
        } catch (error) {
            console.error("Branding save error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Visual Identity
                </CardTitle>
                <CardDescription>Customize the look and feel for this organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={branding.primaryColor}
                                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                className="w-12 h-10 p-1 rounded-lg cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={branding.primaryColor}
                                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                className="flex-1 font-mono"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={branding.secondaryColor}
                                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                className="w-12 h-10 p-1 rounded-lg cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={branding.secondaryColor}
                                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                className="flex-1 font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Typography</Label>
                        <Select
                            value={branding.typography}
                            onValueChange={(v) => setBranding({ ...branding, typography: v })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Inter">Inter (Sans)</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Outfit">Outfit</SelectItem>
                                <SelectItem value="Poppins">Poppins</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Default Theme</Label>
                        <Select
                            value={branding.theme}
                            onValueChange={(v) => setBranding({ ...branding, theme: v })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Branding Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
