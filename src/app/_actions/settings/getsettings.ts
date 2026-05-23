import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type SettingsRecord = {
	id: string;
	pricePerKilowattHour: number;
	createdAt: Date;
	updatedAt: Date;
};

export async function getSettings(): Promise<SettingsRecord | null> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });

	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	return prisma.settings.findFirst({
		orderBy: { createdAt: 'desc' },
	});
}
