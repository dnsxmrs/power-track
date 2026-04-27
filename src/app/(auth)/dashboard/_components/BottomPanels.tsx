'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/app/components/GlassCard';
import { StatusBadge } from '@/app/components/StatusBadge';
import type { StatusType } from '@/app/types/status';
import { ArrowRightIcon } from 'lucide-react';

interface Area {
    name: string;
    value: number;
    percentage: number;
    color: string;
}

interface Branch {
    name: string;
    usage: number;
    status: StatusType;
}

interface Alert {
    id: number;
    title: string;
    time: string;
    status: StatusType;
}

interface BottomPanelsProps {
    topAreas: Area[];
    branches: Branch[];
    alerts: Alert[];
}

export function BottomPanels({ topAreas, branches, alerts }: BottomPanelsProps) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
            {/* Top Areas */}
            <motion.div variants={itemVariants}>
                <GlassCard className="h-full">
                    <h2 className="text-lg font-semibold text-white mb-6">Top Consuming Areas</h2>
                    <div className="space-y-5">
                        {topAreas.map((area, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-slate-300 font-medium">{area.name}</span>
                                    <span className="text-white font-semibold">
                                        {area.value} kW{' '}
                                        <span className="text-slate-500 font-normal ml-1">({area.percentage}%)</span>
                                    </span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${area.percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-full rounded-full ${area.color} shadow-[0_0_10px_currentColor] opacity-80`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>

            {/* Branch Overview */}
            <motion.div variants={itemVariants}>
                <GlassCard className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-white">Branch Overview</h2>
                    </div>
                    <div className="space-y-3 flex-1">
                        {branches.map((branch, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">{branch.name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{branch.usage} kW</p>
                                </div>
                                <StatusBadge status={branch.status} label="" className="px-1.5! py-1.5!" />
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-sm text-[#00d4ff] hover:text-blue-400 hover:bg-white/2 rounded-lg transition-colors flex items-center justify-center">
                        View All Branches <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </button>
                </GlassCard>
            </motion.div>

            {/* Recent Alerts */}
            <motion.div variants={itemVariants}>
                <GlassCard className="h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
                        <button className="text-sm text-[#00d4ff] hover:text-blue-400 transition-colors">
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {alerts.map(alert => (
                            <div
                                key={alert.id}
                                className="flex items-start p-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors"
                            >
                                <div className="mt-0.5">
                                    <StatusBadge status={alert.status} label="" className="px-1.5! py-1.5!" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-white">{alert.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                                </div>
                                <button className="text-slate-500 hover:text-white transition-colors">
                                    <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
