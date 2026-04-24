'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, DownloadIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { GlassCard } from '../../components/GlassCard';

const monthlyData = [
  { day: '1', usage: 120 },
  { day: '5', usage: 132 },
  { day: '10', usage: 145 },
  { day: '15', usage: 110 },
  { day: '20', usage: 155 },
  { day: '25', usage: 140 },
  { day: '30', usage: 125 },
];

const weeklyData = [
  { day: 'W1', usage: 770 },
  { day: 'W2', usage: 810 },
  { day: 'W3', usage: 745 },
  { day: 'W4', usage: 820 },
];

const dailyData = [
  { day: 'Mon', usage: 104 },
  { day: 'Tue', usage: 116 },
  { day: 'Wed', usage: 121 },
  { day: 'Thu', usage: 98 },
  { day: 'Fri', usage: 132 },
  { day: 'Sat', usage: 92 },
  { day: 'Sun', usage: 88 },
];

const areaData = [
  { name: 'Air Con', value: 420 },
  { name: 'Power Tools', value: 380 },
  { name: 'Lighting', value: 210 },
  { name: 'Office', value: 150 },
  { name: 'Display', value: 120 },
];

export default function ReportsPage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const usageData = useMemo(() => {
    if (view === 'daily') return dailyData;
    if (view === 'weekly') return weeklyData;
    return monthlyData;
  }, [view]);

  const periodLabel =
    view === 'daily' ? 'Last 7 Days' : view === 'weekly' ? 'Last 4 Weeks' : 'Oct 1 - Oct 31, 2023';

  const totalUsage = useMemo(
    () => usageData.reduce((sum, d) => sum + d.usage, 0),
    [usageData],
  );

  const avgUsage = useMemo(() => (totalUsage / usageData.length).toFixed(1), [totalUsage, usageData]);

  const colors = ['#00d4ff', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 pb-8 p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-400 mt-1">Detailed analysis of your energy consumption patterns.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] rounded-lg border border-[#00d4ff]/20 transition-colors">
          <DownloadIcon className="w-4 h-4" />
          Export
        </button>
      </div>

      <motion.div variants={itemVariants} className="flex gap-2">
        {(['daily', 'weekly', 'monthly'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              view === v
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {v}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Energy Usage ({periodLabel})</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#00d4ff"
                  fillOpacity={1}
                  fill="url(#colorUsage)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <GlassCard>
            <p className="text-sm text-slate-400 mb-2">Total Usage</p>
            <p className="text-3xl font-bold text-white">{totalUsage} kWh</p>
            <p className="text-xs text-slate-500 mt-2">For {periodLabel}</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard>
            <p className="text-sm text-slate-400 mb-2">Average Daily</p>
            <p className="text-3xl font-bold text-[#00d4ff]">{avgUsage} kWh</p>
            <p className="text-xs text-slate-500 mt-2">Per {view.slice(0, -2)}</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard>
            <p className="text-sm text-slate-400 mb-2">Estimated Cost</p>
            <p className="text-3xl font-bold text-emerald-400">₱{(totalUsage * 0.15).toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2">At ₱0.15/kWh</p>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Consumption by Area</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {areaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
