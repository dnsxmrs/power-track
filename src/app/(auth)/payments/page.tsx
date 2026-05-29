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
	PhoneIcon,
	SearchIcon,
	SparklesIcon,
	XCircleIcon,
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { reviewPayment } from '@/app/_actions/payments/reviewpayment';
import { ConfirmationModal } from './components/confirmationpayment';
import { ReviewModal, type PaymentDecision } from './components/reviewpayment';
import { ViewModal } from './components/viewpayment';

export type PaymentStatus = 'pending_verification' | 'verified' | 'rejected';
type StatusFilter = PaymentStatus | 'all';

export type PaymentItem = {
	id: string;
	referenceNumber: string;
	billingMonth: string;
	amount: number;
	status: PaymentStatus;
	statusLabel: string;
	submittedAt: string;
	reviewedAt: string | null;
	reviewNote: string | null;
	reviewedByName: string | null;
	reviewedByEmail: string | null;
	proof: {
		name: string;
		url: string | null;
		mimeType: string | null;
	} | null;
	user: {
		id: string;
		name: string;
		email: string;
		phoneNumber: string | null;
	} | null;
	subscription: {
		id: string;
		status: string;
		planName: string;
		planSlug: string;
	} | null;
	application: {
		id: string;
		ticketNumber: string;
		status: string;
	} | null;
};

const STATUS_META: Record<PaymentStatus, { label: string; className: string; icon: typeof CheckCircleIcon }> = {
	pending_verification: {
		label: 'Pending verification',
		className: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
		icon: FileTextIcon,
	},
	verified: {
		label: 'Verified',
		className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
		icon: BadgeCheckIcon,
	},
	rejected: {
		label: 'Rejected',
		className: 'bg-red-500/10 text-red-300 border-red-500/20',
		icon: XCircleIcon,
	},
};

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
	{ value: 'all', label: 'All statuses' },
	{ value: 'pending_verification', label: 'Pending verification' },
	{ value: 'verified', label: 'Verified' },
	{ value: 'rejected', label: 'Rejected' },
];

function formatDateLabel(dateString: string | null | undefined): string {
	if (!dateString) return 'Not scheduled';
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

function formatPhoneNumber(phoneNumber: string | null | undefined): string {
	if (!phoneNumber) return '(none)';
	return phoneNumber.replace(/\s+/g, ' ').trim();
}

export default function PaymentsPage() {
	const [payments, setPayments] = useState<PaymentItem[]>([]);
	const [isLoadingPayments, setIsLoadingPayments] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [pendingDecision, setPendingDecision] = useState<PaymentDecision | null>(null);
	const [isApplyingReview, setIsApplyingReview] = useState(false);

	const loadPayments = async () => {
		setIsLoadingPayments(true);
		setLoadError(null);

		try {
			const response = await fetch('/api/payments', { credentials: 'include' });

			if (!response.ok) {
				throw new Error('Failed to fetch payments.');
			}

			const items = (await response.json()) as PaymentItem[];
			setPayments(Array.isArray(items) ? items : []);
		} catch (error) {
			setPayments([]);
			setLoadError(error instanceof Error ? error.message : 'Failed to load payments.');
		} finally {
			setIsLoadingPayments(false);
		}
	};

	useEffect(() => {
		void loadPayments();
	}, []);

	const filteredPayments = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return payments.filter(payment => {
			const matchesSearch =
				normalizedQuery.length === 0 ||
				payment.referenceNumber.toLowerCase().includes(normalizedQuery) ||
				payment.billingMonth.toLowerCase().includes(normalizedQuery) ||
				payment.user?.name.toLowerCase().includes(normalizedQuery) ||
				payment.user?.email.toLowerCase().includes(normalizedQuery) ||
				payment.subscription?.planName.toLowerCase().includes(normalizedQuery) ||
				payment.application?.ticketNumber.toLowerCase().includes(normalizedQuery);

			const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [payments, searchQuery, statusFilter]);

	const totalPayments = payments.length;
	const pendingCount = payments.filter(payment => payment.status === 'pending_verification').length;
	const verifiedCount = payments.filter(payment => payment.status === 'verified').length;
	const rejectedCount = payments.filter(payment => payment.status === 'rejected').length;

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

	const openViewModal = (payment: PaymentItem) => {
		setSelectedPayment(payment);
		setIsViewModalOpen(true);
	};

	const openReviewModal = (payment: PaymentItem) => {
		setSelectedPayment(payment);
		setIsReviewModalOpen(true);
	};

	const handleSubmitReview = (decision: PaymentDecision) => {
		setPendingDecision(decision);
		setIsReviewModalOpen(false);
		setIsConfirmationModalOpen(true);
	};

	const handleConfirmReview = async () => {
		if (!selectedPayment || !pendingDecision) {
			return;
		}

		setIsApplyingReview(true);
		try {
			await reviewPayment({
				paymentId: selectedPayment.id,
				status: pendingDecision.status,
				note: pendingDecision.note,
			});
			await loadPayments();
		} finally {
			setIsApplyingReview(false);
			setIsConfirmationModalOpen(false);
			setPendingDecision(null);
			setSelectedPayment(null);
		}
	};

	return (
		<>
			<motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6 pb-8 p-6">
				<motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-3 max-w-2xl">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-200 text-xs font-medium uppercase tracking-[0.2em]">
							<Layers3Icon size={14} />
							Payments
						</div>
						<div className="space-y-2">
							<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Payment Verification Queue</h1>
							<p className="text-slate-300 leading-relaxed max-w-2xl">
								Review submitted payment proofs, verify or reject each transaction, and keep the billing flow aligned with the subscription records.
							</p>
						</div>
					</div>

					<GlassCard glowColor="cyan" className="w-full lg:w-auto p-4">
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:min-w-[560px]">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
								<p className="mt-2 text-2xl font-bold text-white">{totalPayments}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending</p>
								<p className="mt-2 text-2xl font-bold text-sky-300">{pendingCount}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Verified</p>
								<p className="mt-2 text-2xl font-bold text-emerald-300">{verifiedCount}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rejected</p>
								<p className="mt-2 text-2xl font-bold text-red-300">{rejectedCount}</p>
							</div>
						</div>
					</GlassCard>
				</motion.div>

				<motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
					<GlassCard glowColor="indigo" className="space-y-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<h2 className="text-xl font-semibold text-white">Payments</h2>
								<p className="text-sm text-slate-400">Search and filter the current payment queue.</p>
							</div>
							<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
								<SparklesIcon size={14} className="text-cyan-300" />
								Updated for the current payment workflow
							</div>
						</div>

						<div className="grid gap-3 lg:grid-cols-[1.4fr_auto]">
							<div className="relative">
								<SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
								<input
									value={searchQuery}
									onChange={event => setSearchQuery(event.target.value)}
									placeholder="Search by reference, month, user, application, or subscription"
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
						</div>

						<div className="space-y-4">
							{isLoadingPayments && (
								<GlassCard glowColor="cyan" className="text-center py-14">
									<p className="text-sm text-slate-300">Loading payments from the database...</p>
								</GlassCard>
							)}

							{!isLoadingPayments && loadError && (
								<GlassCard glowColor="red" className="text-center py-14">
									<p className="text-sm text-red-200">{loadError}</p>
								</GlassCard>
							)}

							{!isLoadingPayments && !loadError && filteredPayments.map(payment => {
								const status = STATUS_META[payment.status];
								const StatusIcon = status.icon;

								return (
									<GlassCard key={payment.id} glowColor="cyan" className="p-0 overflow-hidden" hover>
										<div className="p-5 space-y-4">
											<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
												<div className="space-y-3">
													<div className="flex flex-wrap items-center gap-2">
														<span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
															<StatusIcon size={14} />
															{status.label}
														</span>
														<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{payment.referenceNumber}</span>
													</div>

													<div className="min-w-0">
														<h3 className="text-xl font-semibold text-white">{payment.user?.name ?? 'Unknown user'}</h3>
														<p className="text-sm text-slate-400 break-words">{payment.billingMonth} · PHP {payment.amount.toLocaleString()}</p>
													</div>
												</div>

												<div className="flex gap-2">
													<button type="button" onClick={() => openViewModal(payment)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10">
														<EyeIcon size={15} />
														View
													</button>
													<button type="button" onClick={() => openReviewModal(payment)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/15">
														Review
														<ArrowRightIcon size={15} />
													</button>
												</div>
											</div>

											<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-sm min-w-0">
												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact</p>
													<p className="text-white flex items-start gap-2 min-w-0 break-words"><MailIcon size={14} className="text-cyan-300 mt-0.5 shrink-0" />{payment.user?.email ?? 'No email'}</p>
													<p className="text-slate-300 flex items-start gap-2 min-w-0 break-words"><PhoneIcon size={14} className="text-cyan-300 mt-0.5 shrink-0" />{formatPhoneNumber(payment.user?.phoneNumber)}</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Linked records</p>
													<p className="text-white flex items-start gap-2 min-w-0 break-words"><FileTextIcon size={14} className="text-cyan-300 mt-0.5 shrink-0" />{payment.application?.ticketNumber ?? 'No application'}</p>
													<p className="text-slate-300 break-words">{payment.subscription?.planName ?? 'No linked subscription'}</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Timeline</p>
													<p className="text-white flex items-center gap-2 min-w-0"><CalendarIcon size={14} className="text-cyan-300 shrink-0" />{formatDateLabel(payment.submittedAt)}</p>
													<p className="text-slate-300">{formatTimeAgo(payment.submittedAt)}</p>
												</div>

												<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Proof</p>
													<p className="text-white flex items-center gap-2 min-w-0"><FileTextIcon size={14} className="text-cyan-300 shrink-0" />{payment.proof?.name ?? 'No proof uploaded'}</p>
													<p className="text-slate-300 break-words">{payment.reviewedByName ? `Reviewed by ${payment.reviewedByName}` : 'Pending assignment'}</p>
												</div>
											</div>

											<div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between min-w-0">
												<div className="flex flex-wrap items-center gap-2 min-w-0">
													{payment.proof?.url ? (
														<a href={payment.proof.url} target="_blank" rel="noreferrer" className="max-w-full rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300 break-words">
															Open proof file
														</a>
													) : (
														<span className="max-w-full rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300 break-words">No proof uploaded</span>
													)}
												</div>

												<div className="text-sm text-slate-400 min-w-0 break-words">
													{payment.reviewNote ? (
														<span className="text-fuchsia-300">{payment.reviewNote}</span>
													) : (
														<span>Ready for payment verification.</span>
													)}
												</div>
											</div>
										</div>
									</GlassCard>
								);
							})}

							{!isLoadingPayments && !loadError && filteredPayments.length === 0 && (
								<GlassCard glowColor="cyan" className="text-center py-14">
									<p className="text-sm text-slate-300">No payments match your current filters.</p>
								</GlassCard>
							)}
						</div>
					</GlassCard>

					<GlassCard glowColor="cyan" className="space-y-4">
						<h2 className="text-xl font-semibold text-white">Review Notes</h2>
						<p className="text-sm text-slate-400">
							Payment decisions update the submission status and can activate linked subscriptions when verified.
						</p>
						<div className="space-y-3 text-sm text-slate-300">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Primary flow</p>
								<p className="mt-2 text-white">Open a payment, review the proof, then confirm the outcome with a note.</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Billing</p>
								<p className="mt-2 text-white">The page keeps the billing month and amount visible so review decisions stay grounded.</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Consistency</p>
								<p className="mt-2 text-white">Styling, spacing, and modal behavior follow the application and subscription screens.</p>
							</div>
						</div>
					</GlassCard>
				</motion.div>
			</motion.div>

			<ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} payment={selectedPayment} />
			<ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onSubmit={handleSubmitReview} payment={selectedPayment} />
			<ConfirmationModal
				isOpen={isConfirmationModalOpen}
				onClose={() => setIsConfirmationModalOpen(false)}
				onConfirm={handleConfirmReview}
				payment={selectedPayment}
				decision={pendingDecision}
				isSubmitting={isApplyingReview}
			/>
		</>
	);
}