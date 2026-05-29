'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth, requireAdminFromHeaders } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePricePerKilowattHour } from './utils';
import { parseOptionalString, parseIntegerField, parseBooleanField } from './utils';

export async function updateSettings(settingsId: string, formData: FormData): Promise<never> {
	const requestHeaders = await headers();
	try {
		await requireAdminFromHeaders(requestHeaders);
	} catch (err) {
		redirect('/settings?error=Unauthorized');
	}

	const parsed = parsePricePerKilowattHour(formData);
	if (!parsed.ok) {
		redirect(`/settings?error=${encodeURIComponent(parsed.error)}`);
	}

	const platformName = parseOptionalString(formData, 'platformName');
	const supportEmail = parseOptionalString(formData, 'supportEmail');
	const maintenanceMode = parseBooleanField(formData, 'maintenanceMode');
	const downpaymentAmountPerDevice = parseIntegerField(formData, 'downpaymentAmountPerDevice', 1500);
	const loginLockoutThreshold = parseIntegerField(formData, 'loginLockoutThreshold', 5);

	await prisma.settings.update({
		where: { id: settingsId },
		data: {
			pricePerKilowattHour: parsed.value,
			platformName,
			supportEmail,
			maintenanceMode,
			downpaymentAmountPerDevice,
			loginLockoutThreshold,
		},
	});

	revalidatePath('/settings');
	redirect('/settings');
}
