'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth, requireAdminFromHeaders } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePricePerKilowattHour } from './utils';

export async function createSettings(formData: FormData): Promise<never> {
	const requestHeaders = await headers();
	try {
		await requireAdminFromHeaders(requestHeaders);
	} catch (err) {
		redirect('/settings?error=Unauthorized');
	}

	const existingSettings = await prisma.settings.findFirst({
		select: { id: true },
	});

	if (existingSettings) {
		redirect('/settings?error=Settings%20already%20exist.%20Use%20the%20edit%20form%20instead.');
	}

	const parsed = parsePricePerKilowattHour(formData);
	if (!parsed.ok) {
		redirect(`/settings?error=${encodeURIComponent(parsed.error)}`);
	}

	await prisma.settings.create({
		data: {
			pricePerKilowattHour: parsed.value,
		},
	});

	revalidatePath('/settings');
	redirect('/settings');
}
