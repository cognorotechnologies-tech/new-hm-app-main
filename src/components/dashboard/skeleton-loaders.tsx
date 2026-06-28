"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-800", className)}
            {...props}
        />
    );
}

export function DashboardHeaderSkeleton() {
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="glass-card p-6 rounded-2xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />

            <motion.div
                className="absolute bottom-0 left-0 h-1 bg-primary/20"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                </div>
            ))}
        </div>
    );
}
