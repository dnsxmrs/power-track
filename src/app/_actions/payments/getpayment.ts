'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireAdminFromHeaders } from '@/lib/auth';

export type PaymentManagementItem = {
	id: string;
	referenceNumber: string;
	billingMonth: string;
	amount: number;
	status: 'pending_verification' | 'verified' | 'rejected';
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

function normalizeStatus(value: string | null | undefined): PaymentManagementItem['status'] {
	switch ((value ?? '').toUpperCase()) {
		case 'PENDING_VERIFICATION':
			return 'pending_verification';
		case 'VERIFIED':
			return 'verified';
		case 'REJECTED':
			return 'rejected';
		default:
			return 'pending_verification';
	}
}

function getStatusLabel(status: PaymentManagementItem['status']): string {
	switch (status) {
		case 'pending_verification':
			return 'Pending verification';
		case 'verified':
			return 'Verified';
		case 'rejected':
			return 'Rejected';
	}
}

export async function fetchPaymentsForManagement(): Promise<PaymentManagementItem[]> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);

	const database = prisma as any;
	const payments = await database.paymentSubmission.findMany({
		orderBy: [{ submittedAt: 'desc' }, { updatedAt: 'desc' }],
		include: {
			user: true,
			subscription: {
				include: {
					plan: true,
				},
			},
			application: true,
			reviewedBy: true,
		},
	});

	return payments.map((payment: any) => ({
		id: payment.id,
		referenceNumber: payment.referenceNumber,
		billingMonth: payment.billingMonth,
		amount: Number(payment.amount ?? 0),
		status: normalizeStatus(payment.status),
		statusLabel: getStatusLabel(normalizeStatus(payment.status)),
		submittedAt: payment.submittedAt.toISOString(),
		reviewedAt: payment.reviewedAt ? payment.reviewedAt.toISOString() : null,
		reviewNote: payment.reviewNote ?? null,
		reviewedByName: payment.reviewedBy ? payment.reviewedBy.name ?? payment.reviewedBy.email ?? null : null,
		reviewedByEmail: payment.reviewedBy?.email ?? null,
		proof: payment.proofFileName || payment.proofFileUrl
			? {
				name: payment.proofFileName || 'Proof of payment',
				url: payment.proofFileUrl ?? null,
				mimeType: payment.proofMimeType ?? null,
			}
			: null,
		user: payment.user
			? {
				id: payment.user.id,
				name: payment.user.name,
				email: payment.user.email,
				phoneNumber: payment.user.phoneNumber ?? null,
			}
			: null,
		subscription: payment.subscription
			? {
				id: payment.subscription.id,
				status: payment.subscription.status,
				planName: payment.subscription.plan?.name ?? 'Unknown plan',
				planSlug: payment.subscription.plan?.slug ?? '',
			}
			: null,
		application: payment.application
			? {
				id: payment.application.id,
				ticketNumber: payment.application.ticketNumber,
				status: payment.application.status,
			}
			: null,
	}));
}
