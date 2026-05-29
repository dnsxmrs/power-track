'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromHeaders } from '@/lib/auth';

export type ReviewPaymentInput = {
	paymentId: string;
	status: 'pending_verification' | 'verified' | 'rejected';
	note: string;
};

function toDbStatus(status: ReviewPaymentInput['status']): 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' {
	switch (status) {
		case 'pending_verification':
			return 'PENDING_VERIFICATION';
		case 'verified':
			return 'VERIFIED';
		case 'rejected':
			return 'REJECTED';
	}
}

export async function reviewPayment(input: ReviewPaymentInput): Promise<void> {
	const requestHeaders = await headers();
	const session = await requireAdminFromHeaders(requestHeaders);
	const database = prisma as any;

	const existing = await database.paymentSubmission.findUnique({
		where: { id: input.paymentId },
		select: { id: true, status: true, subscriptionId: true },
	});

	if (!existing) {
		throw new Error('Payment not found.');
	}

	const now = new Date();
	await database.paymentSubmission.update({
		where: { id: input.paymentId },
		data: {
			status: toDbStatus(input.status),
			reviewNote: input.note.trim() || null,
			reviewedAt: now,
			reviewedById: session.user.id,
		},
	});

	if (input.status === 'verified' && existing.subscriptionId) {
		await database.clientSubscription.update({
			where: { id: existing.subscriptionId },
			data: { status: 'active' },
		});
	}

	revalidatePath('/payments');
}
