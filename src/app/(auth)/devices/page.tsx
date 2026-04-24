'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  SearchIcon,
  FilterIcon,
  LightbulbIcon,
  WrenchIcon,
  WindIcon,
  PackageIcon,
  TruckIcon,
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { StatusBadge, StatusType } from '../../components/StatusBadge';

const areas = [
  {
    id: 1,
    name: 'Lighting Systems',
    usage: 2.1,
    status: 'normal' as StatusType,
    devices: 12,
    efficiency: 94,
    icon: LightbulbIcon,
  },
  {
    id: 2,
    name: 'Power Tools',
    usage: 3.8,
    status: 'warning' as StatusType,
    devices: 8,
    efficiency: 78,
    icon: WrenchIcon,
  },
  {
    id: 3,
    name: 'Air Conditioning',
    usage: 4.2,
    status: 'normal' as StatusType,
    devices: 6,
    efficiency: 88,
    icon: WindIcon,
  },
  {
    id: 4,
    name: 'Warehouse Equipment',
    usage: 1.9,
    status: 'normal' as StatusType,
    devices: 15,
    efficiency: 91,
    icon: PackageIcon,
  },
  {
    id: 5,
    name: 'Storage Area',
    usage: 1.5,
    status: 'normal' as StatusType,
    devices: 10,
    efficiency: 96,
    icon: PackageIcon,
  },
  {
    id: 6,
    name: 'Loading Area',
    usage: 0.9,
    status: 'normal' as StatusType,
    devices: 5,
    efficiency: 97,
    icon: TruckIcon,
  },
];

export default function DevicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [warningOnly, setWarningOnly] = useState(false);

  const filteredAreas = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return areas.filter(area => {
      const matchesSearch =
        normalizedQuery.length === 0 || area.name.toLowerCase().includes(normalizedQuery);
      const matchesStatus = !warningOnly || area.status === 'warning';
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, warningOnly]);

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
      className="max-w-7xl mx-auto space-y-6 pb-8 p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Device & Area Monitoring</h1>
          <p className="text-slate-400 mt-1">Real-time tracking of specific zones and equipment.</p>
        </div>

        <div className="flex space-x-3 items-center min-w-0">
          <div className="relative min-w-0 group">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 transition-transform duration-200 ease-out group-focus-within:-translate-x-1 z-0 pointer-events-none" />
            <label htmlFor="search-areas" className="sr-only">
              Search areas
            </label>
            <input
              id="search-areas"
              aria-label="Search areas"
              type="text"
              placeholder="Search areas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="glass-input glass-input--plain !pl-16 pr-3 py-2 text-sm w-full max-w-xs md:!pl-16 md:max-w-none md:w-64 relative z-10"
            />
          </div>
          <button
            onClick={() => setWarningOnly(prev => !prev)}
            className={`glass-panel !p-2 !rounded-xl transition-colors flex items-center justify-center ${
              warningOnly
                ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
            }`}
            aria-pressed={warningOnly}
            title={warningOnly ? 'Showing warning areas only' : 'Show warning areas only'}
          >
            <FilterIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAreas.map((area, idx) => {
          const Icon = area.icon;
          return (
            <motion.div key={area.id} variants={itemVariants}>
              <GlassCard className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/[0.05] rounded-xl border border-white/[0.1]">
                    <Icon className="w-6 h-6 text-slate-300" />
                  </div>
                  <StatusBadge status={area.status} label="" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-4">{area.name}</h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Power Usage</span>
                    <span className="text-sm font-semibold text-white">{area.usage} kW</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Devices</span>
                    <span className="text-sm font-semibold text-white">{area.devices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Efficiency</span>
                    <span className="text-sm font-semibold text-emerald-400">{area.efficiency}%</span>
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
