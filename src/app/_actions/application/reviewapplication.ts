'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromHeaders } from '@/lib/auth';
import type { ApplicationStatus } from '@/generated/prisma/enums';
import { sendApplicationAwaitingDownpaymentEmail, sendApplicationApprovedEmail, sendApplicationRejectedEmail } from './email';

export type ReviewApplicationInput = {
	applicationId: string;
	status: 'approved' | 'rejected' | 'awaiting_downpayment' | 'under_review';
	note: string;
};

export async function reviewApplication(input: ReviewApplicationInput): Promise<void> {
	const requestHeaders = await headers();
	const session = await requireAdminFromHeaders(requestHeaders);

	const statusMap: Record<ReviewApplicationInput['status'], ApplicationStatus> = {
		approved: 'APPROVED',
		rejected: 'REJECTED',
		awaiting_downpayment: 'AWAITING_DOWNPAYMENT',
		under_review: 'UNDER_REVIEW',
	};

	const now = new Date();
	await prisma.application.update({
		where: { id: input.applicationId },
		data: {
			status: statusMap[input.status],
			statusReason: input.note.trim() || null,
			reviewedAt: now,
			reviewedById: session.user.id,
			approvedAt: input.status === 'approved' ? now : null,
			rejectedAt: input.status === 'rejected' ? now : null,
		},
	});

	// If application moved to awaiting downpayment, send payment instructions
	if (input.status === 'awaiting_downpayment') {
		try {
			// fetch application to get contact email and full name
			const app = await prisma.application.findUnique({ where: { id: input.applicationId }, select: { email: true, fullName: true, ticketNumber: true } });
			if (app?.email) {
				await sendApplicationAwaitingDownpaymentEmail(app.email, app.fullName, app.ticketNumber);
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Failed to send awaiting downpayment email', err);
		}
	}

	// If application approved, compute installation date (>=7 days, push weekend to Monday) and email schedule
	if (input.status === 'approved') {
		try {
			const app = await prisma.application.findUnique({ where: { id: input.applicationId }, select: { email: true, fullName: true, ticketNumber: true } });
			if (app?.email) {
				const now = new Date();
				// base date is 7 days from now
				const installDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
				const day = installDate.getDay(); // 0 = Sun, 6 = Sat
				if (day === 6) {
					// Saturday -> add 2 days to Monday
					installDate.setDate(installDate.getDate() + 2);
				} else if (day === 0) {
					// Sunday -> add 1 day to Monday
					installDate.setDate(installDate.getDate() + 1);
				}
				// normalize to start of day
				installDate.setHours(0, 0, 0, 0);
				await sendApplicationApprovedEmail(app.email, app.fullName, app.ticketNumber, installDate);
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Failed to send approved/installation email', err);
		}
	}

	// If application rejected, send rejection email including notes
	if (input.status === 'rejected') {
		try {
			const app = await prisma.application.findUnique({ where: { id: input.applicationId }, select: { email: true, fullName: true, ticketNumber: true } });
			if (app?.email) {
				await sendApplicationRejectedEmail(app.email, app.fullName, app.ticketNumber, input.note?.trim() || undefined);
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Failed to send rejection email', err);
		}
	}

	revalidatePath('/applications');
}