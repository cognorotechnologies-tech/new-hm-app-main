'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserPlus, Baby, Trash2, Loader2, Heart, CalendarPlus } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDependent } from '@/app/actions/patient-actions';

interface Dependent {
    id: string;
    user: {
        name: string | null;
    };
    dob: Date | null;
    relationship: string | null;
}

interface PatientFamilyManagerProps {
    dependents: Dependent[];
    patientId: string;
}

export default function PatientFamilyManager({ dependents, patientId }: PatientFamilyManagerProps) {
    const router = useRouter();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    async function handleAddDependent(formData: FormData) {
        setLoading(true);
        try {
            const name = formData.get('name') as string;
            const dob = formData.get('dob') as string;
            const relationship = formData.get('relationship') as string;

            const result = await addDependent(patientId, { name, dob, relationship });
            if (result.success) {
                toast.success(`Welcome ${name} to the family!`);
                setIsAddOpen(false);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to add dependent");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="glass-card border-none overflow-hidden relative">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-primary" />
                        Family Hub
                    </CardTitle>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 text-primary">
                                <UserPlus size={16} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-2xl glass-card border-none">
                            <form action={handleAddDependent}>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 italic text-primary">
                                        <Plus className="h-5 w-5" />
                                        Add Dependent
                                    </DialogTitle>
                                    <DialogDescription>
                                        Register a family member (child, spouse, or senior) to manage their healthcare.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                                        <Input id="name" name="name" required placeholder="e.g. Rahul Sharma" className="rounded-xl border-slate-200" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date of Birth</Label>
                                        <Input id="dob" name="dob" type="date" required className="rounded-xl border-slate-200" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="relationship" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Relationship</Label>
                                        <Select name="relationship" defaultValue="CHILD">
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="Select relationship" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CHILD">Child</SelectItem>
                                                <SelectItem value="SPOUSE">Spouse</SelectItem>
                                                <SelectItem value="PARENT">Parent</SelectItem>
                                                <SelectItem value="SIBLING">Sibling</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={loading} className="w-full rounded-xl premium-shadow h-11 font-bold">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Initialize Dependent Profile
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <CardDescription>Manage healthcare for your loved ones.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 pt-2">
                    <AnimatePresence>
                        {dependents.length > 0 ? (
                            dependents.map((dep, idx) => (
                                <motion.div
                                    key={dep.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100/30 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                            <Baby size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{dep.user.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter tabular-nums">
                                                Born: {dep.dob ? new Date(dep.dob).toLocaleDateString() : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-blue-200 bg-blue-50 text-blue-600 rounded-full font-bold uppercase tracking-tighter">
                                            {dep.relationship || 'Dependent'}
                                        </Badge>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg"
                                                onClick={() => router.push(`./appointments/new?for=${dep.id}`)}
                                                title="Book Appointment"
                                            >
                                                <CalendarPlus size={14} />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                                                <Trash2 size={12} />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center group">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <Heart className="h-6 w-6 text-rose-300" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Your Family, Our Priority</p>
                                <p className="text-[10px] text-muted-foreground px-6 mt-1 italic">Register a spouse or child to coordinate their healthcare seamlessly.</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAddOpen(true)}
                                    className="mt-4 h-8 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
                                >
                                    Add Member
                                </Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
                {dependents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-50">
                        <p className="text-[10px] text-muted-foreground leading-tight italic">
                            Linked members share your billing and insurance preferences.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
