"use client";

import { motion } from 'framer-motion';
import { X, CalendarIcon, FileTextIcon, MailIcon, MapPinIcon, PhoneIcon, SparklesIcon, BadgeCheckIcon, Clock3Icon, AlertTriangleIcon, XCircleIcon } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import type { ApplicationItem, ApplicationStatus } from '../page';

interface ViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	application: ApplicationItem | null;
}

const STATUS_META: Record<ApplicationStatus, { label: string; className: string; icon: typeof BadgeCheckIcon }> = {
	submitted: { label: 'Submitted', className: 'bg-sky-500/10 text-sky-300 border-sky-500/20', icon: FileTextIcon },
	under_review: { label: 'Under Review', className: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: Clock3Icon },
	approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: BadgeCheckIcon },
	rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-300 border-red-500/20', icon: XCircleIcon },
	awaiting_downpayment: { label: 'Awaiting Downpayment', className: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20', icon: AlertTriangleIcon },
	active: { label: 'Active', className: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', icon: SparklesIcon },
};

function formatDateLabel(dateString: string): string {
	return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
}

export function ViewModal({ isOpen, onClose, application }: ViewModalProps) {
	if (!isOpen || !application) {
		return null;
	}

	const status = STATUS_META[application.status];
	const StatusIcon = status.icon;

	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
			<motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<GlassCard glowColor="cyan" className="w-full max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
					<div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Application details</p>
							<h2 className="text-2xl font-bold text-white">{application.fullName}</h2>
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
							<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{application.ticketNumber}</span>
							<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{application.planName}</span>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<GlassCard glowColor="cyan" className="p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact</p>
								<div className="mt-3 space-y-2 text-sm text-slate-300">
									<p className="flex items-start gap-2 break-words"><MailIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{application.email}</p>
									<p className="flex items-start gap-2 break-words"><PhoneIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{application.phoneNumber}</p>
								</div>
							</GlassCard>

							<GlassCard glowColor="indigo" className="p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Coverage</p>
								<div className="mt-3 space-y-2 text-sm text-slate-300">
									<p className="flex items-start gap-2 break-words"><MapPinIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{application.branch}</p>
									<p>{application.city}</p>
								</div>
							</GlassCard>
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Submitted</p>
								<p className="mt-2 flex items-center gap-2 text-sm text-white"><CalendarIcon size={14} className="text-cyan-300" />{formatDateLabel(application.submittedAt)}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Devices</p>
								<p className="mt-2 text-sm text-white">{application.deviceCount} devices</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reviewed by</p>
								<p className="mt-2 text-sm text-white break-words">{application.reviewedBy ?? 'Not yet reviewed'}</p>
							</div>
						</div>

						<div className="space-y-3">
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Documents</p>
							<div className="flex flex-wrap gap-2">
								{application.documents.map(documentName => (
									<span key={documentName} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 break-words">
										{documentName}
									</span>
								))}
							</div>
						</div>

						{application.reason && (
							<div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200">Review note</p>
								<p className="mt-2 text-sm text-fuchsia-100 break-words">{application.reason}</p>
							</div>
						)}
					</div>
				</GlassCard>
			</motion.div>
		</>
	);
}