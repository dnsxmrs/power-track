'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/app/components/GlassCard';
import { StatusBadge } from '@/app/components/StatusBadge';
import type { StatusType } from '@/app/types/status';

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

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

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
