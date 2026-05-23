import { Metadata } from 'next';
import { ClockIcon } from 'lucide-react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
    title: 'Dashboard | PowerTrack',
    description: 'Monitor your energy consumption and system health in real-time.',
};

// any components for rendering dashboard metrics that rely on client-side interactivity or data fetching should be imported dynamically with suspense fallback to ensure the main dashboard page remains performant and responsive.
const MetricsCards = dynamic(() => import('./MetricGrid').then(m => m.MetricGrid));

const CoverageCards = dynamic(() => import('./CoverageCard').then(m => m.CoverageCard));

// skeleton for each component above
function MetricsCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={`metric-skeleton-${index}`}
                    className="glass-panel rounded-2xl p-6 h-34.5 border border-white/8"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                        <div className="h-5 w-16 rounded bg-white/10 animate-pulse" />
                    </div>
                    <div className="mt-3 h-8 w-20 rounded bg-white/10 animate-pulse" />
                </div>
            ))}
        </div>
    );
}

function CoverageCardsSkeleton() {
    return (
        <div className="glass-panel rounded-2xl p-6 border border-white/8 space-y-3" aria-hidden="true">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-6 w-56 rounded bg-white/10 animate-pulse" />
                    <div className="h-4 w-96 max-w-full rounded bg-white/10 animate-pulse" />
                </div>
                <div className="space-y-2 text-right">
                    <div className="h-4 w-24 ml-auto rounded bg-white/10 animate-pulse" />
                    <div className="h-4 w-40 ml-auto rounded bg-white/10 animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 mt-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`row-skeleton-${index}`} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 space-y-2">
                        <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                        <div className="h-4 w-12 rounded bg-white/10 animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default async function DashboardPage() {

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Good morning, Admin. Here&apos;s your system overview.</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400 bg-white/3 px-4 py-2 rounded-lg border border-white/5">
                    <ClockIcon className="w-4 h-4 text-[#00d4ff]" />
                    <span>
                        {today}
                    </span>
                </div>
            </div>

            {/* Metrics Section */}
            <section aria-label="Key Performance Indicators">
                <Suspense fallback={<MetricsCardsSkeleton />}>
                    <MetricsCards />
                </Suspense>
            </section>

            {/* Coverage card */}
            <section aria-label="Data Coverage">
                <Suspense fallback={<CoverageCardsSkeleton />}>
                    <CoverageCards />
                </Suspense>
            </section>
        </div>
    );
}
