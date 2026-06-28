'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, Building2, Stethoscope, Palette, Rocket, ArrowRight, ArrowLeft, Trophy } from "lucide-react";
import BrandingEditor from "@/components/admin/branding-editor";
import { updateOwnBranding, completeSetup } from "@/app/actions/tenant-actions";
import { createDepartment } from "@/app/actions/department-actions";
import { createDoctor } from "@/app/actions/doctor-actions";

interface SetupWizardProps {
    tenantId: string;
    tenantName: string;
    initialBranding: any;
}

export default function SetupWizard({ tenantId, tenantName, initialBranding }: SetupWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form States
    const [deptName, setDeptName] = useState("General Medicine");
    const [createdDepartmentId, setCreatedDepartmentId] = useState<string | null>(null);
    const [doctorData, setDoctorData] = useState({
        name: "",
        email: "",
        password: "Password123!",
        specialization: "General Practice",
        phone: "",
        gender: "MALE",
        experienceYears: "0",
        qualifications: "",
        bio: "",
        consultationFee: "0"
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleCreateDepartment = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("name", deptName);
        formData.append("tenantId", tenantId);

        const result = await createDepartment({}, formData);
        if (result.message?.includes("successfully")) {
            if (result.data?.id) {
                setCreatedDepartmentId(result.data.id);
            }
            toast.success("Department created!");
            nextStep();
        } else {
            toast.error(result.message || "Failed to create department");
        }
        setLoading(false);
    };

    const handleCreateDoctor = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("name", doctorData.name);
        formData.append("email", doctorData.email);
        formData.append("password", doctorData.password);
        formData.append("phone", doctorData.phone || "0000000000"); // Default if empty
        formData.append("specialization", doctorData.specialization);
        formData.append("tenantId", tenantId);
        formData.append("departmentId", createdDepartmentId || "");

        // New fields
        formData.append("gender", doctorData.gender);
        formData.append("experienceYears", doctorData.experienceYears);
        formData.append("qualifications", doctorData.qualifications);
        formData.append("bio", doctorData.bio);
        formData.append("consultationFee", doctorData.consultationFee);

        const result = await createDoctor({}, formData);
        if (result.message?.includes("successfully")) {
            toast.success("Doctor account created!");
            await completeSetup(tenantId);
            setStep(5); // Success step
        } else {
            console.error("Setup Wizard Doctor Error:", result.errors);
            toast.error(result.message || "Failed to create doctor");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
                <div className="h-2 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }}
                    />
                </div>

                <CardHeader className="pt-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {step === 1 && <Rocket className="h-8 w-8 text-primary" />}
                        {step === 2 && <Palette className="h-8 w-8 text-primary" />}
                        {step === 3 && <Building2 className="h-8 w-8 text-primary" />}
                        {step === 4 && <Stethoscope className="h-8 w-8 text-primary" />}
                        {step === 5 && <Trophy className="h-8 w-8 text-primary" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {step === 1 && `Welcome to ${tenantName}`}
                        {step === 2 && "Personalize Your Brand"}
                        {step === 3 && "Create Your First Department"}
                        {step === 4 && "Add Your First Doctor"}
                        {step === 5 && "Congratulations!"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Let's get your organization ready in a few simple steps."}
                        {step === 2 && "Customize the colors and typography of your hospital dashboard."}
                        {step === 3 && "Departments help organize your medical services."}
                        {step === 4 && "Create the first clinical account to start seeing patients."}
                        {step === 5 && "You've successfully completed the basic setup."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="py-6 px-8 min-h-[300px]">
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center space-y-6 text-center">
                            <div className="space-y-4 max-w-md">
                                <p className="text-slate-600 dark:text-slate-400">
                                    You're just minutes away from a fully functional digital hospital.
                                </p>
                                <ul className="text-left space-y-3 mx-auto w-fit">
                                    <li className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-xs font-bold">1</div>
                                        <span>Visual Branding & Theme</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-xs font-bold">2</div>
                                        <span>Medical Departments</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-xs font-bold">3</div>
                                        <span>Clinical Staff Accounts</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-auto">
                            <BrandingEditor
                                tenantId={tenantId}
                                initialBranding={initialBranding}
                                action={updateOwnBranding}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="dept-name">Department Name</Label>
                                <Input
                                    id="dept-name"
                                    value={deptName}
                                    onChange={(e) => setDeptName(e.target.value)}
                                    placeholder="e.g. Cardiology, Pediatrics"
                                />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={doctorData.name}
                                        onChange={(e) => setDoctorData({ ...doctorData, name: e.target.value })}
                                        placeholder="Dr. John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Specialization</Label>
                                    <Input
                                        value={doctorData.specialization}
                                        onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}
                                        placeholder="e.g. Cardiologist"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        value={doctorData.email}
                                        onChange={(e) => setDoctorData({ ...doctorData, email: e.target.value })}
                                        placeholder="john@hospital.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select
                                        value={doctorData.gender}
                                        onValueChange={(v) => setDoctorData({ ...doctorData, gender: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[200]">
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Experience (Years)</Label>
                                    <Input
                                        type="number"
                                        value={doctorData.experienceYears}
                                        onChange={(e) => setDoctorData({ ...doctorData, experienceYears: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Consultation Fee</Label>
                                    <Input
                                        type="number"
                                        value={doctorData.consultationFee}
                                        onChange={(e) => setDoctorData({ ...doctorData, consultationFee: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Medical Qualifications</Label>
                                <Input
                                    value={doctorData.qualifications}
                                    onChange={(e) => setDoctorData({ ...doctorData, qualifications: e.target.value })}
                                    placeholder="e.g. MBBS, MD"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Professional Biography</Label>
                                <Input
                                    value={doctorData.bio}
                                    onChange={(e) => setDoctorData({ ...doctorData, bio: e.target.value })}
                                    placeholder="Brief background..."
                                />
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in duration-500">
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                            <div className="space-y-2">
                                <p className="text-xl font-bold">Your Hospital is Ready!</p>
                                <p className="text-muted-foreground">You can now start managing appointments, patients, and staff from your unified dashboard.</p>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-between">
                    {step > 1 && step < 5 ? (
                        <Button variant="ghost" onClick={prevStep} disabled={loading}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : <div />}

                    <div className="flex gap-3">
                        {step === 1 && (
                            <Button onClick={nextStep} className="px-8 rounded-xl font-bold">
                                Get Started <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        {step === 2 && (
                            <Button variant="outline" onClick={nextStep} className="rounded-xl">
                                Skip for Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        {step === 3 && (
                            <Button onClick={handleCreateDepartment} disabled={loading || !deptName} className="rounded-xl">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create & Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        {step === 4 && (
                            <Button onClick={handleCreateDoctor} disabled={loading || !doctorData.name || !doctorData.email} className="rounded-xl">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create & Finish <CheckCircle2 className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        {step === 5 && (
                            <Button onClick={() => window.location.reload()} className="px-8 rounded-xl font-bold">
                                Enter Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
