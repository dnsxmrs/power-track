'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePricePerKilowattHour } from './utils';

export async function updateSettings(settingsId: string, formData: FormData): Promise<never> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });

	if (!session?.user) {
		redirect('/settings?error=Unauthorized');
	}

	const parsed = parsePricePerKilowattHour(formData);
	if (!parsed.ok) {
		redirect(`/settings?error=${encodeURIComponent(parsed.error)}`);
	}

	await prisma.settings.update({
		where: { id: settingsId },
		data: {
			pricePerKilowattHour: parsed.value,
		},
	});

	revalidatePath('/settings');
	redirect('/settings');
}
