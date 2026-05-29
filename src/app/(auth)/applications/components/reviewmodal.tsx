"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Clock3, X, XCircle } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import type { ApplicationItem } from '../page';

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
	const [status, setStatus] = useState<ApplicationDecision['status']>(() => {
		if (!application) {
			return 'approved';
		}

		if (application.status === 'submitted') {
			return 'under_review';
		}

		if (application.status === 'under_review') {
			return 'approved';
		}

		if (application.status === 'active') {
			return 'approved';
		}

		return application.status;
	});
	const [note, setNote] = useState(() => application?.statusReason ?? '');
	const imageDocuments = application?.documents.filter(document => document.mimeType?.startsWith('image/')) ?? [];
	const branches = application?.branches.length
		? application.branches
		: application
			? [{
				name: application.branchName || 'Unassigned branch',
				city: application.branchCity || '',
				province: application.branchProvince || '',
				address: application.branchAddress || '',
				notes: application.branchNotes || '',
			}]
			: [];

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
							<p className="mt-1 break-words">{application.branchName || 'Unassigned branch'} · {application.branchCity || application.branchCode || 'No branch data'}</p>
							<p className="mt-1 break-words">{application.planName} · {application.deviceCount} devices</p>
						</div>

						{imageDocuments.length > 0 && (
							<div className="space-y-3">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Image previews</p>
								<div className="grid gap-4 md:grid-cols-2">
									{imageDocuments.map(document => (
										<div key={document.name} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
											{document.url ? (
												<img src={document.url} alt={document.name} className="h-48 w-full object-cover" />
											) : (
												<div className="flex h-48 items-center justify-center text-sm text-slate-400">No preview available</div>
											)}
											<div className="border-t border-white/10 px-4 py-3 text-sm text-slate-300">{document.name}</div>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="space-y-3">
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Branches</p>
							<div className="grid gap-3 md:grid-cols-2">
								{branches.map(branch => (
									<div key={`${branch.name}-${branch.city}-${branch.address}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
										<p className="font-medium text-white break-words">{branch.name}</p>
										<p className="text-sm text-slate-300 break-words">{branch.address || 'No address provided'}</p>
										<p className="text-sm text-slate-400 break-words">{[branch.city, branch.province].filter(Boolean).join(', ') || 'No city/province provided'}</p>
										{branch.notes ? <p className="text-xs text-slate-400 break-words">{branch.notes}</p> : null}
									</div>
								))}
							</div>
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