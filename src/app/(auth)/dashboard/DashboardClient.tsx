'use client';

import { motion } from 'framer-motion';
import { ClockIcon } from 'lucide-react';
import { MetricGrid } from './_components/MetricGrid';
import { GlassCard } from '@/app/components/GlassCard';
import type { StatusType } from '@/app/types/status';

interface DashboardMetric {
    title: string;
    value: string | number;
    unit?: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    status: StatusType;
    glowColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'red' | 'none';
}

interface DashboardData {
    metrics: DashboardMetric[];
    coverage: {
        charts: 'NA';
        insights: 'NA';
        recommendations: 'NA';
        branchOverview: 'NA';
    };
    latestReadingAt: string | null;
}

interface DashboardClientProps {
    data: DashboardData;
}

export function DashboardClient({ data }: DashboardClientProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Good morning, Admin. Here&apos;s your system overview.</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400 bg-white/3 px-4 py-2 rounded-lg border border-white/5">
                    <ClockIcon className="w-4 h-4 text-[#00d4ff]" />
                    <span>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <MetricGrid metrics={data.metrics} />

            <GlassCard className="space-y-3">
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
            </GlassCard>

            {/* Middle Section: Chart & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* <UsageCharts data={data.chartData} />
                <SystemStatus /> */}
            </div>

            {/* Smart Insights Panel */}
            {/* <SmartInsights data={data.insightsData} /> */}

            {/* Recommendations Panel */}
            {/* <Recommendations data={data.recommendationsData} /> */}

            {/* Bottom Section: 3 Columns */}
            {/* <BottomPanels
                topAreas={data.topAreas}
                branches={data.branchOverviewData}
                alerts={data.recentAlerts}
            /> */}
        </motion.div>
    );
}
