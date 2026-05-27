import { headers } from 'next/headers';
import { auth, requireAdminFromHeaders } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type SettingsRecord = {
	id: string;
	pricePerKilowattHour: number;
	createdAt: Date;
	updatedAt: Date;
};

export async function getSettings(): Promise<SettingsRecord | null> {
	const requestHeaders = await headers();
	await requireAdminFromHeaders(requestHeaders);

	return prisma.settings.findFirst({
		orderBy: { createdAt: 'desc' },
	});
}
