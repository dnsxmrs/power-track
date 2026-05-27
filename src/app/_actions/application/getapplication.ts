'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireAdminFromHeaders } from '@/lib/auth';

export type ApplicationManagementDocument = {
	name: string;
	url: string | null;
	mimeType: string | null;
};

export type ApplicationManagementItem = {
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
	status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'awaiting_downpayment' | 'active';
	statusLabel: string;
	statusReason: string | null;
	reviewedByName: string | null;
	reviewedAt: string | null;
	submittedAt: string;
	updatedAt: string;
	documents: ApplicationManagementDocument[];
	specialRequirements: string | null;
};

function normalizeStatus(value: string): ApplicationManagementItem['status'] {
	switch (value.toUpperCase()) {
		case 'SUBMITTED':
			return 'submitted';
		case 'UNDER_REVIEW':
			return 'under_review';
		case 'APPROVED':
			return 'approved';
		case 'REJECTED':
			return 'rejected';
		case 'AWAITING_DOWNPAYMENT':
			return 'awaiting_downpayment';
		case 'ACTIVE':
			return 'active';
		default:
			return 'submitted';
	}
}

function getStatusLabel(status: ApplicationManagementItem['status']): string {
	switch (status) {
		case 'submitted':
			return 'Submitted';
		case 'under_review':
			return 'Under Review';
		case 'approved':
			return 'Approved';
		case 'rejected':
			return 'Rejected';
		case 'awaiting_downpayment':
			return 'Awaiting Downpayment';
		case 'active':
			return 'Active';
	}
}

export async function fetchApplicationsForManagement(): Promise<ApplicationManagementItem[]> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);

	const database = prisma as any;
	const applications = await database.application.findMany({
		orderBy: [{ submittedAt: 'desc' }, { updatedAt: 'desc' }],
		include: {
			plan: true,
			branch: true,
			reviewedBy: true,
		},
	});

	return applications.map((application: any) => ({
		id: application.id,
		ticketNumber: application.ticketNumber,
		fullName: application.fullName,
		email: application.email,
		phoneNumber: application.phoneNumber,
		planName: application.plan?.name ?? 'Unknown plan',
		planSlug: application.plan?.slug ?? '',
		planMonthlyPrice: Number(application.plan?.monthlyPrice ?? 0),
		planDeviceCap: Number(application.plan?.deviceCap ?? 0),
		deviceCount: Number(application.deviceCount ?? 0),
		branchName: application.branch?.name ?? '',
		branchCity: application.branch?.city ?? '',
		branchProvince: application.branch?.province ?? '',
		branchAddress: application.branch?.address ?? '',
		branchNotes: application.branch?.notes ?? null,
		branchCode: application.branch?.code ?? '',
		branches: Array.isArray(application.branchSnapshots) ? application.branchSnapshots : application.branch ? [{
			name: application.branch.name ?? '',
			city: application.branch.city ?? '',
			province: application.branch.province ?? '',
			address: application.branch.address ?? '',
			notes: application.branch.notes ?? '',
		}] : [],
		status: normalizeStatus(application.status),
		statusLabel: getStatusLabel(normalizeStatus(application.status)),
		statusReason: application.statusReason ?? null,
		reviewedByName: application.reviewedBy ? application.reviewedBy.name ?? application.reviewedBy.email ?? null : null,
		reviewedAt: application.reviewedAt ? application.reviewedAt.toISOString() : null,
		submittedAt: application.submittedAt.toISOString(),
		updatedAt: application.updatedAt.toISOString(),
		documents: [
			application.proofOfBillingFileName || application.proofOfBillingUrl
				? { name: application.proofOfBillingFileName || 'Proof of Billing', url: application.proofOfBillingUrl ?? null, mimeType: application.proofOfBillingMimeType ?? null }
				: null,
			application.validIdFrontFileName || application.validIdFrontUrl
				? { name: application.validIdFrontFileName || 'Valid ID Front', url: application.validIdFrontUrl ?? null, mimeType: application.validIdFrontMimeType ?? null }
				: null,
			application.validIdBackFileName || application.validIdBackUrl
				? { name: application.validIdBackFileName || 'Valid ID Back', url: application.validIdBackUrl ?? null, mimeType: application.validIdBackMimeType ?? null }
				: null,
		].filter(Boolean),
		specialRequirements: application.specialRequirements ?? null,
	}));
}