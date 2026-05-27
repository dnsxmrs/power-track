"use client";

import { useEffect, useMemo, useState } from 'react';
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
	PlusIcon,
	XCircleIcon,
} from 'lucide-react';
import { AddApplicationModal, type AddApplicationFormData } from './components/addapplicationmodal';
import { ReviewModal, type ApplicationDecision } from './components/reviewmodal';
import { ViewModal } from './components/viewmodal';
import { GlassCard } from '../../components/GlassCard';
import { addApplication, type CreateApplicationResult } from '@/app/_actions/application/addapplication';
import { reviewApplication } from '@/app/_actions/application/reviewapplication';

export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'awaiting_downpayment' | 'active';
type StatusFilter = ApplicationStatus | 'all';
type PlanFilter = 'all' | string;

export type ApplicationItem = {
	id: string;
	ticketNumber: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	planName: string;
	planSlug: string;
	planMonthlyPrice: number;
	planDeviceCap: number;
	deviceCount: number;
	branchName: string;
	branchCity: string;
	branchProvince: string;
	branchAddress: string;
	branchNotes: string | null;
	branchCode: string;
	branches: Array<{
		name: string;
		city?: string;
		province?: string;
		address?: string;
		notes?: string;
	}>;
	status: ApplicationStatus;
	submittedAt: string;
	updatedAt: string;
	reviewedByName?: string | null;
	reviewedAt?: string | null;
	statusReason?: string | null;
	specialRequirements?: string | null;
	documents: Array<{ name: string; url: string | null; mimeType: string | null }>;
};

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

function getPlanLabel(planSlug: string): string {
 	if (planSlug === 'starter') return 'Starter';
 	if (planSlug === 'growth') return 'Growth';
 	if (planSlug === 'enterprise') return 'Enterprise';
 	// fallback: capitalize
 	return planSlug ? planSlug.charAt(0).toUpperCase() + planSlug.slice(1) : '';
}

function getStatusLabel(status: ApplicationStatus): string {
	return STATUS_META[status].label;
}

export default function ApplicationsPage() {
	const [applications, setApplications] = useState<ApplicationItem[]>([]);
	const [planOptions, setPlanOptions] = useState<Array<{ slug: string; name: string }>>([]);
	const [isLoadingApplications, setIsLoadingApplications] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
	const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [isAddApplicationModalOpen, setIsAddApplicationModalOpen] = useState(false);
	const [pendingDecision, setPendingDecision] = useState<ApplicationDecision | null>(null);
	const [isApplyingReview, setIsApplyingReview] = useState(false);
	const [isCreatingApplication, setIsCreatingApplication] = useState(false);

	const planFilterOptions = useMemo(
		() => [
			{ value: 'all', label: 'All plans' },
			...planOptions.map(option => ({ value: option.slug, label: option.name })),
		],
		[planOptions],
	);

	const loadApplications = async () => {
		setIsLoadingApplications(true);
		setLoadError(null);

		try {
			const [applicationsResponse, plansResponse] = await Promise.all([
				fetch('/api/applications', { credentials: 'include' }),
				fetch('/api/plans', { credentials: 'include' }),
			]);

			if (!applicationsResponse.ok) {
				throw new Error('Failed to fetch applications.');
			}

			if (plansResponse.ok) {
				const plans = await plansResponse.json();
				setPlanOptions(Array.isArray(plans) ? plans.map((plan: any) => ({ slug: plan.slug, name: plan.name })) : []);
			} else {
				setPlanOptions([]);
			}

			const items = (await applicationsResponse.json()) as ApplicationItem[];
			setApplications(Array.isArray(items) ? items : []);
		} catch (error) {
			setApplications([]);
			setPlanOptions([]);
			setLoadError(error instanceof Error ? error.message : 'Failed to load applications.');
		} finally {
			setIsLoadingApplications(false);
		}
	};

	useEffect(() => {
		void loadApplications();
	}, []);

	const filteredApplications = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return applications.filter(application => {
			const matchesSearch =
				normalizedQuery.length === 0 ||
				application.ticketNumber.toLowerCase().includes(normalizedQuery) ||
				application.fullName.toLowerCase().includes(normalizedQuery) ||
				application.email.toLowerCase().includes(normalizedQuery) ||
				application.branchName.toLowerCase().includes(normalizedQuery) ||
				application.branchCity.toLowerCase().includes(normalizedQuery) ||
				application.planName.toLowerCase().includes(normalizedQuery);

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

	const handleCreateApplication = async (applicationData: AddApplicationFormData) => {
		setIsCreatingApplication(true);
		try {
			const formData = new FormData();
			formData.append('fullName', applicationData.fullName);
			formData.append('email', applicationData.email);
			formData.append('phoneNumber', applicationData.phoneNumber);
			formData.append('planSlug', applicationData.planSlug);
			formData.append('deviceCount', String(applicationData.deviceCount));
			formData.append('branches', JSON.stringify(applicationData.branches));
			formData.append('specialRequirements', applicationData.specialRequirements);
			formData.append('proofOfBillingFile', applicationData.proofOfBillingFile);
			formData.append('validIdFrontFile', applicationData.validIdFrontFile);
			formData.append('validIdBackFile', applicationData.validIdBackFile);

			await addApplication(formData);
			await loadApplications();
			setIsAddApplicationModalOpen(false);
		} finally {
			setIsCreatingApplication(false);
		}
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
			await reviewApplication({
				applicationId: selectedApplication.id,
				status: pendingDecision.status,
				note: pendingDecision.note,
			});
			await loadApplications();
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
							<button
								type="button"
								onClick={() => setIsAddApplicationModalOpen(true)}
								className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/15"
							>
								<PlusIcon size={16} />
								Add Application
							</button>
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
									{planFilterOptions.map(option => (
										<option key={option.value} value={option.value} className="bg-slate-950">
											{option.label}
										</option>
									))}
								</select>
							</label>
						</div>

						<div className="space-y-4">
							{isLoadingApplications && (
								<GlassCard glowColor="cyan" className="text-center py-14">
									<p className="text-sm text-slate-300">Loading applications from the database...</p>
								</GlassCard>
							)}

							{!isLoadingApplications && filteredApplications.map(application => {
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
														<p className="text-sm text-slate-400 break-words">{application.planName} · {application.deviceCount} devices</p>
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
													<p className="text-white flex items-start gap-2 min-w-0 break-words"><MapPinIcon size={14} className="text-cyan-300 mt-0.5 shrink-0" />{application.branchName || 'Unassigned branch'}</p>
													<p className="text-slate-300 break-words">{application.branchCity || application.branchCode || 'No branch data'}</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Timeline</p>
													<p className="text-white flex items-center gap-2 min-w-0"><CalendarIcon size={14} className="text-cyan-300 shrink-0" />{formatDateLabel(application.submittedAt)}</p>
													<p className="text-slate-300">{formatTimeAgo(application.submittedAt)}</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Documents</p>
													<p className="text-white flex items-center gap-2 min-w-0"><FileTextIcon size={14} className="text-cyan-300 shrink-0" />{application.documents.length} uploaded</p>
													<p className="text-slate-300 break-words">{application.reviewedByName ? `Reviewed by ${application.reviewedByName}` : 'Pending assignment'}</p>
												</div>
											</div>

											<div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between min-w-0">
												<div className="flex flex-wrap items-center gap-2 min-w-0">
													{application.documents.map(document => (
														<a
															href={document.url ?? '#'}
															target={document.url ? '_blank' : undefined}
															rel={document.url ? 'noreferrer' : undefined}
															key={document.name}
															className="max-w-full rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300 break-words"
														>
															{document.name}
														</a>
													))}
												</div>

												<div className="text-sm text-slate-400 min-w-0 break-words">
													{application.statusReason ? (
														<span className="text-fuchsia-300">{application.statusReason}</span>
													) : (
														<span>Ready for the next workflow step.</span>
													)}
												</div>
											</div>
										</div>
									</GlassCard>
								);
										})}

										{!isLoadingApplications && filteredApplications.length === 0 && (
								<GlassCard glowColor="cyan" className="text-center py-14">
									<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
										<FileTextIcon size={24} />
									</div>
									<h3 className="mt-4 text-lg font-semibold text-white">No applications match these filters</h3>
									<p className="mt-2 text-sm text-slate-400">Try widening the search or clearing one of the filters.</p>
								</GlassCard>
							)}

							{loadError && (
								<GlassCard glowColor="red" className="text-center py-10">
									<p className="text-sm text-red-200">{loadError}</p>
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
									{ label: 'Submitted this week', value: String(applications.filter(application => {
										const submittedAt = new Date(application.submittedAt);
										const now = new Date();
										const diffDays = Math.floor((now.getTime() - submittedAt.getTime()) / 86_400_000);
										return diffDays <= 7;
									}).length) },
									{ label: 'Awaiting payment', value: String(applications.filter(application => application.status === 'awaiting_downpayment').length) },
									{ label: 'Rejected for review', value: String(applications.filter(application => application.status === 'rejected').length) },
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

			<AddApplicationModal
				isOpen={isAddApplicationModalOpen}
				onClose={() => setIsAddApplicationModalOpen(false)}
				onSubmit={handleCreateApplication}
				isSubmitting={isCreatingApplication}
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
