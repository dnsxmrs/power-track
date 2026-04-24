'use client';

import { motion } from 'framer-motion';
import { SlidersIcon, BellIcon, UserIcon, SaveIcon } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export default function SettingsPage() {
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
      className="max-w-4xl mx-auto space-y-6 pb-12 p-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-1">Manage system preferences and alert thresholds.</p>
      </div>

      <motion.div variants={itemVariants}>
        <GlassCard>
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/[0.08]">
            <SlidersIcon className="w-5 h-5 text-[#00d4ff]" />
            <h2 className="text-lg font-semibold text-white">Alert Thresholds</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Voltage Minimum (V)
                </label>
                <input
                  type="number"
                  defaultValue={210}
                  className="glass-input w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Voltage Maximum (V)
                </label>
                <input
                  type="number"
                  defaultValue={240}
                  className="glass-input w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Global Power Warning Threshold (kW)
              </label>
              <input
                type="number"
                defaultValue={40}
                className="glass-input w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2 text-white"
              />
              <p className="text-xs text-slate-500 mt-2">
                Alerts will trigger when total consumption exceeds this value.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard>
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/[0.08]">
            <BellIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                label: 'Critical Alerts (Overload, Outage)',
                desc: 'Immediate notification for severe issues',
                email: true,
                sms: true,
              },
              {
                label: 'Warning Alerts (Thresholds reached)',
                desc: 'Notifies when approaching limits',
                email: true,
                sms: false,
              },
              {
                label: 'Weekly Reports',
                desc: 'Summary of energy consumption',
                email: true,
                sms: false,
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start justify-between py-4 border-b border-white/[0.05] last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </div>
                <div className="flex gap-3 ml-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={item.email}
                      className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.05] text-[#00d4ff]"
                    />
                    <span className="text-xs text-slate-400">Email</span>
                  </label>
                  {item.sms && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.sms}
                        className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.05] text-[#00d4ff]"
                      />
                      <span className="text-xs text-slate-400">SMS</span>
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard>
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/[0.08]">
            <UserIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Account Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Admin User"
                className="glass-input w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                defaultValue="admin@company.com"
                className="glass-input w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-3">
        <button className="flex items-center gap-2 px-6 py-2 bg-[#00d4ff] hover:bg-[#00b8e6] text-white font-medium rounded-lg transition-colors">
          <SaveIcon className="w-4 h-4" />
          Save Changes
        </button>
        <button className="px-6 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-medium rounded-lg border border-white/[0.1] transition-colors">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}
