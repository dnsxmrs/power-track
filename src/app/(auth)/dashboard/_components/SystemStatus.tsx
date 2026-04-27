'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/app/components/GlassCard';
import { CheckCircle2Icon, ActivityIcon, ServerIcon, ClockIcon } from 'lucide-react';

export function SystemStatus() {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={itemVariants}>
            <GlassCard className="h-full">
                <h2 className="text-lg font-semibold text-white mb-6">System Status</h2>

                <div className="flex items-center justify-center py-6 mb-6 border-b border-white/8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full"></div>
                        <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                            <div className="text-center">
                                <CheckCircle2Icon className="w-10 h-10 text-emerald-400 mx-auto mb-1" />
                                <span className="text-emerald-400 font-semibold text-sm">Normal</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm flex items-center">
                            <ActivityIcon className="w-4 h-4 mr-2" /> Uptime
                        </span>
                        <span className="text-white font-medium">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm flex items-center">
                            <ServerIcon className="w-4 h-4 mr-2" /> Connected Devices
                        </span>
                        <span className="text-white font-medium">24 / 26</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm flex items-center">
                            <ClockIcon className="w-4 h-4 mr-2" /> Last Sync
                        </span>
                        <span className="text-white font-medium">Just now</span>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
