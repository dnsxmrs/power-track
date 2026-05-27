'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromHeaders } from '@/lib/auth';
import type { ApplicationStatus } from '@/generated/prisma/enums';

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

	revalidatePath('/applications');
}