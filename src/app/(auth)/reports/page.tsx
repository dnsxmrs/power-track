'use client';

import { useMemo, useState, useEffect } from 'react';
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
  const [reports, setReports] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/reports');
        if (!mounted) return;
        const json = await res.json();
        setReports(json);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch reports', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const usageData = useMemo(() => {
    if (!reports) return monthlyData;
    // use dailyTrends for admin-focused multi-series chart
    const raw = reports.dailyTrends || [];
    const mapped = raw.map((r: any) => ({
      day: r.date.slice(5),
      applications: r.applicationsCreated,
      subscriptions: r.subscriptionsCreated,
      payments: r.paymentsVerified,
      newClients: r.newClients,
    }));
    return mapped.length ? mapped : monthlyData.map((m) => ({ day: m.day, applications: 0, subscriptions: 0, payments: 0, newClients: 0 }));
  }, [reports]);

  const periodLabel = 'Last 30 days';

  const totalApplications = useMemo(() => usageData.reduce((s: number, d: any) => s + (d.applications || 0), 0), [usageData]);
  const totalSubscriptions = useMemo(() => usageData.reduce((s: number, d: any) => s + (d.subscriptions || 0), 0), [usageData]);
  const totalPayments = useMemo(() => usageData.reduce((s: number, d: any) => s + (d.payments || 0), 0), [usageData]);
  const totalNewClients = useMemo(() => usageData.reduce((s: number, d: any) => s + (d.newClients || 0), 0), [usageData]);

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
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-400 mr-2">Export:</div>
          <a href="/api/reports/export?type=trends&format=csv" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-[#0b1220] hover:bg-[#09101a] text-[#00d4ff] rounded-lg border border-[#00d4ff]/10 transition-colors">
            <DownloadIcon className="w-4 h-4" /> CSV
          </a>
          <a href="/api/reports/export?type=trends&format=html" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/6 text-white rounded-lg border border-white/6 transition-colors">
            HTML
          </a>
          <a href="/api/reports/export?type=trends&format=pdf" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-[#10b981] hover:bg-[#0ea56e] text-white rounded-lg border border-[#0ea56e]/20 transition-colors">
            PDF
          </a>
        </div>
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
          <h2 className="text-lg font-semibold text-white mb-6">Admin Trends ({periodLabel})</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
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
                <Area type="monotone" dataKey="applications" stroke="#00d4ff" fillOpacity={0.12} fill="#00d4ff"/>
                <Area type="monotone" dataKey="subscriptions" stroke="#6366f1" fillOpacity={0.12} fill="#6366f1"/>
                <Area type="monotone" dataKey="payments" stroke="#10b981" fillOpacity={0.12} fill="#10b981"/>
                <Area type="monotone" dataKey="newClients" stroke="#f59e0b" fillOpacity={0.12} fill="#f59e0b"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
            <GlassCard>
              <p className="text-sm text-slate-400 mb-2">Applications (30d)</p>
              <p className="text-3xl font-bold text-white">{totalApplications}</p>
              <p className="text-xs text-slate-500 mt-2">Submitted applications</p>
            </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
            <GlassCard>
              <p className="text-sm text-slate-400 mb-2">Subscriptions (30d)</p>
              <p className="text-3xl font-bold text-[#00d4ff]">{totalSubscriptions}</p>
              <p className="text-xs text-slate-500 mt-2">New subscriptions started</p>
            </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
            <GlassCard>
              <p className="text-sm text-slate-400 mb-2">Payments Verified (30d)</p>
              <p className="text-3xl font-bold text-emerald-400">{totalPayments}</p>
              <p className="text-xs text-slate-500 mt-2">Verified payment submissions</p>
            </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <motion.div variants={itemVariants}>
          <GlassCard>
            <p className="text-sm text-slate-400 mb-2">Active subscriptions</p>
            <p className="text-3xl font-bold text-white">{reports ? reports.activeSubscriptions : '—'}</p>
            <p className="text-xs text-slate-500 mt-2">Total active clients</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard>
            <p className="text-sm text-slate-400 mb-2">Pending payments</p>
            <p className="text-3xl font-bold text-[#f59e0b]">{reports ? reports.pendingPayments : '—'}</p>
            <p className="text-xs text-slate-500 mt-2">Awaiting verification</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard>
            <p className="text-sm text-slate-400 mb-2">Revenue (this month)</p>
            <p className="text-3xl font-bold text-emerald-400">₱{reports ? reports.verifiedPaymentsThisMonth : '—'}</p>
            <p className="text-xs text-slate-500 mt-2">Verified payments</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Removed detailed consumption-by-area visualization to keep Reports focused on admin KPIs and DB-driven metrics. */}
    </motion.div>
  );
}
