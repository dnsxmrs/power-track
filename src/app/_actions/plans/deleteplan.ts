'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { requireAdminFromHeaders } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function deletePlan(planId: string) {
	const requestHeaders = await headers();
	try {
		await requireAdminFromHeaders(requestHeaders);
	} catch (err) {
		throw new Error('Unauthorized');
	}

	const database = prisma as any;

	// Do a soft-disable rather than hard delete since apps reference plans (onDelete: Restrict)
	await database.subscriptionPlan.update({ where: { id: planId }, data: { isActive: false } });

	revalidatePath('/plans');
}
