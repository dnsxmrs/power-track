'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, CalendarIcon, Clock3, FileTextIcon, MailIcon, MapPinIcon, PhoneIcon, SparklesIcon, X, XCircle } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import type { SubscriptionItem, SubscriptionStatus } from '../page';

interface ViewSubscriptionModalProps {
	isOpen: boolean;
	onClose: () => void;
	subscription: SubscriptionItem | null;
}

const STATUS_META: Record<SubscriptionStatus, { label: string; className: string; icon: typeof BadgeCheck }> = {
	active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: BadgeCheck },
	under_review: { label: 'Under Review', className: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: Clock3 },
	suspended: { label: 'Suspended', className: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20', icon: AlertTriangle },
	cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-300 border-red-500/20', icon: XCircle },
};

function formatDateLabel(dateString: string | null | undefined): string {
	if (!dateString) return 'Not scheduled';
	return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
}

export function ViewModal({ isOpen, onClose, subscription }: ViewSubscriptionModalProps) {
	if (!isOpen || !subscription) {
		return null;
	}

	const status = STATUS_META[subscription.status];
	const StatusIcon = status.icon;

	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
			<motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<GlassCard glowColor="cyan" className="w-full max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
					<div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Subscription details</p>
							<h2 className="text-2xl font-bold text-white">{subscription.userName}</h2>
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
							<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{subscription.planName}</span>
							<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{subscription.sourceApplication ? subscription.sourceApplication.ticketNumber : subscription.id}</span>
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Billing</p>
								<p className="mt-2 text-sm text-white">Cycle day {subscription.billingCycleDay ?? 'N/A'}</p>
								<p className="text-xs text-slate-400">Next due {formatDateLabel(subscription.nextDueDate)}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Usage</p>
								<p className="mt-2 text-sm text-white">{subscription.deviceCount} devices · {subscription.paymentCount} payments</p>
								<p className="text-xs text-slate-400">PHP {subscription.planMonthlyPrice.toLocaleString()} / month</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Review</p>
								<p className="mt-2 text-sm text-white break-words">{subscription.reviewedByName ?? 'Not yet reviewed'}</p>
								<p className="text-xs text-slate-400">{subscription.reviewedAt ? formatDateLabel(subscription.reviewedAt) : 'No review date yet'}</p>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<GlassCard glowColor="cyan" className="p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact</p>
								<div className="mt-3 space-y-2 text-sm text-slate-300">
									<p className="flex items-start gap-2 break-words"><MailIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{subscription.userEmail}</p>
									<p className="flex items-start gap-2 break-words"><PhoneIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{subscription.phoneNumber || 'No phone number'}</p>
								</div>
							</GlassCard>

							<GlassCard glowColor="indigo" className="p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Source application</p>
								<div className="mt-3 space-y-2 text-sm text-slate-300">
									<p className="flex items-start gap-2 break-words"><FileTextIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{subscription.sourceApplication ? subscription.sourceApplication.ticketNumber : 'No source application'}</p>
									<p className="flex items-start gap-2 break-words"><MapPinIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{subscription.planName}</p>
								</div>
							</GlassCard>
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Started</p>
								<p className="mt-2 flex items-center gap-2 text-sm text-white"><CalendarIcon size={14} className="text-cyan-300" />{formatDateLabel(subscription.startedAt)}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Devices allowed</p>
								<p className="mt-2 text-sm text-white">{subscription.planDeviceCap} devices max</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Updated</p>
								<p className="mt-2 text-sm text-white break-words">{formatDateLabel(subscription.updatedAt)}</p>
							</div>
						</div>

						{subscription.reviewNote && (
							<div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200">Review note</p>
								<p className="mt-2 text-sm text-fuchsia-100 break-words">{subscription.reviewNote}</p>
							</div>
						)}
					</div>
				</GlassCard>
			</motion.div>
		</>
	);
}