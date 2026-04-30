'use client';

import { motion } from 'framer-motion';
import { CheckCircle, RefreshCw, X } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import type { UserManagementItem } from '../../../_actions/users';

interface ReactivateUserModalProps {
  isOpen: boolean;
  user: UserManagementItem | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}

export function ReactivateUserModal({ isOpen, user, isLoading = false, onClose, onConfirm }: ReactivateUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <GlassCard glowColor="cyan" className="w-full max-w-md p-4">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                <RefreshCw className="text-cyan-400" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Reactivate account?</h2>
                <p className="text-sm text-slate-400 mt-1">An account with this email was previously deactivated.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-emerald-400" />
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-3">Reactivating will restore this account and send new login details to the email address above.</p>
          </div>

          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 font-medium transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onConfirm(user.id)}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Reactivating...' : 'Reactivate'}
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>
    </>
  );
}
