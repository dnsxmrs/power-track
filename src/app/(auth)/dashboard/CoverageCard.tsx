'use client';

import { GlassCard } from '@/app/components/GlassCard';
import { useDashboardContext } from './DashboardDataProvider';

export function CoverageCard() {
    const { dashboard } = useDashboardContext();

    if (dashboard.status === 'loading') {
        return (
            <div className="glass-panel rounded-2xl p-6 border border-white/8 space-y-3" aria-hidden="true">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-6 w-56 rounded bg-white/10 animate-pulse" />
                        <div className="h-4 w-96 max-w-full rounded bg-white/10 animate-pulse" />
                    </div>
                    <div className="space-y-2 flex flex-col items-end">
                        <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                        <div className="h-4 w-40 rounded bg-white/10 animate-pulse mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 mt-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 space-y-2">
                            <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                            <div className="h-4 w-12 rounded bg-white/10 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (dashboard.status === 'error') {
        return (
            <GlassCard>
                <h2 className="text-base font-semibold text-white">Dashboard unavailable</h2>
                <p className="mt-2 text-sm text-slate-400">{dashboard.error}</p>
            </GlassCard>
        );
    }

    const data = dashboard.data;

    return (
        <div className="glass-panel rounded-2xl p-6 border border-white/8 space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Current data coverage</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        The dashboard is now reading live telemetry from the database. Anything not backed by the current schema is marked NA.
                    </p>
                </div>
                <div className="text-right text-sm text-slate-400">
                    <div className="font-medium text-slate-200">Latest reading</div>
                    <div>{data.latestReadingAt ? new Date(data.latestReadingAt).toLocaleString() : 'NA'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Charts</div>
                    <div className="mt-1 text-sm font-medium text-slate-200">{data.coverage.charts}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Insights</div>
                    <div className="mt-1 text-sm font-medium text-slate-200">{data.coverage.insights}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Recommendations</div>
                    <div className="mt-1 text-sm font-medium text-slate-200">{data.coverage.recommendations}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Branch Overview</div>
                    <div className="mt-1 text-sm font-medium text-slate-200">{data.coverage.branchOverview}</div>
                </div>
            </div>
        </div>
    )
}