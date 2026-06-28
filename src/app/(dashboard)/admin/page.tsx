import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, Activity, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { CardDescription } from "@/components/ui/card";

async function getStats() {
    const tenantCount = await prisma.tenant.count();
    const userCount = await prisma.user.count();
    // Mock revenue for now
    const revenue = tenantCount * 499;

    return { tenantCount, userCount, revenue };
}

export default async function AdminDashboardPage() {
    const stats = await getStats();

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-1">
                <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-300 dark:to-white bg-clip-text text-transparent">
                    Platform Overview
                </h2>
                <p className="text-muted-foreground text-lg">Real-time health of your healthcare network.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                    { label: "Global Tenants", value: stats.tenantCount, icon: Building2, trend: "+2 this month", color: "from-blue-500 to-indigo-500" },
                    { label: "Active Users", value: stats.userCount, icon: Users, trend: "+12.5%", color: "from-purple-500 to-fuchsia-500" },
                    { label: "Monthly Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: "+4.2%", color: "from-emerald-500 to-teal-500" },
                ].map((stat) => (
                    <Card key={stat.label} className="glass-card overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                            <div className={cn("p-2 rounded-lg bg-gradient-to-br shadow-lg soft-shadow", stat.color)}>
                                <stat.icon className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black mt-2 tracking-tight">{stat.value}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.trend}</span>
                                <span className="text-xs text-muted-foreground">vs last period</span>
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to right, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[3]})` }} />
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="col-span-full lg:col-span-4 glass-card border-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Recent Network Activity</CardTitle>
                            <CardDescription>Latest events from across all medical facilities.</CardDescription>
                        </div>
                        <Activity className="h-5 w-5 text-primary animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { title: "New Tenant Secured", desc: "Demo Clinic (Slug: demo) has joined.", time: "2 min ago", icon: Building2 },
                                { title: "System Growth", desc: "User milestone reached: 10 active administrators.", time: "1 hour ago", icon: Users },
                            ].map((activity, idx) => (
                                <div key={idx} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-3 rounded-2xl transition-all duration-300">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <activity.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-bold leading-none">{activity.title}</p>
                                        <p className="text-sm text-muted-foreground">{activity.desc}</p>
                                    </div>
                                    <div className="text-xs font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{activity.time}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-full lg:col-span-3 glass-card border-none overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">System Health</CardTitle>
                        <CardDescription>Platform-wide infrastructure status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 mt-2">
                        {[
                            { label: "API Layers", status: "Operational", value: 99.9, color: "bg-emerald-500" },
                            { label: "Database Clusters", status: "Operational", value: 98.4, color: "bg-emerald-500" },
                            { label: "Identity Services", status: "Operational", value: 100, color: "bg-emerald-500" },
                        ].map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>{item.label}</span>
                                    <span className="text-muted-foreground">{item.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
