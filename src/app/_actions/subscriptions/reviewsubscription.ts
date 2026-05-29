'use server';

import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromHeaders } from '@/lib/auth';
import { sendSubscriptionStatusEmail } from './email';

export type ReviewSubscriptionInput = {
	subscriptionId: string;
	status: 'active' | 'under_review' | 'suspended' | 'cancelled';
	note: string;
};

export async function reviewSubscription(input: ReviewSubscriptionInput): Promise<void> {
	const requestHeaders = await headers();
	const session = await requireAdminFromHeaders(requestHeaders);

	const database = prisma as any;
	const existing = await database.clientSubscription.findUnique({
		where: { id: input.subscriptionId },
		select: { id: true, status: true, user: { select: { id: true, email: true, name: true } } },
	});

	if (!existing) {
		throw new Error('Subscription not found.');
	}

	const now = new Date();
	await database.clientSubscription.update({
		where: { id: input.subscriptionId },
		data: {
			status: input.status,
		},
	});

	await database.auditLog.create({
		data: {
			id: randomUUID(),
			actorId: session.user.id,
			entityType: 'CLIENT_SUBSCRIPTION',
			entityId: input.subscriptionId,
			action: 'subscription.review',
			beforeState: { status: existing.status },
			afterState: { status: input.status },
			metadata: {
				note: input.note.trim() || null,
				reviewedAt: now.toISOString(),
			},
		},
	});

	// send email notification to subscription owner when possible
	try {
		const user = existing.user;
		if (user?.email) {
			// don't await to keep response snappy
			sendSubscriptionStatusEmail(user.email, user.name ?? undefined, input.subscriptionId, input.status, input.note).catch((err) => {
				// eslint-disable-next-line no-console
				console.error('Failed to send subscription status email', err);
			});
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Error while attempting to send subscription email', err);
	}

	revalidatePath('/subscriptions');
}
