"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Clock3, X, XCircle } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import type { ApplicationItem, ApplicationStatus } from '../page';

export type ApplicationDecision = {
	status: 'approved' | 'rejected' | 'awaiting_downpayment' | 'under_review';
	note: string;
};

interface ReviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (decision: ApplicationDecision) => void;
	application: ApplicationItem | null;
}

const OUTCOME_OPTIONS: Array<{ value: ApplicationDecision['status']; label: string; description: string; icon: typeof BadgeCheck }> = [
	{ value: 'approved', label: 'Approve', description: 'Mark the application as ready for activation.', icon: BadgeCheck },
	{ value: 'rejected', label: 'Reject', description: 'Close the application with a rejection note.', icon: XCircle },
	{ value: 'awaiting_downpayment', label: 'Awaiting downpayment', description: 'Keep the application open until payment is verified.', icon: AlertTriangle },
	{ value: 'under_review', label: 'Keep in review', description: 'Leave it in the review queue for more checks.', icon: Clock3 },
];

export function ReviewModal({ isOpen, onClose, onSubmit, application }: ReviewModalProps) {
	const [status, setStatus] = useState<ApplicationDecision['status']>('approved');
	const [note, setNote] = useState('');

	useEffect(() => {
		if (!isOpen || !application) {
			return;
		}

		setStatus(application.status === 'submitted' ? 'under_review' : application.status === 'under_review' ? 'approved' : application.status);
		setNote(application.reason ?? '');
	}, [application, isOpen]);

	if (!isOpen || !application) {
		return null;
	}

	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
			<motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<GlassCard glowColor="indigo" className="w-full max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
					<div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Review application</p>
							<h2 className="text-2xl font-bold text-white">{application.fullName}</h2>
						</div>
						<button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-200" aria-label="Close review modal">
							<X size={20} />
						</button>
					</div>

					<div className="overflow-y-auto px-6 py-6 space-y-6">
						<div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
							<p className="text-white font-medium">{application.ticketNumber}</p>
							<p className="mt-1 break-words">{application.email}</p>
							<p className="mt-1 break-words">{application.branch} · {application.city}</p>
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
								placeholder="Add the reason for this decision, payment instructions, or follow-up notes."
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