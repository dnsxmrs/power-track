'use server';

import { randomBytes, randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { hashPassword } from 'better-auth/crypto';
import { auth } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { sendAccountEmail } from './email';

export interface CreateAccountInput {
	name: string;
	email: string;
	phoneNumber: string;
	role: 'admin' | 'user';
	twoFactorEnabled: boolean;
}

export interface UserManagementItem {
	id: string;
	name: string;
	email: string;
	phoneNumber: string;
	role: 'admin' | 'user';
	twoFactorEnabled: boolean;
	emailVerified: boolean;
	banned: boolean;
	status: 'normal' | 'warning';
	joinedAt: string;
	lastActiveAt: string;
	joinedLabel: string;
	lastActiveLabel: string;
}

function generateTemporaryPassword(length = 14): string {
	const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
	const bytes = randomBytes(length);
	let password = '';

	for (let index = 0; index < length; index += 1) {
		password += charset[bytes[index] % charset.length];
	}

	return password;
}

function normalizeRole(role: string | null | undefined): 'admin' | 'user' {
	return role === 'admin' ? 'admin' : 'user';
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
	const session = await auth.api.getSession({ headers: requestHeaders });

	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	const users = await prisma.user.findMany({
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

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber || '+63',
			role: normalizeRole(user.role),
			twoFactorEnabled: Boolean(user.twoFactorEnabled),
			emailVerified: Boolean(user.emailVerified),
			banned: Boolean(user.banned),
			status: user.banned ? 'warning' : 'normal',
			joinedAt: joinedDate.toISOString(),
			lastActiveAt: lastActiveDate.toISOString(),
			joinedLabel: formatDateLabel(joinedDate),
			lastActiveLabel: formatRelativeTime(lastActiveDate),
		};
	});
}

export async function createUserAccount(input: CreateAccountInput): Promise<{ userId: string }> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });

	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	const name = input.name.trim();
	const email = input.email.trim().toLowerCase();
	const phoneNumber = input.phoneNumber.trim();

	// Validate name: 2-50 chars, letters/spaces/hyphens/apostrophes only
	if (!name) {
		throw new Error('Name is required');
	}
	if (name.length < 2) {
		throw new Error('Name must be at least 2 characters');
	}
	if (name.length > 50) {
		throw new Error('Name must not exceed 50 characters');
	}
	if (!/^[a-zA-Z\s\-']+$/.test(name)) {
		throw new Error('Name can only contain letters, spaces, hyphens, and apostrophes');
	}

	// Validate email: valid format, no spaces, max 100 chars
	if (!email) {
		throw new Error('Email is required');
	}
	if (email.length > 100) {
		throw new Error('Email must not exceed 100 characters');
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new Error('A valid email is required (e.g. user@company.com)');
	}
	if (email.includes(' ')) {
		throw new Error('Email cannot contain spaces');
	}

	// Validate phone: basic check for +63 prefix
	if (!phoneNumber) {
		throw new Error('Phone number is required');
	}
	if (!phoneNumber.startsWith('+63')) {
		throw new Error('Phone number must start with +63');
	}

	const password = generateTemporaryPassword();
	const hashedPassword = await hashPassword(password);

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

	return { userId: created.user.id };
}
