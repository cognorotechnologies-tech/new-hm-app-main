'use client';

import LoginForm from '@/components/auth/login-form';
import { motion } from 'framer-motion';
import { Hospital, ShieldCheck } from 'lucide-react';
import { use } from 'react';

export default function LoginPage({ params }: {
    params: Promise<{ domain: string }>;
}) {
    const { domain } = use(params);

    return (
        <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Dynamic Background Blobs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] opacity-60"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -90, 0],
                        x: [0, -50, 0],
                        y: [0, 100, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-cyan-500/10 blur-[140px] opacity-40"
                />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex p-4 bg-white dark:bg-slate-900 shadow-2xl premium-shadow rounded-[2.5rem] mb-6 border border-white/20 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Hospital className="h-10 w-10 text-primary relative z-10" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Secure Access</h2>
                        <div className="h-1 w-8 bg-primary/20 mx-auto rounded-full" />
                    </div>
                </motion.div>

                <LoginForm slug={domain} />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-12 flex items-center justify-center gap-6"
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">HIPAA Protected</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200" />
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trusted by Professionals</div>
                </motion.div>
            </div>
        </div>
    );
}
