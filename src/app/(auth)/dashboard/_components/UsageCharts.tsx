'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/app/components/GlassCard';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ChartData {
    time: string;
    power: number;
    voltage: number;
}

export function UsageCharts({ data }: { data: ChartData[] }) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={itemVariants} className="lg:col-span-2">
            <GlassCard className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-white">Electricity Usage (24h)</h2>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-[#00d4ff] mr-2 shadow-[0_0_8px_rgba(0,212,255,0.6)]"></span> 
                            Power (kW)
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-[#6366f1] mr-2 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span> 
                            Voltage (V)
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-h-75 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                                itemStyle={{ color: '#fff' }}
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
                </div>
            </GlassCard>
        </motion.div>
    );
}
