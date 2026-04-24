'use client';

import { motion } from 'framer-motion';
import {
  MapPinIcon,
  BuildingIcon,
  ActivityIcon,
  WalletIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { StatusBadge, StatusType } from '../../components/StatusBadge';

const branches = [
  {
    id: 1,
    name: 'Main Store - Manila',
    usage: 12.8,
    status: 'normal' as StatusType,
    cost: '₱48,250',
    devices: 24,
    trend: '+2.1%',
  },
  {
    id: 2,
    name: 'Warehouse Hub - QC',
    usage: 18.4,
    status: 'warning' as StatusType,
    cost: '₱62,100',
    devices: 38,
    trend: '+8.4%',
  },
  {
    id: 3,
    name: 'Branch 2 - Cebu',
    usage: 8.2,
    status: 'normal' as StatusType,
    cost: '₱31,400',
    devices: 16,
    trend: '-1.2%',
  },
  {
    id: 4,
    name: 'Branch 3 - Davao',
    usage: 6.5,
    status: 'normal' as StatusType,
    cost: '₱24,800',
    devices: 12,
    trend: '-4.5%',
  },
];

export default function BranchesPage() {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Multi-Branch Overview</h1>
          <p className="text-slate-400 mt-1">Compare performance across all locations.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-5!">
          <div className="flex items-center space-x-3 mb-2">
            <BuildingIcon className="w-5 h-5 text-[#00d4ff]" />
            <p className="text-sm text-slate-400">Total Branches</p>
          </div>
          <p className="text-2xl font-bold text-white">4</p>
        </GlassCard>
        <GlassCard className="p-5!">
          <div className="flex items-center space-x-3 mb-2">
            <ActivityIcon className="w-5 h-5 text-indigo-400" />
            <p className="text-sm text-slate-400">Total Usage</p>
          </div>
          <p className="text-2xl font-bold text-white">45.9 kW</p>
        </GlassCard>
        <GlassCard className="p-5!">
          <div className="flex items-center space-x-3 mb-2">
            <WalletIcon className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-slate-400">Total Cost</p>
          </div>
          <p className="text-2xl font-bold text-white">₱166,550</p>
        </GlassCard>
        <GlassCard className="p-5!">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangleIcon className="w-5 h-5 text-amber-400" />
            <p className="text-sm text-slate-400">Warnings</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">1</p>
        </GlassCard>
      </div>

      <div className="space-y-4">
        {branches.map((branch, idx) => (
          <motion.div key={branch.id} variants={itemVariants}>
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <MapPinIcon className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{branch.name}</h3>
                      <StatusBadge status={branch.status} label="" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Usage</p>
                        <p className="text-white font-semibold">{branch.usage} kW</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Devices</p>
                        <p className="text-white font-semibold">{branch.devices}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Trend</p>
                        <p className={`font-semibold ${branch.trend.startsWith('+') ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {branch.trend}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm mb-1">Monthly Cost</p>
                  <p className="text-2xl font-bold text-white">{branch.cost}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
