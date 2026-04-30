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

function generateTemporaryPassword(length = 14): string {
	const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
	const bytes = randomBytes(length);
	let password = '';

	for (let index = 0; index < length; index += 1) {
		password += charset[bytes[index] % charset.length];
	}

	return password;
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

	// Validate phone: +63 prefix + exactly 10 digits, starts with 9
	if (!phoneNumber) {
		throw new Error('Phone number is required');
	}
	const phoneDigits = phoneNumber.replace(/\D/g, '');
	if (phoneDigits.length !== 10) {
		throw new Error('Phone number must be exactly 10 digits');
	}
	if (!phoneNumber.startsWith('+63')) {
		throw new Error('Phone number must start with +63');
	}
	if (!phoneDigits.startsWith('9')) {
		throw new Error('Philippine mobile numbers start with 9');
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
