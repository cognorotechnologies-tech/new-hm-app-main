'use client';

import LoginForm from '@/components/auth/login-form';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Users, Globe } from 'lucide-react';

export default function RootLoginPage() {
    return (
        <div className="flex min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
            {/* Left: Brand Section (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px] animate-pulse delay-700" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                            <ShieldCheck className="h-4 w-4" />
                            System Administration Portal
                        </div>

                        <h1 className="text-6xl font-black text-white leading-[1] tracking-tighter">
                            Elevating <br />
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent italic">Clinical Excellence</span>
                        </h1>

                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
                            A unified ecosystem for patient-centric care, intelligent operations, and modern healthcare logistics.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            {[
                                { icon: Activity, label: "Real-time Metrics", sub: "Clinical insights" },
                                { icon: Users, label: "Multi-tenant", sub: "Enterprise scale" },
                                { icon: Globe, label: "Global Access", sub: "Cloud native" },
                                { icon: ShieldCheck, label: "HIPAA Ready", sub: "Security first" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="flex items-start gap-4 group p-3 rounded-2xl hover:bg-white/5 transition-all cursor-default"
                                >
                                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/5">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.label}</div>
                                        <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{item.sub}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom branding */}
                <div className="absolute bottom-8 left-12">
                    <div className="text-xl font-black text-white/20 tracking-tighter italic">
                        HEALTHMANAGER CORE v2.0
                    </div>
                </div>
            </div>

            {/* Right: Login Section */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50">
                <div className="w-full max-w-sm relative">
                    {/* Mobile Branding (Only visible on small screens) */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-4">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white pb-2">Root Administration</h2>
                        <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
                    </div>

                    <LoginForm slug="system" />

                    <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                        Authorized personnel only. All access is logged and monitored.
                    </p>
                </div>
            </div>
        </div>
    );
}
