"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Calendar,
    Users,
    Stethoscope,
    Package,
    Receipt,
    LogOut,
    Settings,
    Plus,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth-actions";

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();

    const toggle = useCallback(() => setIsOpen((open) => !open), []);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggle();
            }
            if (e.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [toggle]);

    const items = [
        { id: "dashboard", label: "Dashboard", icon: Search, href: "/dashboard", group: "Pages" },
        { id: "patients", label: "Patients", icon: Users, href: "/patients", group: "Pages" },
        { id: "doctors", label: "Doctors", icon: Stethoscope, href: "/doctors", group: "Pages" },
        { id: "appointments", label: "Appointments", icon: Calendar, href: "/appointments", group: "Pages" },
        { id: "inventory", label: "Inventory", icon: Package, href: "/inventory", group: "Pages" },
        { id: "billing", label: "Billing", icon: Receipt, href: "/billing", group: "Pages" },
        { id: "new-appointment", label: "Book Appointment", icon: Plus, href: "/appointments", group: "Actions" },
        { id: "settings", label: "Settings", icon: Settings, href: "/settings", group: "System" },
        { id: "logout", label: "Sign Out", icon: LogOut, action: logout, group: "System" },
    ];

    const filteredItems = query
        ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
        : items;

    const handleSelect = (item: any) => {
        setIsOpen(false);
        setQuery("");
        if (item.href) router.push(item.href);
        if (item.action) item.action();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800">
                            <Search className="h-5 w-5 text-muted-foreground mr-3" />
                            <input
                                autoFocus
                                placeholder="Search for pages, patients, or actions..."
                                className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] text-muted-foreground font-sans">ESC</kbd>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {filteredItems.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No results found for "{query}".
                                </div>
                            )}

                            {["Pages", "Actions", "System"].map(group => {
                                const groupItems = filteredItems.filter(i => i.group === group);
                                if (groupItems.length === 0) return null;

                                return (
                                    <div key={group} className="mb-2">
                                        <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            {group}
                                        </div>
                                        {groupItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                                        <item.icon size={18} />
                                                    </div>
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                </div>
                                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">↵</kbd> Select
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">↑↓</kbd> Navigate
                                </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium">Healthcare SaaS Pro</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
