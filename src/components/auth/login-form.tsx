'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            variant="premium"
            className="w-full h-12 rounded-xl text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.97] group border-none"
            disabled={pending}
        >
            {pending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
            )}
        </Button>
    );
}

export default function LoginForm({ className, slug }: { className?: string, slug?: string }) {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <Card className={cn(
                "w-full max-w-sm border-none shadow-2xl relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-3xl pt-4",
                className
            )}>
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-500 to-cyan-500" />

                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black text-center tracking-tight text-slate-900 dark:text-white">
                        Health<span className="text-primary tracking-tighter">Manager</span>
                    </CardTitle>
                    <CardDescription className="text-center font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {slug ? `Credentials for organization: ${slug}` : 'Access your professional healthcare portal'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={dispatch} className="space-y-5">
                        {slug && <input type="hidden" name="slug" value={slug} />}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@hospital.com"
                                    className="pl-11 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-white/50 backdrop-blur-sm shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1 leading-none">
                                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Secure Password</Label>
                                <a href="#" className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors">Forgot Password?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-11 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-white/50 backdrop-blur-sm shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600 flex items-start gap-2"
                            >
                                <div className="h-4 w-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-black">!</div>
                                {errorMessage}
                            </motion.div>
                        )}

                        <div className="pt-2">
                            <LoginButton />
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-2 transition-opacity hover:opacity-100 opacity-60">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">Secure 256-bit AES Encryption</span>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
