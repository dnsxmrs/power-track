'use server';

import { randomBytes, randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { hashPassword } from 'better-auth/crypto';
import { auth, requireAdminFromHeaders } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { sendAccountEmail } from './email';
import { normalizeEmail, normalizePHPhoneNumber, validatePHPhoneNumber, validateUserEmail, validateUserName } from '../../lib/userAccountValidation';

export interface CreateAccountInput {
	name: string;
	email: string;
	phoneNumber: string;
	role: 'ADMIN' | 'SUPERADMIN' | 'CLIENT';
	twoFactorEnabled: boolean;
	applicationId?: string | null;
}

export type ReactivateCandidate = {
	id: string;
	name: string;
	email: string;
};

export type CreateUserAccountResult =
	| { status: 'created'; userId: string }
	| { status: 'reactivate_required'; user: ReactivateCandidate };

export interface UserManagementItem {
	id: string;
	name: string;
	email: string;
	phoneNumber: string;
	role: 'ADMIN' | 'SUPERADMIN' | 'CLIENT';
	twoFactorEnabled: boolean;
	emailVerified: boolean;
	banned: boolean;
	status: 'normal' | 'warning';
	joinedAt: string;
	lastActiveAt: string;
	joinedLabel: string;
	lastActiveLabel: string;
	clientSubscription?: {
		id: string;
		status: string;
		startedAt: string;
		nextDueDate: string | null;
		deviceCap: number;
		monthlyPrice: number;
		plan: {
			id: string;
			name: string;
			slug: string;
			monthlyPrice: number;
			deviceCap: number;
		};
		sourceApplication: {
			id: string;
			ticketNumber: string;
			status: string;
		} | null;
	} | null;
	clientApplication?: {
		id: string;
		ticketNumber: string;
		status: string;
		submittedAt: string;
		plan: {
			id: string;
			name: string;
			slug: string;
			monthlyPrice: number;
			deviceCap: number;
		};
		branch: {
			name: string;
			city: string;
			province: string;
			address: string;
			notes: string | null;
		} | null;
	} | null;
}

export type ApprovedClientApplicationCandidate = {
	id: string;
	ticketNumber: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	planId: string;
	planName: string;
	planSlug: string;
	planMonthlyPrice: number;
	planDeviceCap: number;
	branchName: string;
	branchCity: string;
	branchProvince: string;
	branchAddress: string;
	branchNotes: string | null;
	submittedAt: string;
};

function generateTemporaryPassword(length = 14): string {
	const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
	const bytes = randomBytes(length);
	let password = '';

	for (let index = 0; index < length; index += 1) {
		password += charset[bytes[index] % charset.length];
	}

	return password;
}

function normalizeRole(role: string | null | undefined): 'ADMIN' | 'SUPERADMIN' | 'CLIENT' {
	if (role === 'ADMIN' || role === 'admin') return 'ADMIN';
	if (role === 'SUPERADMIN' || role === 'superadmin') return 'SUPERADMIN';
	return 'CLIENT';
}

function getBranchSnapshot(application: any) {
	const snapshot = Array.isArray(application.branchSnapshots) ? application.branchSnapshots[0] : null;

	if (snapshot) {
		return {
			name: snapshot.name ?? application.branch?.name ?? '',
			city: snapshot.city ?? application.branch?.city ?? '',
			province: snapshot.province ?? application.branch?.province ?? '',
			address: snapshot.address ?? application.branch?.address ?? '',
			notes: snapshot.notes ?? application.branch?.notes ?? null,
		};
	}

	return application.branch
		? {
			name: application.branch.name ?? '',
			city: application.branch.city ?? '',
			province: application.branch.province ?? '',
			address: application.branch.address ?? '',
			notes: application.branch.notes ?? null,
		}
		: null;
}

function formatRelativeTime(date: Date): string {
	const elapsedMilliseconds = Date.now() - date.getTime();
	const elapsedSeconds = Math.max(0, Math.floor(elapsedMilliseconds / 1000));

	if (elapsedSeconds < 60) {
		return 'just now';
	}

	if (elapsedSeconds < 3600) {
		const minutes = Math.floor(elapsedSeconds / 60);
		return `${minutes} min ago`;
	}

	if (elapsedSeconds < 86_400) {
		const hours = Math.floor(elapsedSeconds / 3600);
		return `${hours} hour${hours === 1 ? '' : 's'} ago`;
	}

	if (elapsedSeconds < 604_800) {
		const days = Math.floor(elapsedSeconds / 86_400);
		return `${days} day${days === 1 ? '' : 's'} ago`;
	}

	const weeks = Math.floor(elapsedSeconds / 604_800);
	return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
}

function formatDateLabel(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
}

export async function fetchUsersForManagement(): Promise<UserManagementItem[]> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);

	const users = await prisma.user.findMany({
		where: {
			deletedAt: null,
		},
		select: {
			id: true,
			name: true,
			email: true,
			phoneNumber: true,
			role: true,
			twoFactorEnabled: true,
			emailVerified: true,
			banned: true,
			createdAt: true,
			updatedAt: true,
			clientApplications: {
				select: {
					id: true,
					ticketNumber: true,
					status: true,
					submittedAt: true,
					plan: {
						select: {
							id: true,
							name: true,
							slug: true,
							monthlyPrice: true,
							deviceCap: true,
						},
					},
					branch: {
						select: {
							name: true,
							city: true,
							province: true,
							address: true,
							notes: true,
						},
					},
				},
				take: 1,
			},
				clientSubscriptions: {
					select: {
						id: true,
						status: true,
						startedAt: true,
						nextDueDate: true,
						deviceCap: true,
						monthlyPrice: true,
						plan: {
							select: {
								id: true,
								name: true,
								slug: true,
								monthlyPrice: true,
								deviceCap: true,
							},
						},
						sourceApplication: {
							select: {
								id: true,
								ticketNumber: true,
								status: true,
							},
						},
					},
					take: 1,
				},
			sessions: {
				select: {
					createdAt: true,
					updatedAt: true,
				},
				orderBy: {
					updatedAt: 'desc',
				},
				take: 1,
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return users.map(user => {
		const latestSession = user.sessions[0];
		const lastActiveDate = latestSession?.updatedAt ?? latestSession?.createdAt ?? user.updatedAt;
		const joinedDate = user.createdAt;
		const clientApplication = user.clientApplications[0];
		const clientSubscription = user.clientSubscriptions[0];

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber || '',
			role: normalizeRole(user.role),
			twoFactorEnabled: Boolean(user.twoFactorEnabled),
			emailVerified: Boolean(user.emailVerified),
			banned: Boolean(user.banned),
			status: user.banned ? 'warning' : 'normal',
			joinedAt: joinedDate.toISOString(),
			lastActiveAt: lastActiveDate.toISOString(),
			joinedLabel: formatDateLabel(joinedDate),
			lastActiveLabel: formatRelativeTime(lastActiveDate),
			clientSubscription: clientSubscription
				? {
					id: clientSubscription.id,
					status: clientSubscription.status,
					startedAt: clientSubscription.startedAt.toISOString(),
					nextDueDate: clientSubscription.nextDueDate ? clientSubscription.nextDueDate.toISOString() : null,
					deviceCap: Number(clientSubscription.deviceCap),
					monthlyPrice: Number(clientSubscription.monthlyPrice),
					plan: {
						id: clientSubscription.plan.id,
						name: clientSubscription.plan.name,
						slug: clientSubscription.plan.slug,
						monthlyPrice: Number(clientSubscription.plan.monthlyPrice),
						deviceCap: Number(clientSubscription.plan.deviceCap),
					},
					sourceApplication: clientSubscription.sourceApplication
						? {
							id: clientSubscription.sourceApplication.id,
							ticketNumber: clientSubscription.sourceApplication.ticketNumber,
							status: clientSubscription.sourceApplication.status,
						}
						: null,
				}
				: null,
			clientApplication: clientApplication
				? {
					id: clientApplication.id,
					ticketNumber: clientApplication.ticketNumber,
					status: clientApplication.status,
					submittedAt: clientApplication.submittedAt.toISOString(),
					plan: {
						id: clientApplication.plan.id,
						name: clientApplication.plan.name,
						slug: clientApplication.plan.slug,
						monthlyPrice: Number(clientApplication.plan.monthlyPrice),
						deviceCap: Number(clientApplication.plan.deviceCap),
					},
					branch: getBranchSnapshot(clientApplication),
				}
				: null,
		};
	});
}

export async function fetchApprovedApplicationsForClientCreation(): Promise<ApprovedClientApplicationCandidate[]> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);

	const applications = await prisma.application.findMany({
		where: { status: 'APPROVED', clientUserId: null },
		select: {
			id: true,
			ticketNumber: true,
			fullName: true,
			email: true,
			phoneNumber: true,
			submittedAt: true,
			plan: {
				select: {
					id: true,
					name: true,
					slug: true,
					monthlyPrice: true,
					deviceCap: true,
				},
			},
			branch: {
				select: {
					name: true,
					city: true,
					province: true,
					address: true,
					notes: true,
				},
			},
		},
		orderBy: { submittedAt: 'desc' },
	});

	return applications.map(application => {
		const branch = getBranchSnapshot(application) ?? { name: '', city: '', province: '', address: '', notes: null };

		return {
			id: application.id,
			ticketNumber: application.ticketNumber,
			fullName: application.fullName,
			email: application.email,
			phoneNumber: application.phoneNumber,
			planId: application.plan.id,
			planName: application.plan.name,
			planSlug: application.plan.slug,
			planMonthlyPrice: Number(application.plan.monthlyPrice),
			planDeviceCap: Number(application.plan.deviceCap),
			branchName: branch.name,
			branchCity: branch.city,
			branchProvince: branch.province,
			branchAddress: branch.address,
			branchNotes: branch.notes,
			submittedAt: application.submittedAt.toISOString(),
		};
	});
}

function validateAndNormalizeCreateInput(input: CreateAccountInput): { name: string; email: string; phoneNumber: string } {
	const name = input.name.trim();
	const email = normalizeEmail(input.email);

	const nameValidation = validateUserName(name);
	if (!nameValidation.valid) {
		throw new Error(nameValidation.error ?? 'Invalid name');
	}

	const emailValidation = validateUserEmail(email);
	if (!emailValidation.valid) {
		throw new Error(emailValidation.error ?? 'Invalid email');
	}

	const phoneValidation = validatePHPhoneNumber(input.phoneNumber);
	if (!phoneValidation.valid) {
		throw new Error(phoneValidation.error ?? 'Invalid phone number');
	}

	const phoneNumber = normalizePHPhoneNumber(input.phoneNumber);

	return { name, email, phoneNumber };
}

export async function createUserAccount(input: CreateAccountInput): Promise<CreateUserAccountResult> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);

	const { name, email, phoneNumber } = validateAndNormalizeCreateInput(input);
	if (input.role === 'CLIENT' && !input.applicationId) {
		throw new Error('Select an approved application for the client account.');
	}
	let approvedApplication: ApprovedClientApplicationCandidate | null = null;

	if (input.role === 'CLIENT') {
		if (!input.applicationId) {
			throw new Error('Select an approved application for the client account.');
		}

		const application = await prisma.application.findFirst({
			where: {
				id: input.applicationId,
				status: 'APPROVED',
				clientUserId: null,
			},
			select: {
				id: true,
				ticketNumber: true,
				fullName: true,
				email: true,
				phoneNumber: true,
				submittedAt: true,
				plan: {
					select: {
						id: true,
						name: true,
						slug: true,
						monthlyPrice: true,
						deviceCap: true,
					},
				},
				branch: {
					select: {
						name: true,
						city: true,
						province: true,
						address: true,
						notes: true,
					},
				},
			},
		});

		if (!application) {
			throw new Error('Selected application is no longer available.');
		}

		const branch = getBranchSnapshot(application);
		approvedApplication = {
			id: application.id,
			ticketNumber: application.ticketNumber,
			fullName: application.fullName,
			email: application.email,
			phoneNumber: application.phoneNumber,
			planId: application.plan.id,
			planName: application.plan.name,
			planSlug: application.plan.slug,
			planMonthlyPrice: Number(application.plan.monthlyPrice),
			planDeviceCap: Number(application.plan.deviceCap),
			branchName: branch?.name ?? '',
			branchCity: branch?.city ?? '',
			branchProvince: branch?.province ?? '',
			branchAddress: branch?.address ?? '',
			branchNotes: branch?.notes ?? null,
			submittedAt: application.submittedAt.toISOString(),
		};
	}

	const password = generateTemporaryPassword();
	const hashedPassword = await hashPassword(password);

	// If a user with this email exists but is soft-deleted, return a structured signal.
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing && existing.deletedAt) {
		return {
			status: 'reactivate_required',
			user: { id: existing.id, name: existing.name, email: existing.email },
		};
	}

		const created = await auth.api.createUser({
		headers: requestHeaders,
		body: {
			name,
			email,
			role: input.role,
			data: {
				phoneNumber,
				twoFactorEnabled: input.twoFactorEnabled,
			},
		},
	});

	// Explicitly update user with phoneNumber and twoFactorEnabled
	await prisma.user.update({
		where: { id: created.user.id },
		data: {
			phoneNumber,
			twoFactorEnabled: input.twoFactorEnabled,
		},
	});

	if (input.role === 'CLIENT' && approvedApplication) {
		const startedAt = new Date();

		// Default grace period: set the first billing due date to the 20th, two months from the start date.
		const nextDueDate = (() => {
			const d = new Date(startedAt);
			// Advance two months
			d.setMonth(d.getMonth() + 2);
			// Set to 20th of that month
			d.setDate(20);
			// Normalize time to start of day
			d.setHours(0, 0, 0, 0);
			return d;
		})();

		await prisma.$transaction([
			prisma.clientSubscription.create({
				data: {
					id: randomUUID(),
					userId: created.user.id,
					planId: approvedApplication.planId,
					sourceApplicationId: approvedApplication.id,
					deviceCap: approvedApplication.planDeviceCap,
					monthlyPrice: approvedApplication.planMonthlyPrice,
					status: 'active',
					startedAt,
					billingCycleDay: 20,
					nextDueDate,
				},
			}),
			prisma.application.update({
				where: { id: approvedApplication.id },
				data: { clientUserId: created.user.id },
			}),
		]);
	}

	await prisma.account.create({
		data: {
			id: randomUUID(),
			accountId: created.user.id,
			providerId: 'credential',
			userId: created.user.id,
			password: hashedPassword,
		},
	});

	await sendAccountEmail(email, name, email, password);

	return { status: 'created', userId: created.user.id };
}

export async function reactivateUserAccount(userId: string, input: CreateAccountInput): Promise<{ userId: string; tempPassword: string }> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);

	const { name, email, phoneNumber } = validateAndNormalizeCreateInput(input);

	// Restore user record and update fields
	await prisma.user.update({
		where: { id: userId },
		data: {
			name,
			email,
			phoneNumber,
			role: input.role,
			twoFactorEnabled: input.twoFactorEnabled,
			deletedAt: null,
		},
	});

	// Generate a new temporary password and persist it to the credentials account
	const tempPassword = generateTemporaryPassword();
	const hashedPassword = await hashPassword(tempPassword);

	const existingAccount = await prisma.account.findFirst({ where: { userId, providerId: 'credential' } });
	if (existingAccount) {
		await prisma.account.update({ where: { id: existingAccount.id }, data: { password: hashedPassword } });
	} else {
		await prisma.account.create({
			data: {
				id: randomUUID(),
				accountId: userId,
				providerId: 'credential',
				userId,
				password: hashedPassword,
			},
		});
	}

	// Send new credentials email
	await sendAccountEmail(email, name, email, tempPassword);

	return { userId, tempPassword };
}

export interface UpdateAccountInput {
	name: string;
	phoneNumber: string;
	role: 'ADMIN' | 'SUPERADMIN' | 'CLIENT';
	twoFactorEnabled: boolean;
}

export async function updateUserAccount(userId: string, updates: UpdateAccountInput): Promise<{ success: boolean }> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);

	const name = updates.name.trim();
	const phoneNumber = normalizePHPhoneNumber(updates.phoneNumber);

	const nameValidation = validateUserName(name);
	if (!nameValidation.valid) {
		throw new Error(nameValidation.error ?? 'Invalid name');
	}
	const phoneValidation = validatePHPhoneNumber(updates.phoneNumber);
	if (!phoneValidation.valid) {
		throw new Error(phoneValidation.error ?? 'Invalid phone number');
	}

	// Update user in database
	await prisma.user.update({
		where: { id: userId },
		data: {
			name,
			phoneNumber,
			role: updates.role,
			twoFactorEnabled: updates.twoFactorEnabled,
		},
	});

	return { success: true };
}

export async function deleteUserAccount(userId: string): Promise<{ success: boolean }> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });

	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	const result = await prisma.user.updateMany({
		where: {
			id: userId,
			deletedAt: null,
		},
		data: {
			deletedAt: new Date(),
		},
	});

	if (result.count === 0) {
		throw new Error('User not found or already deleted');
	}

	return { success: true };
}
