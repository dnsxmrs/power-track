'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/app/components/GlassCard';
import type { LucideIcon } from 'lucide-react';
import {
    TargetIcon,
    LightbulbIcon,
    WindIcon,
    WrenchIcon
} from 'lucide-react';

type RecommendationIcon = 'LightbulbIcon' | 'WindIcon' | 'WrenchIcon';

const ICON_MAP: Record<RecommendationIcon, LucideIcon> = {
    LightbulbIcon,
    WindIcon,
    WrenchIcon
};

interface Recommendation {
    icon: RecommendationIcon;
    title: string;
    desc: string;
    action: string;
}

export function Recommendations({ data }: { data: Recommendation[] }) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={itemVariants}>
            <GlassCard className="w-full">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-[#00d4ff]/10 rounded-lg border border-[#00d4ff]/20">
                        <TargetIcon className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Recommended Actions</h2>
                        <p className="text-sm text-slate-400">Practical steps to optimize your energy usage</p>
                    </div>
                </div>

                <div className="space-y-3 mt-6">
                    {data.map((rec, idx) => {
                        const Icon = ICON_MAP[rec.icon];
                        return (
                            <div
                                key={idx}
                                className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/4 transition-colors"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0 mt-1 sm:mt-0">
                                        <Icon className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white mb-1">{rec.title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">{rec.desc}</p>
                                    </div>
                                </div>
                                <button className="shrink-0 px-4 py-2 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] text-sm font-medium rounded-lg border border-[#00d4ff]/20 transition-colors whitespace-nowrap">
                                    {rec.action}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </motion.div>
    );
}
