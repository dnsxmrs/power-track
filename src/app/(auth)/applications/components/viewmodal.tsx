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
	const imageDocuments = application.documents.filter(document => document.mimeType?.startsWith('image/'));
	const branches = application.branches.length > 0
		? application.branches
		: [{
			name: application.branchName || 'Unassigned branch',
			city: application.branchCity || '',
			province: application.branchProvince || '',
			address: application.branchAddress || '',
			notes: application.branchNotes || '',
		}];

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

						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Plan limit</p>
								<p className="mt-2 text-sm text-white">{application.planDeviceCap} devices max</p>
								<p className="text-xs text-slate-400">PHP {application.planMonthlyPrice.toLocaleString()} / month</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status note</p>
								<p className="mt-2 text-sm text-white break-words">{application.statusReason ?? 'No review note yet'}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reviewed</p>
								<p className="mt-2 text-sm text-white break-words">{application.reviewedByName ?? 'Pending review'}</p>
								<p className="text-xs text-slate-400">{application.reviewedAt ? formatDateLabel(application.reviewedAt) : 'Not yet reviewed'}</p>
							</div>
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
									<p className="flex items-start gap-2 break-words"><MapPinIcon size={14} className="mt-0.5 shrink-0 text-cyan-300" />{application.branchName || 'Unassigned branch'}</p>
									<p>{application.branchCity || application.branchCode || 'No branch data'}</p>
								</div>
							</GlassCard>
						</div>

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
								<p className="mt-2 text-sm text-white break-words">{application.reviewedByName ?? 'Not yet reviewed'}</p>
							</div>
						</div>

						<div className="space-y-3">
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Documents</p>
							<div className="flex flex-wrap gap-2">
								{application.documents.map(document => (
									<a
										key={document.name}
										href={document.url ?? '#'}
										target={document.url ? '_blank' : undefined}
										rel={document.url ? 'noreferrer' : undefined}
										className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 break-words"
									>
										{document.name}
									</a>
								))}
							</div>
						</div>

						{imageDocuments.length > 0 && (
							<div className="space-y-3">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Image previews</p>
								<div className="grid gap-4 md:grid-cols-2">
									{imageDocuments.map(document => (
										<div key={document.name} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
											{document.url ? (
												<img src={document.url} alt={document.name} className="h-56 w-full object-cover" />
											) : (
												<div className="flex h-56 items-center justify-center text-sm text-slate-400">No preview available</div>
											)}
											<div className="border-t border-white/10 px-4 py-3 text-sm text-slate-300">{document.name}</div>
										</div>
									))}
								</div>
							</div>
						)}

						{application.statusReason && (
							<div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200">Review note</p>
								<p className="mt-2 text-sm text-fuchsia-100 break-words">{application.statusReason}</p>
							</div>
						)}
					</div>
				</GlassCard>
			</motion.div>
		</>
	);
}