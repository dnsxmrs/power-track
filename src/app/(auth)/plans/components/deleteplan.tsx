'use client';

import { motion } from 'framer-motion';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  plan?: { id: string; name: string } | null;
  onConfirm: (planId: string) => void;
  isLoading?: boolean;
};

export function DeletePlanModal({ isOpen, onClose, plan, onConfirm, isLoading }: Props) {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <motion.div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Disable Plan</h3>
        <p className="text-sm text-slate-400">Are you sure you want to disable the plan <strong className="text-white">{plan.name}</strong>? This will prevent new subscriptions.</p>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5">Cancel</button>
          <button onClick={() => onConfirm(plan.id)} disabled={isLoading} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400">
            {isLoading ? 'Disabling...' : 'Disable'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
