'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Clock3, X, XCircle } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import type { SubscriptionItem, SubscriptionStatus } from '../page';

export type SubscriptionDecision = {
	status: 'active' | 'under_review' | 'suspended' | 'cancelled';
	note: string;
};

interface ReviewSubscriptionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (decision: SubscriptionDecision) => void;
	subscription: SubscriptionItem | null;
}

const OUTCOME_OPTIONS: Array<{ value: SubscriptionDecision['status']; label: string; description: string; icon: typeof BadgeCheck }> = [
	{ value: 'active', label: 'Keep active', description: 'Confirm the subscription remains active and in good standing.', icon: BadgeCheck },
	{ value: 'under_review', label: 'Keep under review', description: 'Leave the subscription in a review state for follow-up.', icon: Clock3 },
	{ value: 'suspended', label: 'Suspend', description: 'Temporarily pause the subscription until issues are resolved.', icon: AlertTriangle },
	{ value: 'cancelled', label: 'Cancel', description: 'Terminate the subscription and stop future billing.', icon: XCircle },
];

export function ReviewModal({ isOpen, onClose, onSubmit, subscription }: ReviewSubscriptionModalProps) {
	const [status, setStatus] = useState<SubscriptionDecision['status']>('active');
	const [note, setNote] = useState('');

	useEffect(() => {
		if (!isOpen || !subscription) {
			return;
		}

		setStatus(subscription.status);
		setNote(subscription.reviewNote ?? '');
	}, [isOpen, subscription]);

	if (!isOpen || !subscription) {
		return null;
	}

	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
			<motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<GlassCard glowColor="indigo" className="w-full max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
					<div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Review subscription</p>
							<h2 className="text-2xl font-bold text-white">{subscription.userName}</h2>
						</div>
						<button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-200" aria-label="Close review modal">
							<X size={20} />
						</button>
					</div>

					<div className="overflow-y-auto px-6 py-6 space-y-6">
						<div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
							<p className="text-white font-medium">{subscription.planName}</p>
							<p className="mt-1 break-words">{subscription.userEmail}</p>
							<p className="mt-1 break-words">{subscription.sourceApplication ? `Source application ${subscription.sourceApplication.ticketNumber}` : 'No source application linked'}</p>
							<p className="mt-1 break-words">Next due {subscription.nextDueDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(subscription.nextDueDate)) : 'not scheduled'}</p>
						</div>

						<div className="space-y-3">
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Decision</p>
							<div className="grid gap-3 sm:grid-cols-2">
								{OUTCOME_OPTIONS.map(option => {
									const Icon = option.icon;
									const active = status === option.value;

									return (
										<button
											key={option.value}
											type="button"
											onClick={() => setStatus(option.value)}
											className={`rounded-2xl border p-4 text-left transition ${active ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
										>
											<div className="flex items-center gap-3">
												<div className={`rounded-xl p-2 ${active ? 'bg-cyan-500/15 text-cyan-200' : 'bg-white/5 text-slate-300'}`}>
													<Icon size={16} />
												</div>
												<div>
													<p className="font-semibold text-white">{option.label}</p>
													<p className="text-sm text-slate-400 break-words">{option.description}</p>
												</div>
											</div>
										</button>
									);
								})}
							</div>
						</div>

						<div className="space-y-3">
							<label className="block text-sm font-medium text-slate-300">Review note</label>
							<textarea
								value={note}
								onChange={event => setNote(event.target.value)}
								rows={5}
								placeholder="Add any review notes, billing instructions, or follow-up details."
								className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8"
							/>
						</div>

						<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
							<button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">
								Cancel
							</button>
							<button
								type="button"
								onClick={() => onSubmit({ status, note })}
								className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/15"
							>
								Continue to confirmation
							</button>
						</div>
					</div>
				</GlassCard>
			</motion.div>
		</>
	);
}