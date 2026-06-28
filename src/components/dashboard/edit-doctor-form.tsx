'use client';

import { useTransition, useState, useEffect } from 'react';
import { updateDoctor } from '@/app/actions/doctor-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EditDoctorFormProps {
    doctor: any;
    departments: { id: string, name: string }[];
}

export default function EditDoctorForm({ doctor, departments }: EditDoctorFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: doctor.name || "",
        email: doctor.email || "",
        phone: doctor.phone || "",
        specialization: doctor.doctorProfile?.specialization || "General Practice",
        departmentId: doctor.doctorProfile?.departmentId || "",
        licenseNumber: doctor.doctorProfile?.licenseNumber || "",
        password: "", // Keep empty unless updating
        bio: doctor.doctorProfile?.bio || "",
        qualifications: doctor.doctorProfile?.qualifications || "",
        experienceYears: doctor.doctorProfile?.experienceYears?.toString() || "0",
        gender: doctor.doctorProfile?.gender || "MALE",
        consultationFee: doctor.doctorProfile?.consultationFee?.toString() || "0",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await updateDoctor(doctor.id, formData);
            if (result.success) {
                toast.success(result.message);
                router.push('../'); // Go back to doctors list
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-none glass-card premium-shadow rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent italic">
                            Edit Professional Profile
                        </CardTitle>
                        <CardDescription>
                            Update clinical information and security credentials for Dr. {doctor.name}
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-8">
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Dr. John Doe"
                                className="rounded-xl h-11 border-slate-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Department</Label>
                            <Select
                                value={formData.departmentId}
                                onValueChange={(v) => handleSelectChange('departmentId', v)}
                                required
                            >
                                <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@hospital.com"
                                className="rounded-xl h-11 border-slate-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 234 567 890"
                                className="rounded-xl h-11 border-slate-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(v) => handleSelectChange('gender', v)}
                            >
                                <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience (Years)</Label>
                            <Input
                                name="experienceYears"
                                type="number"
                                value={formData.experienceYears}
                                onChange={handleChange}
                                placeholder="0"
                                className="rounded-xl h-11 border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consultation Fee</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-sm text-slate-400">$</span>
                                <Input
                                    name="consultationFee"
                                    type="number"
                                    value={formData.consultationFee}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="rounded-xl h-11 border-slate-200 pl-7"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medical Qualifications</Label>
                        <Input
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleChange}
                            placeholder="e.g. MBBS, MD, FRCS"
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Biography</Label>
                        <Input
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Brief overview of clinical expertise..."
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medical License</Label>
                            <Input
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                placeholder="MED-123456"
                                className="rounded-xl h-11 border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reset Password (Leave blank to keep current)</Label>
                            <Input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="New Password (min 6 chars)"
                                className="rounded-xl h-11 border-slate-200"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full rounded-xl h-11 font-bold shadow-lg premium-shadow" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Update Doctor Profile
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
