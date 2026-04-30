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
	role: 'admin' | 'manager' | 'viewer';
	twoFactorEnabled: boolean;
}

const ROLE_TO_AUTH_ROLE: Record<CreateAccountInput['role'], 'admin' | 'user'> = {
	admin: 'admin',
	manager: 'user',
	viewer: 'user',
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

export async function createUserAccount(input: CreateAccountInput): Promise<{ userId: string }> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });

	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	const name = input.name.trim();
	const email = input.email.trim().toLowerCase();
	const phoneNumber = input.phoneNumber.trim();

	if (!name) {
		throw new Error('Name is required');
	}

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new Error('A valid email is required');
	}

	if (!phoneNumber) {
		throw new Error('Phone number is required');
	}

	const password = generateTemporaryPassword();
	const hashedPassword = await hashPassword(password);

	const created = await auth.api.createUser({
		headers: requestHeaders,
		body: {
			name,
			email,
			role: ROLE_TO_AUTH_ROLE[input.role],
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
