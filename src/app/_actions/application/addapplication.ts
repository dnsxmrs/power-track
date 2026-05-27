'use server';

import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromHeaders } from '@/lib/auth';
import { uploadFileToSupabase } from '@/lib/supabase-storage';

export type CreateApplicationResult = {
	applicationId: string;
	ticketNumber: string;
	submittedAt: string;
};

type BranchSnapshot = {
	name: string;
	city?: string;
	province?: string;
	address?: string;
	notes?: string;
};

type UploadResult = {
	fileName: string;
	url: string;
	mimeType: string;
};

function getTextValue(formData: FormData, key: string): string {
	const value = formData.get(key);
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim();
}

function getRequiredFile(formData: FormData, key: string): File {
	const value = formData.get(key);
	if (!(value instanceof File) || value.size === 0) {
		throw new Error(`${key} is required.`);
	}

	return value;
}

function slugifyBranchCode(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

async function uploadApplicationDocument(input: {
	folder: string;
	applicationId: string;
	file: File;
}): Promise<UploadResult> {
	const { objectKey, publicUrl } = await uploadFileToSupabase({
		folder: input.folder,
		entityId: input.applicationId,
		file: input.file,
	});

	return {
		fileName: objectKey.split('/').pop() || input.file.name,
		url: publicUrl,
		mimeType: input.file.type || 'application/octet-stream',
	};
}

export async function addApplication(formData: FormData): Promise<CreateApplicationResult> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);
	const database = prisma as typeof prisma & {
		subscriptionPlan: {
			findUnique: (args: any) => Promise<{ id: string; name: string; slug: string } | null>;
		};
		branch: {
			findFirst: (args: any) => Promise<{ id: string } | null>;
			create: (args: any) => Promise<{ id: string }>;
		};
		application: {
			create: (args: any) => Promise<unknown>;
		};
	};

	const fullName = getTextValue(formData, 'fullName');
	const email = getTextValue(formData, 'email');
	const phoneNumber = getTextValue(formData, 'phoneNumber');
	const planSlug = getTextValue(formData, 'planSlug');
	const branchInput = getTextValue(formData, 'branch');
	const city = getTextValue(formData, 'city');
	const rawBranches = getTextValue(formData, 'branches');
	const specialRequirements = getTextValue(formData, 'specialRequirements');
	const deviceCountValue = Number(getTextValue(formData, 'deviceCount'));

	// require either branches (JSON array) OR single branch + city
	const hasBranchesArray = Boolean(rawBranches);
	if (!fullName || !email || !phoneNumber || !planSlug || (!hasBranchesArray && (!branchInput || !city)) || !Number.isFinite(deviceCountValue) || deviceCountValue < 1) {
		throw new Error('Please complete all required application fields.');
	}

	const proofOfBillingFile = getRequiredFile(formData, 'proofOfBillingFile');
	const validIdFrontFile = getRequiredFile(formData, 'validIdFrontFile');
	const validIdBackFile = getRequiredFile(formData, 'validIdBackFile');

	const plan = await database.subscriptionPlan.findUnique({
		where: { slug: planSlug },
		select: { id: true, name: true, slug: true },
	});

	if (!plan) {
		throw new Error('Selected plan does not exist.');
	}

	const branch = await database.branch.findFirst({
		where: {
			OR: [{ name: branchInput }, { code: branchInput }],
		},
		select: { id: true },
	});

	let branchSnapshots: BranchSnapshot[] = [];

	// Support multiple branches creation: parse 'branches' JSON if provided
	let firstBranchId: string | null = branch?.id ?? null;
	if (rawBranches) {
		try {
			const parsed = JSON.parse(rawBranches) as BranchSnapshot[];
			if (Array.isArray(parsed) && parsed.length > 0) {
				branchSnapshots = parsed
					.map(branchEntry => ({
						name: branchEntry.name.trim(),
						city: branchEntry.city?.trim() || undefined,
						province: branchEntry.province?.trim() || undefined,
						address: branchEntry.address?.trim() || undefined,
						notes: branchEntry.notes?.trim() || undefined,
					}))
					.filter(branchEntry => branchEntry.name.length > 0);

				const branchIds: string[] = [];
				for (const b of branchSnapshots) {
					const branchName = b.name.trim();
					if (!branchName) {
						continue;
					}

					const existing = await database.branch.findFirst({ where: { OR: [{ name: b.name }, { code: b.name }] }, select: { id: true } });
					if (existing) {
						branchIds.push(existing.id);
					} else {
						const baseCode = slugifyBranchCode(branchName) || 'branch';
						const uniqueCode = `${baseCode}-${String(Date.now()).slice(-6)}`;
						const created = await database.branch.create({
							data: {
								name: branchName,
								code: uniqueCode,
								city: b.city ?? null,
								province: b.province ?? null,
								address: b.address ?? null,
								notes: b.notes ?? null,
							},
						});
						branchIds.push(created.id);
					}
				}
				firstBranchId = branchIds[0] ?? firstBranchId;
			}
		} catch (err) {
			// ignore parse errors and fallback to single branch behavior
		}
	}

	if (branchSnapshots.length === 0 && branchInput) {
		branchSnapshots = [
			{
				name: branchInput,
				city: city || undefined,
			},
		];
	}

	const applicationId = randomUUID();
	const ticketNumber = `APP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

	const [proofOfBilling, validIdFront, validIdBack] = await Promise.all([
		uploadApplicationDocument({ folder: 'applications/proof-of-billing', applicationId, file: proofOfBillingFile }),
		uploadApplicationDocument({ folder: 'applications/valid-ids/front', applicationId, file: validIdFrontFile }),
		uploadApplicationDocument({ folder: 'applications/valid-ids/back', applicationId, file: validIdBackFile }),
	]);

	await database.application.create({
		data: {
			id: applicationId,
			ticketNumber,
			fullName,
			email,
			phoneNumber,
			planId: plan.id,
			deviceCount: deviceCountValue,
			specialRequirements: specialRequirements || null,
			proofOfBillingFileName: proofOfBilling.fileName,
			proofOfBillingUrl: proofOfBilling.url,
			proofOfBillingMimeType: proofOfBilling.mimeType,
			validIdFrontFileName: validIdFront.fileName,
			validIdFrontUrl: validIdFront.url,
			validIdFrontMimeType: validIdFront.mimeType,
			validIdBackFileName: validIdBack.fileName,
			validIdBackUrl: validIdBack.url,
			validIdBackMimeType: validIdBack.mimeType,
			branchId: firstBranchId ?? null,
			branchSnapshots: branchSnapshots,
		},
	});

	revalidatePath('/applications');

	return {
		applicationId,
		ticketNumber,
		submittedAt: new Date().toISOString(),
	};
}
