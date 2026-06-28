'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Plus, Clock, ArrowRight, Activity, Heart, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PatientFamilyManager from "./patient-family-manager";

interface Appointment {
    id: string;
    startTime: Date;
    status: string;
    doctor: {
        user: { name: string | null };
        specialization: string;
    };
}

interface Prescription {
    id: string;
    createdAt: Date;
    doctor: {
        user: { name: string | null };
    };
    diagnosis: string | null;
}

interface PatientDashboardProps {
    patientName: string;
    patientId: string;
    appointments: Appointment[];
    prescriptions: Prescription[];
    dependents: any[];
}

export default function PatientDashboard({ patientName, patientId, appointments, prescriptions, dependents }: PatientDashboardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatDate = (date: Date) => {
        if (!mounted) return "";
        return new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (date: Date) => {
        if (!mounted) return "";
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!mounted) return null;

    const upcomingAppointments = appointments.filter(a => ['SCHEDULED', 'CONFIRMED'].includes(a.status));
    const pastAppointments = appointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status));

    return (
        <div className="space-y-8 pb-12">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        Hello, {patientName}
                    </h2>
                    <p className="text-muted-foreground mt-1">Your wellness overview for today.</p>
                </div>
                <Link href="./appointments/new">
                    <Button className="rounded-xl shadow-md premium-shadow hover:scale-105 transition-transform">
                        <Plus className="mr-2 h-4 w-4" /> Book Appointment
                    </Button>
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card border-none overflow-hidden relative md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg italic text-primary">
                            <Calendar className="h-5 w-5" />
                            Clinical Timeline
                        </CardTitle>
                        <CardDescription>Your upcoming and recent consultations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Upcoming Section */}
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                                    Upcoming Appointments
                                </h4>
                                {upcomingAppointments.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingAppointments.map((appt, idx) => (
                                            <motion.div
                                                key={appt.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-sm group hover:shadow-md transition-all"
                                            >
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center text-blue-600">
                                                        <span className="text-[10px] font-bold uppercase">{new Date(appt.startTime).toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-lg font-bold leading-none">{new Date(appt.startTime).getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">
                                                            {formatTime(appt.startTime)} with Dr. {appt.doctor.user.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{appt.doctor.specialization}</p>
                                                    </div>
                                                </div>
                                                <Badge className="rounded-full text-[9px] font-bold uppercase px-2 bg-blue-500 hover:bg-blue-600">
                                                    {appt.status}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <Clock className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-[11px] text-muted-foreground">You have no scheduled visits at this time.</p>
                                        <Link href="./appointments/new" className="mt-3 inline-block">
                                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg border-primary/20 text-primary hover:bg-primary/5">
                                                Book Consultation
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Past Section */}
                            {pastAppointments.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Recently Completed</h4>
                                    <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                                        {pastAppointments.slice(0, 2).map((appt) => (
                                            <div
                                                key={appt.id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50"
                                            >
                                                <div className="flex gap-3 items-center">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                        <Activity size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            {formatDate(appt.startTime)} - Dr. {appt.doctor.user.name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground uppercase">{appt.status}</p>
                                                    </div>
                                                </div>
                                                <Link href={`./appointments/${appt.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                                                        <ArrowRight size={12} />
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-center">
                            <Link href="./appointments" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1 group">
                                View Full Clinical History <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="glass-card border-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-5 w-5 text-primary" />
                                Prescriptions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {prescriptions.slice(0, 3).map((pres, idx) => (
                                    <motion.div
                                        key={pres.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                        className="flex items-center justify-between group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                                <Shield size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold truncate max-w-[120px]">{pres.diagnosis || "Medical Report"}</p>
                                                <p className="text-[10px] text-muted-foreground">{formatDate(pres.createdAt)}</p>
                                            </div>
                                        </div>
                                        <Link href={`./appointments/${(pres as any).appointmentId || '#'}`}>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary hover:text-white">
                                                <ArrowRight size={14} />
                                            </Button>
                                        </Link>
                                    </motion.div>
                                ))}
                                {prescriptions.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic text-center py-4">No records found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <PatientFamilyManager
                        dependents={dependents}
                        patientId={patientId}
                    />

                    <Card className="glass-card border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-600" />
                                Health Snapshot
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-emerald-100/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Vitals Check</p>
                                    <p className="text-sm font-bold text-emerald-700">Stable</p>
                                </div>
                                <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-emerald-100/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Vaccinations</p>
                                    <p className="text-sm font-bold text-blue-700">Up to date</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all group">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText size={16} />
                                </div>
                                <span className="text-[10px] font-bold">Last Report</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all group">
                                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <Shield size={16} />
                                </div>
                                <span className="text-[10px] font-bold">Insurance</span>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-none relative overflow-hidden group">
                        <CardContent className="p-6">
                            <Heart className="absolute -right-2 -bottom-2 h-20 w-20 text-primary/10 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10">
                                <div className="p-2 bg-primary/10 rounded-xl w-fit mb-3">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <h4 className="font-bold text-sm text-primary">Emergency Support</h4>
                                <p className="text-xs text-muted-foreground mt-1">Access 24/7 priority care for urgent medical situations.</p>
                                <a href="tel:+1800-HEALTH-SAAS" className="block w-full">
                                    <Button size="sm" className="mt-4 rounded-lg w-full bg-primary text-white hover:bg-primary/90">
                                        Call Helpline
                                    </Button>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
