'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheckIcon, CalendarIcon, Clock3Icon, FileTextIcon, MailIcon, PhoneIcon, SparklesIcon, X, XCircleIcon } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import type { PaymentItem, PaymentStatus } from '../page';

interface ViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	payment: PaymentItem | null;
}

const STATUS_META: Record<PaymentStatus, { label: string; className: string; icon: typeof BadgeCheckIcon }> = {
	pending_verification: { label: 'Pending verification', className: 'bg-sky-500/10 text-sky-300 border-sky-500/20', icon: FileTextIcon },
	verified: { label: 'Verified', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: BadgeCheckIcon },
	rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-300 border-red-500/20', icon: XCircleIcon },
};

function formatDateLabel(dateString: string): string {
	return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
}

export function ViewModal({ isOpen, onClose, payment }: ViewModalProps) {
	if (!isOpen || !payment) {
		return null;
	}

	const status = STATUS_META[payment.status];
	const StatusIcon = status.icon;

	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
			<motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<GlassCard glowColor="cyan" className="w-full max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
					<div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Payment details</p>
							<h2 className="text-2xl font-bold text-white">{payment.referenceNumber}</h2>
						</div>
						<button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-200" aria-label="Close view modal">
							<X size={20} />
						</button>
					</div>

					<div className="overflow-y-auto px-6 py-6 space-y-6">
						<div className="flex flex-wrap items-center gap-2">
							<span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
								<StatusIcon size={14} />
								{status.label}
							</span>
							<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{payment.billingMonth}</span>
							<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">PHP {payment.amount.toLocaleString()}</span>
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">User</p>
								<p className="mt-2 text-sm text-white break-words">{payment.user?.name ?? 'Unknown user'}</p>
								<p className="text-xs text-slate-400 break-words">{payment.user?.email ?? 'No email'}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Subscription</p>
								<p className="mt-2 text-sm text-white break-words">{payment.subscription?.planName ?? 'No linked subscription'}</p>
								<p className="text-xs text-slate-400 break-words">{payment.subscription?.status ?? 'Not linked'}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reviewed</p>
								<p className="mt-2 text-sm text-white break-words">{payment.reviewedByName ?? 'Pending review'}</p>
								<p className="text-xs text-slate-400">{payment.reviewedAt ? formatDateLabel(payment.reviewedAt) : 'Not yet reviewed'}</p>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<GlassCard glowColor="cyan" className="p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact</p>
								<div className="mt-3 space-y-2 text-sm text-slate-300">
									<p className="flex items-start gap-2 break-words"><MailIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{payment.user?.email ?? 'No email'}</p>
									<p className="flex items-start gap-2 break-words"><PhoneIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{payment.user?.phoneNumber ?? 'No phone number'}</p>
								</div>
							</GlassCard>

							<GlassCard glowColor="indigo" className="p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Linked records</p>
								<div className="mt-3 space-y-2 text-sm text-slate-300">
									<p className="flex items-start gap-2 break-words"><CalendarIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{formatDateLabel(payment.submittedAt)}</p>
									<p className="flex items-start gap-2 break-words"><SparklesIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{payment.application ? payment.application.ticketNumber : 'No linked application'}</p>
								</div>
							</GlassCard>
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Submitted</p>
								<p className="mt-2 text-sm text-white">{formatDateLabel(payment.submittedAt)}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Amount</p>
								<p className="mt-2 text-sm text-white">PHP {payment.amount.toLocaleString()}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reference</p>
								<p className="mt-2 text-sm text-white break-words">{payment.referenceNumber}</p>
							</div>
						</div>

						<div className="space-y-3">
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Proof of payment</p>
							<div className="flex flex-wrap gap-2">
								{payment.proof ? (
									<a href={payment.proof.url ?? '#'} target={payment.proof.url ? '_blank' : undefined} rel={payment.proof.url ? 'noreferrer' : undefined} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 break-words">
										{payment.proof.name}
									</a>
								) : (
									<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">No proof uploaded</span>
								)}
							</div>
						</div>

						{payment.proof?.url && payment.proof.mimeType?.startsWith('image/') && (
							<div className="space-y-3">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Image preview</p>
								<div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
									<img src={payment.proof.url} alt={payment.proof.name} className="h-56 w-full object-cover" />
									<div className="border-t border-white/10 px-4 py-3 text-sm text-slate-300">{payment.proof.name}</div>
								</div>
							</div>
						)}

						{payment.reviewNote && (
							<div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200">Review note</p>
								<p className="mt-2 text-sm text-fuchsia-100 break-words">{payment.reviewNote}</p>
							</div>
						)}
					</div>
				</GlassCard>
			</motion.div>
		</>
	);
}