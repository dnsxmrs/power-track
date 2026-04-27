'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/app/components/GlassCard';
import type { LucideIcon } from 'lucide-react';
import {
    SparklesIcon,
    LightbulbIcon,
    AlertTriangleIcon,
    TrendingUpIcon,
    ThermometerIcon
} from 'lucide-react';

type InsightIcon = 'LightbulbIcon' | 'AlertTriangleIcon' | 'TrendingUpIcon' | 'ThermometerIcon';

const ICON_MAP: Record<InsightIcon, LucideIcon> = {
    LightbulbIcon,
    AlertTriangleIcon,
    TrendingUpIcon,
    ThermometerIcon
};

interface Insight {
    icon: InsightIcon;
    color: 'amber' | 'red' | 'blue';
    text: string;
    time: string;
}

export function SmartInsights({ data }: { data: Insight[] }) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={itemVariants}>
            <GlassCard className="w-full">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-[#00d4ff]/10 rounded-lg border border-[#00d4ff]/20">
                        <SparklesIcon className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Smart Insights</h2>
                        <p className="text-sm text-slate-400">AI-powered observations based on your usage patterns</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {data.map((insight, idx) => {
                        const Icon = ICON_MAP[insight.icon];
                        const colorClasses = {
                            amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.8)]',
                            red: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.8)]',
                            blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.8)]',
                        }[insight.color];

                        const borderClasses = {
                            amber: 'border-l-amber-500',
                            red: 'border-l-red-500',
                            blue: 'border-l-blue-500',
                        }[insight.color];

                        return (
                            <div
                                key={idx}
                                className={`bg-white/2 border border-white/5 border-l-2 ${borderClasses} rounded-xl p-4 flex items-start space-x-4 hover:bg-white/4 transition-colors`}
                            >
                                <div className={`p-2 rounded-full ${colorClasses} shrink-0`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-200 leading-relaxed mb-2">{insight.text}</p>
                                    <span className="text-xs font-medium text-slate-500">{insight.time}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </motion.div>
    );
}
