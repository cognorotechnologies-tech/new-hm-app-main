import { Skeleton, StatCardSkeleton, DashboardHeaderSkeleton } from "@/components/dashboard/skeleton-loaders";

export default function DashboardLoading() {
    return (
        <div className="space-y-8">
            <DashboardHeaderSkeleton />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <div className="md:col-span-4 h-[300px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                <div className="md:col-span-3 h-[300px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
            </div>

            <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 space-y-4">
                <Skeleton className="h-6 w-48 mb-4" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
