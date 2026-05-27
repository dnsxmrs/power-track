"use client";

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfirmationModal } from './components/confirmationmodal';
import {
	AlertTriangleIcon,
	ArrowRightIcon,
	BadgeCheckIcon,
	CalendarIcon,
	CheckCircleIcon,
	Clock3Icon,
	EyeIcon,
	FileTextIcon,
	FilterIcon,
	Layers3Icon,
	MailIcon,
	MapPinIcon,
	PhoneIcon,
	SearchIcon,
	SparklesIcon,
	XCircleIcon,
} from 'lucide-react';
import { ReviewModal, type ApplicationDecision } from './components/reviewmodal';
import { ViewModal } from './components/viewmodal';
import { GlassCard } from '../../components/GlassCard';

export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'awaiting_downpayment' | 'active';
type StatusFilter = ApplicationStatus | 'all';
type PlanFilter = 'all' | 'starter' | 'growth' | 'enterprise';

export type ApplicationItem = {
	id: string;
	ticketNumber: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	planName: string;
	planSlug: 'starter' | 'growth' | 'enterprise';
	deviceCount: number;
	branch: string;
	city: string;
	status: ApplicationStatus;
	submittedAt: string;
	reviewedBy?: string;
	reason?: string;
	documents: string[];
};

const APPLICATIONS: ApplicationItem[] = [
	{
		id: 'app-1',
		ticketNumber: 'APP-2026-1048',
		fullName: 'Maria Santos',
		email: 'maria.santos@sunrisehub.ph',
		phoneNumber: '+63 917 564 8821',
		planName: 'Growth Plan',
		planSlug: 'growth',
		deviceCount: 18,
		branch: 'Cebu Main Office',
		city: 'Cebu City',
		status: 'under_review',
		submittedAt: '2026-05-26T08:20:00.000Z',
		documents: ['Proof of Billing', 'Valid ID Front', 'Valid ID Back'],
	},
	{
		id: 'app-2',
		ticketNumber: 'APP-2026-1047',
		fullName: 'Carlos Dela Cruz',
		email: 'carlos.delacruz@northstarenergy.ph',
		phoneNumber: '+63 918 223 1104',
		planName: 'Enterprise Plan',
		planSlug: 'enterprise',
		deviceCount: 72,
		branch: 'Quezon City Operations',
		city: 'Quezon City',
		status: 'awaiting_downpayment',
		submittedAt: '2026-05-26T05:45:00.000Z',
		reason: 'Approved pending downpayment confirmation.',
		documents: ['Proof of Billing', 'Valid ID Front', 'Valid ID Back'],
	},
	{
		id: 'app-3',
		ticketNumber: 'APP-2026-1046',
		fullName: 'Angela Reyes',
		email: 'angela.reyes@greenfieldco.ph',
		phoneNumber: '+63 912 741 9980',
		planName: 'Starter Plan',
		planSlug: 'starter',
		deviceCount: 8,
		branch: 'Davao Branch',
		city: 'Davao City',
		status: 'approved',
		submittedAt: '2026-05-25T13:10:00.000Z',
		reviewedBy: 'Admin User',
		documents: ['Proof of Billing', 'Valid ID Front'],
	},
	{
		id: 'app-4',
		ticketNumber: 'APP-2026-1045',
		fullName: 'Jorge Villanueva',
		email: 'jorge.villanueva@sunridge.ph',
		phoneNumber: '+63 905 410 6632',
		planName: 'Growth Plan',
		planSlug: 'growth',
		deviceCount: 24,
		branch: 'Bacolod Service Center',
		city: 'Bacolod',
		status: 'submitted',
		submittedAt: '2026-05-25T09:30:00.000Z',
		documents: ['Proof of Billing'],
	},
	{
		id: 'app-5',
		ticketNumber: 'APP-2026-1044',
		fullName: 'Nadine Mercado',
		email: 'nadine.mercado@harborline.co',
		phoneNumber: '+63 919 230 4481',
		planName: 'Enterprise Plan',
		planSlug: 'enterprise',
		deviceCount: 64,
		branch: 'Iloilo Hub',
		city: 'Iloilo City',
		status: 'rejected',
		submittedAt: '2026-05-24T16:05:00.000Z',
		reason: 'Mismatch between billing name and applicant details.',
		documents: ['Proof of Billing', 'Valid ID Front', 'Valid ID Back'],
	},
	{
		id: 'app-6',
		ticketNumber: 'APP-2026-1043',
		fullName: 'Ramon Castillo',
		email: 'ramon.castillo@bluepeak.ph',
		phoneNumber: '+63 927 888 5512',
		planName: 'Starter Plan',
		planSlug: 'starter',
		deviceCount: 12,
		branch: 'Makati Branch Office',
		city: 'Makati',
		status: 'active',
		submittedAt: '2026-05-24T10:25:00.000Z',
		reviewedBy: 'Operations Lead',
		documents: ['Proof of Billing', 'Valid ID Front', 'Valid ID Back'],
	},
];

const STATUS_META: Record<ApplicationStatus, { label: string; className: string; icon: typeof CheckCircleIcon }> = {
	submitted: {
		label: 'Submitted',
		className: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
		icon: FileTextIcon,
	},
	under_review: {
		label: 'Under Review',
		className: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
		icon: Clock3Icon,
	},
	approved: {
		label: 'Approved',
		className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
		icon: BadgeCheckIcon,
	},
	rejected: {
		label: 'Rejected',
		className: 'bg-red-500/10 text-red-300 border-red-500/20',
		icon: XCircleIcon,
	},
	awaiting_downpayment: {
		label: 'Awaiting Downpayment',
		className: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
		icon: AlertTriangleIcon,
	},
	active: {
		label: 'Active',
		className: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
		icon: SparklesIcon,
	},
};

const PLAN_FILTERS: Array<{ value: PlanFilter; label: string }> = [
	{ value: 'all', label: 'All plans' },
	{ value: 'starter', label: 'Starter' },
	{ value: 'growth', label: 'Growth' },
	{ value: 'enterprise', label: 'Enterprise' },
];

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
	{ value: 'all', label: 'All statuses' },
	{ value: 'submitted', label: 'Submitted' },
	{ value: 'under_review', label: 'Under review' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' },
	{ value: 'awaiting_downpayment', label: 'Awaiting downpayment' },
	{ value: 'active', label: 'Active' },
];

function formatDateLabel(dateString: string): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(dateString));
}

function formatTimeAgo(dateString: string): string {
	const date = new Date(dateString);
	const elapsedMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));

	if (elapsedMinutes < 1) return 'just now';
	if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

	const elapsedHours = Math.floor(elapsedMinutes / 60);
	if (elapsedHours < 24) return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`;

	const elapsedDays = Math.floor(elapsedHours / 24);
	return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`;
}

function formatPhoneNumber(phoneNumber: string): string {
	return phoneNumber.replace(/\s+/g, ' ').trim();
}

function getPlanLabel(planSlug: ApplicationItem['planSlug']): string {
	if (planSlug === 'starter') return 'Starter';
	if (planSlug === 'growth') return 'Growth';
	return 'Enterprise';
}

export default function ApplicationsPage() {
	const [applications, setApplications] = useState<ApplicationItem[]>(APPLICATIONS);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
	const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [pendingDecision, setPendingDecision] = useState<ApplicationDecision | null>(null);
	const [isApplyingReview, setIsApplyingReview] = useState(false);

	const filteredApplications = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return applications.filter(application => {
			const matchesSearch =
				normalizedQuery.length === 0 ||
				application.ticketNumber.toLowerCase().includes(normalizedQuery) ||
				application.fullName.toLowerCase().includes(normalizedQuery) ||
				application.email.toLowerCase().includes(normalizedQuery) ||
				application.branch.toLowerCase().includes(normalizedQuery) ||
				application.city.toLowerCase().includes(normalizedQuery);

			const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
			const matchesPlan = planFilter === 'all' || application.planSlug === planFilter;

			return matchesSearch && matchesStatus && matchesPlan;
		});
	}, [applications, planFilter, searchQuery, statusFilter]);

	const totalApplications = applications.length;
	const underReviewCount = applications.filter(application => application.status === 'under_review').length;
	const approvedCount = applications.filter(application => application.status === 'approved' || application.status === 'active').length;
	const attentionCount = applications.filter(
		application => application.status === 'rejected' || application.status === 'awaiting_downpayment',
	).length;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.08 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 18 },
		visible: { opacity: 1, y: 0 },
	};

	const openViewModal = (application: ApplicationItem) => {
		setSelectedApplication(application);
		setIsViewModalOpen(true);
	};

	const openReviewModal = (application: ApplicationItem) => {
		setSelectedApplication(application);
		setIsReviewModalOpen(true);
	};

	const handleSubmitReview = (decision: ApplicationDecision) => {
		setPendingDecision(decision);
		setIsReviewModalOpen(false);
		setIsConfirmationModalOpen(true);
	};

	const handleConfirmReview = async () => {
		if (!selectedApplication || !pendingDecision) {
			return;
		}

		setIsApplyingReview(true);
		try {
			setApplications(currentApplications =>
				currentApplications.map(application => {
					if (application.id !== selectedApplication.id) {
						return application;
					}

					return {
						...application,
						status: pendingDecision.status,
						reason: pendingDecision.note.trim() || application.reason,
						reviewedBy: 'Current Admin',
					};
				}),
			);
		} finally {
			setIsApplyingReview(false);
			setIsConfirmationModalOpen(false);
			setPendingDecision(null);
			setSelectedApplication(null);
		}
	};

	return (
		<>
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-7xl mx-auto space-y-6 pb-8 p-6"
			>
				<motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-3 max-w-2xl">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-200 text-xs font-medium uppercase tracking-[0.2em]">
							<Layers3Icon size={14} />
							Applications
						</div>
						<div className="space-y-2">
							<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Application Review Queue</h1>
							<p className="text-slate-300 leading-relaxed max-w-2xl">
								Monitor incoming subscriptions, review submitted documents, and move each application through the same
								workflow style used across the rest of the admin app.
							</p>
						</div>
					</div>

					<GlassCard glowColor="cyan" className="w-full lg:w-auto p-4">
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:min-w-[560px]">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
								<p className="mt-2 text-2xl font-bold text-white">{totalApplications}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reviewing</p>
								<p className="mt-2 text-2xl font-bold text-amber-300">{underReviewCount}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Approved</p>
								<p className="mt-2 text-2xl font-bold text-emerald-300">{approvedCount}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Needs action</p>
								<p className="mt-2 text-2xl font-bold text-fuchsia-300">{attentionCount}</p>
							</div>
						</div>
					</GlassCard>
				</motion.div>

				<motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
					<GlassCard glowColor="indigo" className="space-y-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<h2 className="text-xl font-semibold text-white">Applications</h2>
								<p className="text-sm text-slate-400">Search and filter the current submission queue.</p>
							</div>
							<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
								<SparklesIcon size={14} className="text-cyan-300" />
								Updated for the current review workflow
							</div>
						</div>

						<div className="grid gap-3 lg:grid-cols-[1.4fr_auto_auto]">
							<div className="relative">
								<SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
								<input
									value={searchQuery}
									onChange={event => setSearchQuery(event.target.value)}
									placeholder="Search by ticket, name, email, branch, or city"
									className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8"
								/>
							</div>

							<label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
								<FilterIcon size={16} className="text-cyan-300" />
								<select
									value={statusFilter}
									onChange={event => setStatusFilter(event.target.value as StatusFilter)}
									className="bg-transparent outline-none text-sm text-white"
								>
									{STATUS_FILTERS.map(option => (
										<option key={option.value} value={option.value} className="bg-slate-950">
											{option.label}
										</option>
									))}
								</select>
							</label>

							<label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
								<FileTextIcon size={16} className="text-cyan-300" />
								<select
									value={planFilter}
									onChange={event => setPlanFilter(event.target.value as PlanFilter)}
									className="bg-transparent outline-none text-sm text-white"
								>
									{PLAN_FILTERS.map(option => (
										<option key={option.value} value={option.value} className="bg-slate-950">
											{option.label}
										</option>
									))}
								</select>
							</label>
						</div>

						<div className="space-y-4">
							{filteredApplications.map(application => {
								const status = STATUS_META[application.status];
								const StatusIcon = status.icon;

								return (
									<GlassCard key={application.id} glowColor="cyan" className="p-0 overflow-hidden" hover>
										<div className="p-5 space-y-4">
											<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
												<div className="space-y-3">
													<div className="flex flex-wrap items-center gap-2">
														<span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
															<StatusIcon size={14} />
															{status.label}
														</span>
														<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
															{application.ticketNumber}
														</span>
													</div>

													<div className="min-w-0">
														<h3 className="text-xl font-semibold text-white">{application.fullName}</h3>
														<p className="text-sm text-slate-400 break-words">{getPlanLabel(application.planSlug)} · {application.deviceCount} devices</p>
													</div>
												</div>

												<div className="flex gap-2">
													<button type="button" onClick={() => openViewModal(application)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10">
														<EyeIcon size={15} />
														View
													</button>
													<button type="button" onClick={() => openReviewModal(application)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/15">
														Review
														<ArrowRightIcon size={15} />
													</button>
												</div>
											</div>

											<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-sm min-w-0">
												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact</p>
													<p className="text-white flex items-start gap-2 min-w-0 break-words">
														<MailIcon size={14} className="text-cyan-300 mt-0.5 shrink-0" />
														<span className="min-w-0 break-words">{application.email}</span>
													</p>
													<p className="text-slate-300 flex items-start gap-2 min-w-0 break-words">
														<PhoneIcon size={14} className="text-cyan-300 mt-0.5 shrink-0" />
														<span className="min-w-0 break-words">{formatPhoneNumber(application.phoneNumber)}</span>
													</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Branch</p>
													<p className="text-white flex items-start gap-2 min-w-0 break-words"><MapPinIcon size={14} className="text-cyan-300 mt-0.5 shrink-0" />{application.branch}</p>
													<p className="text-slate-300 break-words">{application.city}</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Timeline</p>
													<p className="text-white flex items-center gap-2 min-w-0"><CalendarIcon size={14} className="text-cyan-300 shrink-0" />{formatDateLabel(application.submittedAt)}</p>
													<p className="text-slate-300">{formatTimeAgo(application.submittedAt)}</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Documents</p>
													<p className="text-white flex items-center gap-2 min-w-0"><FileTextIcon size={14} className="text-cyan-300 shrink-0" />{application.documents.length} uploaded</p>
													<p className="text-slate-300 break-words">{application.reviewedBy ? `Reviewed by ${application.reviewedBy}` : 'Pending assignment'}</p>
												</div>
											</div>

											<div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between min-w-0">
												<div className="flex flex-wrap items-center gap-2 min-w-0">
													{application.documents.map(documentName => (
														<span key={documentName} className="max-w-full rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300 break-words">
															{documentName}
														</span>
													))}
												</div>

												<div className="text-sm text-slate-400 min-w-0 break-words">
													{application.reason ? (
														<span className="text-fuchsia-300">{application.reason}</span>
													) : (
														<span>Ready for the next workflow step.</span>
													)}
												</div>
											</div>
										</div>
									</GlassCard>
								);
							})}

							{filteredApplications.length === 0 && (
								<GlassCard glowColor="cyan" className="text-center py-14">
									<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
										<FileTextIcon size={24} />
									</div>
									<h3 className="mt-4 text-lg font-semibold text-white">No applications match these filters</h3>
									<p className="mt-2 text-sm text-slate-400">Try widening the search or clearing one of the filters.</p>
								</GlassCard>
							)}
						</div>
					</GlassCard>

					<div className="space-y-6">
						<GlassCard glowColor="emerald" className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
									<CheckCircleIcon size={20} />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-white">Review Focus</h2>
									<p className="text-sm text-slate-400">What the team should look at first.</p>
								</div>
							</div>

							<div className="space-y-3 text-sm text-slate-300">
								<div className="rounded-xl border border-white/10 bg-white/5 p-4">
									Confirm billing names and contact details before approving.
								</div>
								<div className="rounded-xl border border-white/10 bg-white/5 p-4">
									Verify downpayment receipts for applications waiting on payment.
								</div>
								<div className="rounded-xl border border-white/10 bg-white/5 p-4">
									Check that all required documents are attached before activation.
								</div>
							</div>
						</GlassCard>

						<GlassCard glowColor="amber" className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-300">
									<AlertTriangleIcon size={20} />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-white">Queue Snapshot</h2>
									<p className="text-sm text-slate-400">A quick summary of the current workload.</p>
								</div>
							</div>

							<div className="space-y-3 text-sm">
								{[
									{ label: 'Submitted this week', value: '12' },
									{ label: 'Awaiting payment', value: '4' },
									{ label: 'Rejected for review', value: '2' },
								].map(item => (
									<div key={item.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
										<span className="text-slate-300">{item.label}</span>
										<span className="font-semibold text-white">{item.value}</span>
									</div>
								))}
							</div>
						</GlassCard>
					</div>
				</motion.div>
			</motion.div>

			<ViewModal
				isOpen={isViewModalOpen}
				application={selectedApplication}
				onClose={() => {
					setIsViewModalOpen(false);
					setSelectedApplication(null);
				}}
			/>

			<ReviewModal
				isOpen={isReviewModalOpen}
				application={selectedApplication}
				onClose={() => {
					setIsReviewModalOpen(false);
					setSelectedApplication(null);
				}}
				onSubmit={handleSubmitReview}
			/>

			<ConfirmationModal
				isOpen={isConfirmationModalOpen}
				application={selectedApplication}
				decision={pendingDecision}
				isSubmitting={isApplyingReview}
				onClose={() => {
					setIsConfirmationModalOpen(false);
					setPendingDecision(null);
					setSelectedApplication(null);
				}}
				onConfirm={handleConfirmReview}
			/>
		</>
	);
}
