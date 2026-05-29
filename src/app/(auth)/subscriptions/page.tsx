'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
import { GlassCard } from '../../components/GlassCard';
import { reviewSubscription } from '@/app/_actions/subscriptions/reviewsubscription';
import { ConfirmationModal } from './components/confirmationsubscription';
import { ReviewModal, type SubscriptionDecision } from './components/reviewsubscription';
import { ViewModal } from './components/viewsubscription';

export type SubscriptionStatus = 'active' | 'under_review' | 'suspended' | 'cancelled';
type StatusFilter = SubscriptionStatus | 'all';
type PlanFilter = 'all' | string;

export type SubscriptionItem = {
	id: string;
	status: SubscriptionStatus;
	statusLabel: string;
	userName: string;
	userEmail: string;
	phoneNumber: string;
	planName: string;
	planSlug: string;
	planMonthlyPrice: number;
	planDeviceCap: number;
	startedAt: string;
	nextDueDate: string | null;
	billingCycleDay: number | null;
	updatedAt: string;
	deviceCount: number;
	paymentCount: number;
	sourceApplication: {
		id: string;
		ticketNumber: string;
		status: string;
	} | null;
	reviewNote: string | null;
	reviewedAt: string | null;
	reviewedByName: string | null;
	reviewedByEmail: string | null;
};

const STATUS_META: Record<SubscriptionStatus, { label: string; className: string; icon: typeof CheckCircleIcon }> = {
	active: {
		label: 'Active',
		className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
		icon: BadgeCheckIcon,
	},
	under_review: {
		label: 'Under Review',
		className: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
		icon: Clock3Icon,
	},
	suspended: {
		label: 'Suspended',
		className: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
		icon: AlertTriangleIcon,
	},
	cancelled: {
		label: 'Cancelled',
		className: 'bg-red-500/10 text-red-300 border-red-500/20',
		icon: XCircleIcon,
	},
};

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
	{ value: 'all', label: 'All statuses' },
	{ value: 'active', label: 'Active' },
	{ value: 'under_review', label: 'Under review' },
	{ value: 'suspended', label: 'Suspended' },
	{ value: 'cancelled', label: 'Cancelled' },
];

function formatDateLabel(dateString: string | null | undefined): string {
	if (!dateString) {
		return 'Not scheduled';
	}

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
	return planSlug ? planSlug.charAt(0).toUpperCase() + planSlug.slice(1) : '';
}

export default function SubscriptionsPage() {
	const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
	const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
	const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [pendingDecision, setPendingDecision] = useState<SubscriptionDecision | null>(null);
	const [isApplyingReview, setIsApplyingReview] = useState(false);

	const planFilterOptions = useMemo(() => {
		const planMap = new Map<string, string>();

		subscriptions.forEach(subscription => {
			if (!planMap.has(subscription.planSlug)) {
				planMap.set(subscription.planSlug, subscription.planName);
			}
		});

		return [
			{ value: 'all', label: 'All plans' },
			...Array.from(planMap, ([value, label]) => ({ value, label })),
		];
	}, [subscriptions]);

	const loadSubscriptions = async () => {
		setIsLoadingSubscriptions(true);
		setLoadError(null);

		try {
			const response = await fetch('/api/subscriptions', { credentials: 'include' });

			if (!response.ok) {
				throw new Error('Failed to fetch subscriptions.');
			}

			const items = (await response.json()) as SubscriptionItem[];
			setSubscriptions(Array.isArray(items) ? items : []);
		} catch (error) {
			setSubscriptions([]);
			setLoadError(error instanceof Error ? error.message : 'Failed to load subscriptions.');
		} finally {
			setIsLoadingSubscriptions(false);
		}
	};

	useEffect(() => {
		void loadSubscriptions();
	}, []);

	const filteredSubscriptions = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return subscriptions.filter(subscription => {
			const matchesSearch =
				normalizedQuery.length === 0 ||
				subscription.id.toLowerCase().includes(normalizedQuery) ||
				subscription.userName.toLowerCase().includes(normalizedQuery) ||
				subscription.userEmail.toLowerCase().includes(normalizedQuery) ||
				subscription.planName.toLowerCase().includes(normalizedQuery) ||
				(subscription.sourceApplication?.ticketNumber ?? '').toLowerCase().includes(normalizedQuery);

			const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
			const matchesPlan = planFilter === 'all' || subscription.planSlug === planFilter;

			return matchesSearch && matchesStatus && matchesPlan;
		});
	}, [planFilter, searchQuery, subscriptions, statusFilter]);

	const totalSubscriptions = subscriptions.length;
	const activeCount = subscriptions.filter(subscription => subscription.status === 'active').length;
	const reviewingCount = subscriptions.filter(subscription => subscription.status === 'under_review').length;
	const attentionCount = subscriptions.filter(subscription => subscription.status === 'suspended' || subscription.status === 'cancelled').length;

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

	const openViewModal = (subscription: SubscriptionItem) => {
		setSelectedSubscription(subscription);
		setIsViewModalOpen(true);
	};

	const openReviewModal = (subscription: SubscriptionItem) => {
		setSelectedSubscription(subscription);
		setIsReviewModalOpen(true);
	};

	const handleSubmitReview = (decision: SubscriptionDecision) => {
		setPendingDecision(decision);
		setIsReviewModalOpen(false);
		setIsConfirmationModalOpen(true);
	};

	const handleConfirmReview = async () => {
		if (!selectedSubscription || !pendingDecision) {
			return;
		}

		setIsApplyingReview(true);
		try {
			await reviewSubscription({
				subscriptionId: selectedSubscription.id,
				status: pendingDecision.status,
				note: pendingDecision.note,
			});
			await loadSubscriptions();
		} finally {
			setIsApplyingReview(false);
			setIsConfirmationModalOpen(false);
			setPendingDecision(null);
			setSelectedSubscription(null);
		}
	};

	return (
		<>
			<motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6 pb-8 p-6">
				<motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-3 max-w-2xl">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-200 text-xs font-medium uppercase tracking-[0.2em]">
							<Layers3Icon size={14} />
							Subscriptions
						</div>
						<div className="space-y-2">
							<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Subscription Review Queue</h1>
							<p className="text-slate-300 leading-relaxed max-w-2xl">
								Review active client subscriptions, inspect linked users and applications, and keep billing dates and service status aligned.
							</p>
						</div>
					</div>

					<GlassCard glowColor="cyan" className="w-full lg:w-auto p-4">
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:min-w-[560px]">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
								<p className="mt-2 text-2xl font-bold text-white">{totalSubscriptions}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active</p>
								<p className="mt-2 text-2xl font-bold text-emerald-300">{activeCount}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reviewing</p>
								<p className="mt-2 text-2xl font-bold text-amber-300">{reviewingCount}</p>
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
								<h2 className="text-xl font-semibold text-white">Subscriptions</h2>
								<p className="text-sm text-slate-400">Search and filter the current subscription queue.</p>
							</div>
							<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
								<SparklesIcon size={14} className="text-cyan-300" />
								Updated for the current subscription workflow
							</div>
						</div>

						<div className="grid gap-3 lg:grid-cols-[1.4fr_auto_auto]">
							<div className="relative">
								<SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
								<input
									value={searchQuery}
									onChange={event => setSearchQuery(event.target.value)}
									placeholder="Search by user, email, ticket, or plan"
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
							{isLoadingSubscriptions && (
								<GlassCard glowColor="cyan" className="text-center py-14">
									<p className="text-sm text-slate-300">Loading subscriptions from the database...</p>
								</GlassCard>
							)}

							{!isLoadingSubscriptions && loadError && (
								<GlassCard glowColor="red" className="text-center py-14">
									<p className="text-sm text-red-200">{loadError}</p>
								</GlassCard>
							)}

							{!isLoadingSubscriptions && !loadError && filteredSubscriptions.map(subscription => {
								const status = STATUS_META[subscription.status];
								const StatusIcon = status.icon;

								return (
									<GlassCard key={subscription.id} glowColor="cyan" className="p-0 overflow-hidden" hover>
										<div className="p-5 space-y-4">
											<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
												<div className="space-y-3">
													<div className="flex flex-wrap items-center gap-2">
														<span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
															<StatusIcon size={14} />
															{status.label}
														</span>
														<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{subscription.id.slice(0, 12)}</span>
													</div>

													<div className="min-w-0">
														<h3 className="text-xl font-semibold text-white">{subscription.userName}</h3>
														<p className="text-sm text-slate-400 break-words">{subscription.planName} · {subscription.planDeviceCap} devices max</p>
													</div>
												</div>

												<div className="flex gap-2">
													<button type="button" onClick={() => openViewModal(subscription)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10">
														<EyeIcon size={15} />
														View
													</button>
													<button type="button" onClick={() => openReviewModal(subscription)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/15">
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
														<span className="min-w-0 break-words">{subscription.userEmail}</span>
													</p>
													<p className="text-slate-300 flex items-start gap-2 min-w-0 break-words">
														<PhoneIcon size={14} className="text-cyan-300 mt-0.5 shrink-0" />
														<span className="min-w-0 break-words">{formatPhoneNumber(subscription.phoneNumber)}</span>
													</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Plan</p>
													<p className="text-white flex items-start gap-2 min-w-0 break-words"><MapPinIcon size={14} className="text-cyan-300 mt-0.5 shrink-0" />{subscription.planName}</p>
													<p className="text-slate-300 break-words">{getPlanLabel(subscription.planSlug) || subscription.planSlug}</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Timeline</p>
													<p className="text-white flex items-center gap-2 min-w-0"><CalendarIcon size={14} className="text-cyan-300 shrink-0" />{formatDateLabel(subscription.startedAt)}</p>
													<p className="text-slate-300">{formatTimeAgo(subscription.startedAt)}</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Billing</p>
													<p className="text-white flex items-center gap-2 min-w-0"><FileTextIcon size={14} className="text-cyan-300 shrink-0" />{subscription.billingCycleDay ?? 'No cycle day'}</p>
													<p className="text-slate-300 break-words">Next due {formatDateLabel(subscription.nextDueDate)}</p>
												</div>
											</div>

											<div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between min-w-0">
												<div className="flex flex-wrap items-center gap-2 min-w-0">
													{subscription.sourceApplication ? (
														<span className="max-w-full rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300 break-words">
															Source application {subscription.sourceApplication.ticketNumber}
														</span>
													) : (
														<span className="max-w-full rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300 break-words">
															No source application linked
														</span>
													)}
												</div>

												<div className="text-sm text-slate-400 min-w-0 break-words">
													{subscription.reviewNote ? (
														<span className="text-fuchsia-300">{subscription.reviewNote}</span>
													) : (
														<span>Ready for review and billing alignment.</span>
													)}
												</div>
											</div>
										</div>
									</GlassCard>
								);
							})}

							{!isLoadingSubscriptions && !loadError && filteredSubscriptions.length === 0 && (
								<GlassCard glowColor="cyan" className="text-center py-14">
									<p className="text-sm text-slate-300">No subscriptions match your current filters.</p>
								</GlassCard>
							)}
						</div>
					</GlassCard>

					<GlassCard glowColor="cyan" className="space-y-4">
						<h2 className="text-xl font-semibold text-white">Review Notes</h2>
						<p className="text-sm text-slate-400">
							Subscription decisions are captured in audit logs, so the latest review note and reviewer stay visible from the detail view.
						</p>
						<div className="space-y-3 text-sm text-slate-300">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Primary flow</p>
								<p className="mt-2 text-white">Open a subscription, review the details, then confirm the status change with a note.</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Billing</p>
								<p className="mt-2 text-white">The page shows billing cycle day and next due date so the review keeps the schedule in view.</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Consistency</p>
								<p className="mt-2 text-white">Styling, spacing, and modal behavior follow the application review screens.</p>
							</div>
						</div>
					</GlassCard>
				</motion.div>
			</motion.div>

			<ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} subscription={selectedSubscription} />
			<ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onSubmit={handleSubmitReview} subscription={selectedSubscription} />
			<ConfirmationModal
				isOpen={isConfirmationModalOpen}
				onClose={() => setIsConfirmationModalOpen(false)}
				onConfirm={handleConfirmReview}
				subscription={selectedSubscription}
				decision={pendingDecision}
				isSubmitting={isApplyingReview}
			/>
		</>
	);
}