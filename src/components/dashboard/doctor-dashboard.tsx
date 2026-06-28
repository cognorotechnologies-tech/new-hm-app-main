"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, ClipboardList, TrendingUp, TrendingDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { cn } from "@/lib/utils";

type Appointment = {
    id: string;
    startTime: Date;
    status: string;
    patient: {
        user: {
            name: string | null;
        }
    };
};

const trendData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 22 },
    { name: 'Fri', count: 30 },
    { name: 'Sat', count: 10 },
    { name: 'Sun', count: 5 },
];

const patientTypeData = [
    { name: 'New', count: 400, color: '#3b82f6' },
    { name: 'Follow-up', count: 700, color: '#0ea5e9' },
    { name: 'Emergency', count: 100, color: '#f43f5e' },
];

export default function DoctorDashboard({ doctorName, appointments = [] }: { doctorName: string, appointments?: Appointment[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatTime = (date: Date) => {
        if (!mounted) return "--:--";
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const stats = [
        {
            title: "Today's Appointments",
            value: appointments.length,
            icon: Calendar,
            trend: "+12%",
            isPositive: true,
            description: "Scheduled for today"
        },
        {
            title: "Pending Reports",
            value: 8,
            icon: ClipboardList,
            trend: "-2",
            isPositive: true,
            description: "To be reviewed"
        },
        {
            title: "Total Patients",
            value: 1240,
            icon: User,
            trend: "+180",
            isPositive: true,
            description: "Under your care"
        },
        {
            title: "Consultation Hours",
            value: "32h",
            icon: Clock,
            trend: "+4h",
            isPositive: true,
            description: "This month"
        }
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
                        Doctor Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">Welcome back, Dr. {doctorName}. Here's what's happening today.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200/60 shadow-sm">Export Report</Button>
                    <Link href="/appointments">
                        <Button className="rounded-xl shadow-md premium-shadow">New Appointment</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="glass-card border-none overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <stat.icon className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className={cn(
                                    "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                    stat.isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                                )}>
                                    {stat.isPositive ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 glass-card border-none">
                    <CardHeader>
                        <CardTitle className="text-lg">Patient Throughput</CardTitle>
                        <p className="text-xs text-muted-foreground">Weekly analytics of consultations performed.</p>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 glass-card border-none">
                    <CardHeader>
                        <CardTitle className="text-lg">Case Distribution</CardTitle>
                        <p className="text-xs text-muted-foreground">Split of patient visit types.</p>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={patientTypeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                                    {patientTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Upcoming Appointments</CardTitle>
                        <p className="text-xs text-muted-foreground">Total {appointments.length} appointments for today.</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                <TableHead className="font-bold">Time</TableHead>
                                <TableHead className="font-bold">Patient</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="text-right font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-32 text-muted-foreground italic">
                                        No upcoming appointments today. Take some rest!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                appointments.map((appt) => (
                                    <TableRow key={appt.id} className="group border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                {formatTime(appt.startTime)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-primary">
                                                    {(appt.patient.user.name || "P").substring(0, 1).toUpperCase()}
                                                </div>
                                                <span className="font-semibold">{appt.patient.user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                appt.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                                                    appt.status === 'SCHEDULED' ? "bg-blue-100 text-blue-700" :
                                                        "bg-amber-100 text-amber-700"
                                            )}>
                                                {appt.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/appointments/${appt.id}`}>
                                                <Button size="sm" variant="ghost" className="hover:bg-primary hover:text-white rounded-xl">View Details</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
