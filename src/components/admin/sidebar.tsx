import Link from "next/link";
import {
    LayoutDashboard,
    Building2,
    Settings,
    LogOut,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { logout } from "@/app/actions/auth-actions";

export default function AdminSidebar() {
    return (
        <div className="h-screen w-64 glass dark:bg-slate-950/80 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col fixed left-0 top-0 z-[100] transition-all duration-300">
            <div className="p-8 border-b border-slate-200/50 dark:border-slate-800/50">
                <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 text-transparent bg-clip-text tracking-tight">
                    SuperAdmin
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">Platform Control</p>
            </div>

            <nav className="flex-1 p-4 mt-4 space-y-1">
                {[
                    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
                    { label: "Tenants", icon: Building2, href: "/admin/tenants" },
                    { label: "Users", icon: Users, href: "/admin/users" },
                    { label: "Settings", icon: Settings, href: "/admin/settings" },
                ].map((item) => (
                    <Link key={item.href} href={item.href} className="block group">
                        <Button
                            variant="ghost"
                            className="w-full justify-start rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 group-active:scale-95"
                        >
                            <item.icon className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                            <span className="font-semibold">{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30">
                <form action={logout}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span className="font-bold">Sign Out</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
