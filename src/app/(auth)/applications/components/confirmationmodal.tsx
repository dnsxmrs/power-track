"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Clock3, X } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import type { ApplicationItem } from '../page';
import type { ApplicationDecision } from './reviewmodal';

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void> | void;
	application: ApplicationItem | null;
	decision: ApplicationDecision | null;
	isSubmitting?: boolean;
}

const OUTCOME_META: Record<ApplicationDecision['status'], { label: string; icon: typeof BadgeCheck; className: string }> = {
	approved: {
		label: 'Approve application',
		icon: BadgeCheck,
		className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
	},
	rejected: {
		label: 'Reject application',
		icon: X,
		className: 'bg-red-500/10 text-red-300 border-red-500/20',
	},
	awaiting_downpayment: {
		label: 'Mark awaiting downpayment',
		icon: AlertTriangle,
		className: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
	},
	under_review: {
		label: 'Keep under review',
		icon: Clock3,
		className: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
	},
} as const;

export function ConfirmationModal({ isOpen, onClose, onConfirm, application, decision, isSubmitting = false }: ConfirmationModalProps) {
	if (!isOpen || !application || !decision) {
		return null;
	}

	const meta = OUTCOME_META[decision.status];
	const Icon = meta.icon;

	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
			<motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<GlassCard glowColor="emerald" className="w-full max-w-xl p-0 overflow-hidden">
					<div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Confirm action</p>
							<h2 className="text-2xl font-bold text-white">{meta.label}</h2>
						</div>
						<button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-200" aria-label="Close confirmation modal">
							<X size={20} />
						</button>
					</div>

					<div className="space-y-5 px-6 py-6">
						<div className={`rounded-2xl border p-4 ${meta.className}`}>
							<div className="flex items-center gap-3">
								<div className="rounded-xl bg-white/5 p-2">
									<Icon size={16} />
								</div>
								<div>
									<p className="font-semibold text-white">{application.fullName}</p>
									<p className="text-sm opacity-90 break-words">{application.ticketNumber}</p>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
							<p className="break-words">{decision.note.trim() || 'No note was added.'}</p>
						</div>

						<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
							<button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">
								Cancel
							</button>
							<button
								type="button"
								onClick={onConfirm}
								disabled={isSubmitting}
								className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isSubmitting ? 'Applying...' : 'Confirm review'}
							</button>
						</div>
					</div>
				</GlassCard>
			</motion.div>
		</>
	);
}