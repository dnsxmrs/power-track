'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  ZapIcon,
  ThermometerIcon,
  WalletIcon,
  ClockIcon,
  CheckCircleIcon,
  SearchIcon,
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { StatusBadge, StatusType } from '../../components/StatusBadge';

const alertsData = [
  {
    id: 1,
    type: 'critical' as StatusType,
    title: 'Power overload risk in Warehouse B',
    description: 'Current draw exceeds 90% capacity. Reduce load immediately to prevent breaker trip.',
    suggestedAction: 'Disconnect non-essential equipment (Forklift chargers, secondary lighting).',
    time: '5 min ago',
    location: 'Warehouse B - Main Panel',
    icon: ZapIcon,
  },
  {
    id: 2,
    type: 'critical' as StatusType,
    title: 'Voltage surge detected',
    description: 'Voltage spike of 245V detected on Main Line 2. Risk of equipment damage.',
    suggestedAction: 'Check main breaker and surge protectors. Contact utility provider if persistent.',
    time: '18 min ago',
    location: 'Main Line 2',
    icon: AlertTriangleIcon,
  },
  {
    id: 3,
    type: 'warning' as StatusType,
    title: 'AC Unit 3 overconsumption',
    description: 'Running 40% above normal baseline for current temperature conditions.',
    suggestedAction: 'Schedule maintenance. Check filters and compressor efficiency.',
    time: '23 min ago',
    location: 'Office Area - Zone A',
    icon: ThermometerIcon,
  },
  {
    id: 4,
    type: 'warning' as StatusType,
    title: 'Monthly budget threshold reached',
    description: '₱48,250 of ₱55,000 budget used with 8 days remaining in billing cycle.',
    suggestedAction: 'Review usage patterns and implement energy-saving protocols.',
    time: '1 hr ago',
    location: 'System Wide',
    icon: WalletIcon,
  },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const criticalCount = alertsData.filter(alert => alert.type === 'critical').length;
  const warningCount = alertsData.filter(alert => alert.type === 'warning').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Alerts & Notifications</h1>
          <p className="text-slate-400 mt-1">View all system alerts and notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <GlassCard className="!p-4">
          <p className="text-sm text-slate-400 mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
        </GlassCard>
        <GlassCard className="!p-4">
          <p className="text-sm text-slate-400 mb-1">Warnings</p>
          <p className="text-2xl font-bold text-amber-400">{warningCount}</p>
        </GlassCard>
        <GlassCard className="!p-4">
          <p className="text-sm text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-[#00d4ff]">{alertsData.length}</p>
        </GlassCard>
      </div>

      <motion.div variants={itemVariants} className="relative">
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-0 pointer-events-none" />
        <input
          type="text"
          placeholder="Search alerts..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="glass-input glass-input--plain !pl-12 w-full"
        />
      </motion.div>

      <div className="space-y-4">
        {alertsData.map(alert => {
          const Icon = alert.icon;
          return (
            <motion.div key={alert.id} variants={itemVariants}>
              <GlassCard className="!p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-white/[0.05] rounded-lg border border-white/[0.1] mt-1">
                      <Icon className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        <StatusBadge status={alert.type} label="" />
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{alert.description}</p>
                      <p className="text-xs text-slate-500 mb-2">
                        <span className="font-medium">Suggested Action:</span> {alert.suggestedAction}
                      </p>
                      <p className="text-xs text-slate-600">
                        {alert.location} • {alert.time}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
