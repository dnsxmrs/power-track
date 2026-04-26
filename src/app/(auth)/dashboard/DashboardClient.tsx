'use client';

import { motion } from 'framer-motion';
import { ClockIcon } from 'lucide-react';
import { MetricGrid } from './_components/MetricGrid';
import { UsageCharts } from './_components/UsageCharts';
import { SystemStatus } from './_components/SystemStatus';
import { SmartInsights } from './_components/SmartInsights';
import { Recommendations } from './_components/Recommendations';
import { BottomPanels } from './_components/BottomPanels';

interface DashboardClientProps {
    data: any; // Ideally typed properly
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

            {/* Middle Section: Chart & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <UsageCharts data={data.chartData} />
                <SystemStatus />
            </div>

            {/* Smart Insights Panel */}
            <SmartInsights data={data.insightsData} />

            {/* Recommendations Panel */}
            <Recommendations data={data.recommendationsData} />

            {/* Bottom Section: 3 Columns */}
            <BottomPanels 
                topAreas={data.topAreas} 
                branches={data.branchOverviewData} 
                alerts={data.recentAlerts} 
            />
        </motion.div>
    );
}
