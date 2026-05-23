'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function parsePricePerKilowattHour(formData: FormData): number {
	const rawValue = formData.get('pricePerKilowattHour');
	const value = typeof rawValue === 'string' ? Number(rawValue) : Number.NaN;

	if (!Number.isFinite(value) || value <= 0) {
		throw new Error('Enter a valid price per kilowatt-hour greater than zero.');
	}

	return value;
}

export async function createSettings(formData: FormData): Promise<never> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });

	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	const existingSettings = await prisma.settings.findFirst({
		select: { id: true },
	});

	if (existingSettings) {
		throw new Error('Settings already exist. Use the edit form instead.');
	}

	const pricePerKilowattHour = parsePricePerKilowattHour(formData);

	await prisma.settings.create({
		data: {
			pricePerKilowattHour,
		},
	});

	revalidatePath('/settings');
	redirect('/settings');
}
