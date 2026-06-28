"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Calendar,
    Settings,
    LogOut,
    Building2,
    Package,
    Receipt,
    FlaskConical,
    Briefcase,
    Megaphone,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth-actions";
import { useSidebar } from "./dashboard-shell";

import { isModuleEnabled, ModuleName } from "@/lib/feature-flags";

export default function TenantSidebar({
    domain,
    role,
    branding,
    settings
}: {
    domain: string,
    role: string,
    branding?: any,
    settings?: any
}) {
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const pathname = usePathname();

    // Responsive auto-collapse
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems: { label: string, icon: any, href: string, roles: string[], module?: ModuleName, color?: string }[] = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'HR_MANAGER'] },
        { label: "Patients", icon: Users, href: "/patients", roles: ['ADMIN'], module: "patients" },
        { label: "Doctors", icon: Stethoscope, href: "/doctors", roles: ['ADMIN'], module: "patients" }, // Using patients as proxy or no module
        { label: "Departments", icon: Building2, href: "/departments", roles: ['ADMIN'] },
        { label: "Appointments", icon: Calendar, href: "/appointments", roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'], module: "appointments" },
        { label: "Inventory", icon: Package, href: "/inventory", roles: ['ADMIN', 'DOCTOR', 'NURSE'], module: "pharmacy" },
        { label: "Billing", icon: Receipt, href: "/billing", roles: ['ADMIN', 'RECEPTIONIST'], module: "billing" },
        { label: "Laboratory", icon: FlaskConical, href: "/lab", roles: ['ADMIN', 'DOCTOR', 'NURSE'], module: "lab" },
        { label: "HR Management", icon: Briefcase, href: "/hr", roles: ['ADMIN', 'HR_MANAGER', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'DOCTOR'], module: "hr" },
        { label: "Engagement", icon: Megaphone, href: "/hr/campaigns", roles: ['ADMIN', 'HR_MANAGER'], color: "text-indigo-600", module: "crm" },
        { label: "Settings", icon: Settings, href: "/settings", roles: ['ADMIN'] },
    ];

    const filteredItems = navItems.filter(item => {
        const hasRole = item.roles.includes(role);
        const moduleEnabled = !item.module || isModuleEnabled({ settings }, item.module);
        return hasRole && moduleEnabled;
    });

    const primaryColor = branding?.primaryColor || "var(--primary)";

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 256 }}
            className={cn(
                "h-screen glass border-r flex flex-col fixed left-0 top-0 z-50 transition-all duration-300",
                "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50"
            )}
        >
            <div className="p-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 h-16">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 overflow-hidden"
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: branding?.primaryColor || "rgb(59 130 246)" }}
                        >
                            HM
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold truncate">Healthcare</h1>
                            <p className="text-[10px] text-muted-foreground uppercase leading-none">{role.replace('_', ' ')}</p>
                        </div>
                    </motion.div>
                )}
                {isCollapsed && (
                    <div
                        className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: branding?.primaryColor || "rgb(59 130 246)" }}
                    >
                        H
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </Button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
                {!isCollapsed && (
                    <div className="px-3 mb-4">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-muted-foreground bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-800/50 rounded-xl h-9"
                            onClick={() => {
                                const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                                document.dispatchEvent(e);
                            }}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            <span className="text-xs">Search...</span>
                            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </Button>
                    </div>
                )}

                {filteredItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "group relative flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer mb-1",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground"
                            )}>
                                <item.icon className={cn(
                                    "h-5 w-5 transition-transform duration-200 group-hover:scale-110 shrink-0",
                                    isActive ? "text-primary" : item.color || "text-slate-500"
                                )} />

                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
                                        style={{ color: isActive ? primaryColor : "inherit" }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}

                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 w-1 h-6 rounded-r-full"
                                        style={{ backgroundColor: primaryColor }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                {isCollapsed && (
                                    <div className="absolute left-16 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[60] font-medium whitespace-nowrap">
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <form action={logout}>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl",
                            isCollapsed && "px-0 justify-center"
                        )}
                    >
                        <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </Button>
                </form>
            </div>
        </motion.div>
    );
}
