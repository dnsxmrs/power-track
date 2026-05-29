export type PricePerKilowattHourParseResult =
	| {
		ok: true;
		value: number;
	}
	| {
		ok: false;
		error: string;
	};

export function parsePricePerKilowattHour(formData: FormData): PricePerKilowattHourParseResult {
	const rawValue = formData.get('pricePerKilowattHour');
	const value = typeof rawValue === 'string' ? Number(rawValue) : Number.NaN;

	if (!Number.isFinite(value) || value < 0) {
		return {
			ok: false,
			error: 'Enter a valid price per kilowatt-hour greater than or equal to zero.',
		};
	}

	return {
		ok: true,
		value,
	};
}

export function parseOptionalString(formData: FormData, key: string): string | null {
	const raw = formData.get(key);
	if (typeof raw === 'string') {
		const v = raw.trim();
		return v === '' ? null : v;
	}
	return null;
}

export function parseIntegerField(formData: FormData, key: string, fallback: number | null = null): number | null {
	const raw = formData.get(key);
	if (typeof raw === 'string' && raw !== '') {
		const n = Number(raw);
		if (Number.isFinite(n)) return Math.trunc(n);
	}
	return fallback;
}

export function parseBooleanField(formData: FormData, key: string): boolean {
	const raw = formData.get(key);
	return raw === 'on' || raw === 'true' || raw === '1';
}