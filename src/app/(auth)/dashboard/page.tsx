'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ZapIcon,
    ActivityIcon,
    GaugeIcon,
    WalletIcon,
    TrendingUpIcon,
    BellIcon,
    CheckCircle2Icon,
    ClockIcon,
    ServerIcon,
    HeartPulseIcon,
    SparklesIcon,
    AlertTriangleIcon,
    ThermometerIcon,
    LightbulbIcon,
    TargetIcon,
    WindIcon,
    WrenchIcon,
    ArrowRightIcon,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { MetricCard } from '../../components/MetricCard';
import { GlassCard } from '../../components/GlassCard';
import { StatusBadge, StatusType } from '../../components/StatusBadge';
import { Skeleton } from '../../components/Skeleton';

const chartData = [
    {
        time: '12 AM',
        power: 4.2,
        voltage: 220,
    },
    {
        time: '3 AM',
        power: 3.8,
        voltage: 221,
    },
    {
        time: '6 AM',
        power: 5.5,
        voltage: 222,
    },
    {
        time: '9 AM',
        power: 14.2,
        voltage: 218,
    },
    {
        time: '12 PM',
        power: 18.4,
        voltage: 215,
    },
    {
        time: '3 PM',
        power: 16.8,
        voltage: 217,
    },
    {
        time: '6 PM',
        power: 12.5,
        voltage: 220,
    },
    {
        time: '9 PM',
        power: 8.4,
        voltage: 222,
    },
    {
        time: '11 PM',
        power: 5.1,
        voltage: 221,
    },
];

const topAreas = [
    {
        name: 'Air Conditioning',
        value: 4.2,
        percentage: 32,
        color: 'bg-cyan-500',
    },
    {
        name: 'Power Tools Section',
        value: 3.8,
        percentage: 29,
        color: 'bg-indigo-500',
    },
    {
        name: 'Warehouse Lighting',
        value: 2.1,
        percentage: 16,
        color: 'bg-emerald-500',
    },
    {
        name: 'Office Area',
        value: 1.5,
        percentage: 12,
        color: 'bg-amber-500',
    },
    {
        name: 'Display Area',
        value: 1.2,
        percentage: 9,
        color: 'bg-purple-500',
    },
];

const recentAlerts = [
    {
        id: 1,
        title: 'Power spike in Warehouse B',
        time: '5 min ago',
        status: 'critical' as StatusType,
    },
    {
        id: 2,
        title: 'AC Unit 3 above threshold',
        time: '23 min ago',
        status: 'warning' as StatusType,
    },
    {
        id: 3,
        title: 'Monthly target 80% reached',
        time: '1 hr ago',
        status: 'warning' as StatusType,
    },
    {
        id: 4,
        title: 'Voltage fluctuation detected',
        time: '2 hrs ago',
        status: 'normal' as StatusType,
    },
];

const insightsData = [
    {
        icon: LightbulbIcon,
        color: 'amber',
        text: 'Lighting Area is consuming 23% more power than usual today. This may indicate lights left on in unused sections.',
        time: 'Detected 15 min ago',
    },
    {
        icon: AlertTriangleIcon,
        color: 'red',
        text: 'Possible overload risk detected in Warehouse Tools section. Current draw is approaching 90% of rated capacity.',
        time: 'Detected 8 min ago',
    },
    {
        icon: TrendingUpIcon,
        color: 'amber',
        text: 'Branch 2 (Cebu) may exceed its normal weekly consumption by 12% if current usage continues.',
        time: 'Projected today',
    },
    {
        icon: ThermometerIcon,
        color: 'blue',
        text: 'AC Unit 3 efficiency has dropped 15% over the past week. Maintenance may be needed.',
        time: 'Trend detected',
    },
];

const recommendationsData = [
    {
        icon: LightbulbIcon,
        title: 'Check idle lighting after store hours',
        desc: 'Automated sensors detected lights active in Display Area at 10:30 PM last night. Estimated savings: ₱1,200/month',
        action: 'Set Schedule',
    },
    {
        icon: WindIcon,
        title: 'Reduce AC runtime during non-peak hours',
        desc: 'AC units are running at full capacity during low-traffic periods (6-8 AM). Off-peak scheduling could save 15%.',
        action: 'Optimize',
    },
    {
        icon: WrenchIcon,
        title: 'Inspect high-consumption equipment',
        desc: 'Power Tools section shows 40% higher draw than baseline. Equipment may need maintenance or replacement.',
        action: 'View Report',
    },
];

const branchOverviewData = [
    {
        name: 'Main Store - Manila',
        usage: 12.8,
        status: 'normal' as StatusType,
    },
    {
        name: 'Warehouse Hub - QC',
        usage: 18.4,
        status: 'warning' as StatusType,
    },
    {
        name: 'Branch 2 - Cebu',
        usage: 8.2,
        status: 'normal' as StatusType,
    },
    {
        name: 'Branch 3 - Davao',
        usage: 6.5,
        status: 'normal' as StatusType,
    },
];

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(t);
    }, []);

    const containerVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Power Health Score"
                        value="87"
                        unit="/100"
                        icon={HeartPulseIcon}
                        trend="up"
                        trendValue="3.2%"
                        status="normal"
                        className="h-full border-[#00d4ff]/30 shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Voltage"
                        value="223.5"
                        unit="V"
                        icon={ZapIcon}
                        trend="up"
                        trendValue="0.3%"
                        status="normal"
                        className="h-full"
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Current"
                        value="45.2"
                        unit="A"
                        icon={ActivityIcon}
                        trend="up"
                        trendValue="2.1%"
                        status="normal"
                        className="h-full"
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Power Consumption"
                        value="12.8"
                        unit="kW"
                        icon={GaugeIcon}
                        trend="down"
                        trendValue="5.4%"
                        status="normal"
                        className="h-full"
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Est. Monthly Bill"
                        value="₱48,250"
                        icon={WalletIcon}
                        trend="down"
                        trendValue="8.2%"
                        status="normal"
                        className="h-full"
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Peak Usage Today"
                        value="18.4"
                        unit="kW"
                        icon={TrendingUpIcon}
                        trend="up"
                        trendValue="12.4%"
                        status="warning"
                        glowColor="amber"
                        className="h-full"
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Active Alerts"
                        value="3"
                        icon={BellIcon}
                        trend="up"
                        trendValue="1"
                        status="warning"
                        className="h-full"
                    />
                </motion.div>
            </div>

            {/* Middle Section: Chart & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <GlassCard className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-white">Electricity Usage (24h)</h2>
                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-[#00d4ff] mr-2 shadow-[0_0_8px_rgba(0,212,255,0.6)]"></span> Power
                                    (kW)
                                </div>
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-[#6366f1] mr-2 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span> Voltage
                                    (V)
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-75 w-full">
                            {isLoading ? (
                                <div className="p-4 h-full">
                                    <Skeleton className="min-h-75 w-full" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="rgba(255,255,255,0.05)"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="time"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        <YAxis
                                            yAxisId="left"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={[200, 240]}
                                        />

                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                borderColor: 'rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                backdropFilter: 'blur(10px)',
                                            }}
                                            itemStyle={{
                                                color: '#fff',
                                            }}
                                        />

                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="power"
                                            stroke="#00d4ff"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorPower)"
                                        />

                                        <Area
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="voltage"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorVoltage)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

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
            </div>

            {/* Smart Insights Panel */}
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
                        {insightsData.map((insight, idx) => {
                            const Icon = insight.icon;
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

            {/* Recommendations Panel */}
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
                        {recommendationsData.map((rec, idx) => {
                            const Icon = rec.icon;
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

            {/* Bottom Section: 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
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
                                            initial={{
                                                width: 0,
                                            }}
                                            animate={{
                                                width: `${area.percentage}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.5,
                                            }}
                                            className={`h-full rounded-full ${area.color} shadow-[0_0_10px_currentColor] opacity-80`}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-white">Branch Overview</h2>
                        </div>
                        <div className="space-y-3 flex-1">
                            {branchOverviewData.map((branch, idx) => (
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

                <motion.div variants={itemVariants}>
                    <GlassCard className="h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
                            <button className="text-sm text-[#00d4ff] hover:text-blue-400 transition-colors">
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentAlerts.map(alert => (
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
        </motion.div>
    );
}
