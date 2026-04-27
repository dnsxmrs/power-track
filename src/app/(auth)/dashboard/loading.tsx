import { Skeleton } from '@/app/components/Skeleton';

export default function DashboardLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="glass-panel rounded-2xl p-6 h-32 border border-white/8">
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>

            {/* Middle Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel rounded-2xl p-6 lg:col-span-2 h-96 border border-white/8">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-6 w-48" />
                        <div className="flex space-x-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="glass-panel rounded-2xl p-6 h-96 border border-white/8">
                    <Skeleton className="h-6 w-32 mb-6" />
                    <div className="flex justify-center py-6 mb-6">
                        <Skeleton className="h-32 w-32 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
