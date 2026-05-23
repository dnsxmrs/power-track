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