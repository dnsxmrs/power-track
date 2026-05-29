'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireAdminFromHeaders } from '@/lib/auth';

export type SubscriptionManagementItem = {
	id: string;
	status: 'active' | 'under_review' | 'suspended' | 'cancelled';
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

function normalizeStatus(value: string | null | undefined): SubscriptionManagementItem['status'] {
	switch ((value ?? '').toUpperCase()) {
		case 'ACTIVE':
			return 'active';
		case 'UNDER_REVIEW':
			return 'under_review';
		case 'SUSPENDED':
			return 'suspended';
		case 'CANCELLED':
			return 'cancelled';
		default:
			return 'active';
	}
}

function getStatusLabel(status: SubscriptionManagementItem['status']): string {
	switch (status) {
		case 'active':
			return 'Active';
		case 'under_review':
			return 'Under Review';
		case 'suspended':
			return 'Suspended';
		case 'cancelled':
			return 'Cancelled';
	}
}

export async function fetchSubscriptionsForManagement(): Promise<SubscriptionManagementItem[]> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);

	const database = prisma as any;
	const subscriptions = await database.clientSubscription.findMany({
		orderBy: [{ startedAt: 'desc' }, { updatedAt: 'desc' }],
		include: {
			plan: true,
			user: true,
			sourceApplication: true,
			_count: {
				select: {
					devices: true,
					paymentSubmissions: true,
				},
			},
		},
	});

	const subscriptionIds = subscriptions.map((subscription: any) => subscription.id);
	const reviewLogs = subscriptionIds.length
		? await database.auditLog.findMany({
			where: {
				entityType: 'CLIENT_SUBSCRIPTION',
				entityId: { in: subscriptionIds },
				action: 'subscription.review',
			},
			orderBy: [{ createdAt: 'desc' }],
			include: {
				actor: true,
			},
		})
		: [];

	const latestReviewBySubscription = new Map<string, any>();
	for (const log of reviewLogs) {
		if (!latestReviewBySubscription.has(log.entityId)) {
			latestReviewBySubscription.set(log.entityId, log);
		}
	}

	return subscriptions.map((subscription: any) => {
		const reviewLog = latestReviewBySubscription.get(subscription.id);
		const reviewMetadata = reviewLog?.metadata && typeof reviewLog.metadata === 'object' ? reviewLog.metadata : null;

		return {
			id: subscription.id,
			status: normalizeStatus(subscription.status),
			statusLabel: getStatusLabel(normalizeStatus(subscription.status)),
			userName: subscription.user?.name ?? 'Unknown user',
			userEmail: subscription.user?.email ?? '',
			phoneNumber: subscription.user?.phoneNumber ?? '',
			planName: subscription.plan?.name ?? 'Unknown plan',
			planSlug: subscription.plan?.slug ?? '',
			planMonthlyPrice: Number(subscription.plan?.monthlyPrice ?? 0),
			planDeviceCap: Number(subscription.plan?.deviceCap ?? 0),
			startedAt: subscription.startedAt.toISOString(),
			nextDueDate: subscription.nextDueDate ? subscription.nextDueDate.toISOString() : null,
			billingCycleDay: subscription.billingCycleDay ?? null,
			updatedAt: subscription.updatedAt.toISOString(),
			deviceCount: Number(subscription._count?.devices ?? 0),
			paymentCount: Number(subscription._count?.paymentSubmissions ?? 0),
			sourceApplication: subscription.sourceApplication
				? {
					id: subscription.sourceApplication.id,
					ticketNumber: subscription.sourceApplication.ticketNumber,
					status: subscription.sourceApplication.status,
				}
				: null,
			reviewNote: typeof reviewMetadata?.note === 'string' ? reviewMetadata.note : null,
			reviewedAt: reviewLog?.createdAt ? reviewLog.createdAt.toISOString() : null,
			reviewedByName: reviewLog?.actor ? reviewLog.actor.name ?? reviewLog.actor.email ?? null : null,
			reviewedByEmail: reviewLog?.actor?.email ?? null,
		};
	});
}
