'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/app/components/GlassCard';
import { StatusBadge } from '@/app/components/StatusBadge';
import type { StatusType } from '@/app/types/status';
import { useDashboardData } from './useDashboardData';

interface Metric {
    title: string;
    value: string | number;
    unit?: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    status: StatusType;
    glowColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'red' | 'none';
}

function MetricTile({ metric }: { metric: Metric }) {
    const trendColors = {
        up: 'text-red-400',
        down: 'text-emerald-400',
        neutral: 'text-slate-400',
    };
    const isUnavailable = metric.value === 'NA';

    return (
        <GlassCard
            className="flex h-full flex-col p-6"
            hover
            glowColor={metric.glowColor || (metric.status === 'warning' ? 'amber' : metric.title.includes('Health') ? 'cyan' : 'none')}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-sm font-medium text-slate-400">{metric.title}</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className={`text-3xl font-bold tracking-tight ${isUnavailable ? 'text-slate-500' : 'text-white'}`}>
                            {metric.value}
                        </span>
                        {metric.unit && <span className="text-sm font-medium text-slate-400">{metric.unit}</span>}
                    </div>
                </div>

                <StatusBadge status={metric.status} />
            </div>

            <div className="mt-5 flex items-center justify-start border-t border-white/5 pt-4">
                <span className={`text-xs font-medium ${isUnavailable ? 'text-slate-500' : trendColors[metric.trend]}`}>
                    {metric.trendValue}
                </span>
                <span className="text-xs text-slate-500">&nbsp;vs last month</span>
            </div>
        </GlassCard>
    );
}

export function MetricGrid() {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const { dashboard } = useDashboardData();

    if (dashboard.status === 'loading') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="glass-panel flex h-full flex-col p-6 rounded-2xl border border-white/8">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                                <div className="mt-3 flex items-baseline gap-2">
                                    <div className="h-8 w-20 rounded bg-white/10 animate-pulse" />
                                </div>
                            </div>
                            <div className="h-6 w-16 rounded-full bg-white/10 animate-pulse" />
                        </div>
                        <div className="mt-5 flex items-center justify-start border-t border-white/5 pt-4">
                            <div className="h-3 w-32 rounded bg-white/10 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (dashboard.status === 'error') {
        return (
            <div className="max-w-7xl mx-auto">
                <GlassCard>
                    <h2 className="text-base font-semibold text-white">Dashboard unavailable</h2>
                    <p className="mt-2 text-sm text-slate-400">{dashboard.error}</p>
                </GlassCard>
            </div>
        );
    }

    const metrics = dashboard.data.metrics;


    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {metrics.map((metric) => (
                <motion.div key={metric.title} variants={itemVariants}>
                    <MetricTile metric={metric} />
                </motion.div>
            ))}
        </div>
    );
}
