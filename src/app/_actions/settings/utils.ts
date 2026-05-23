export function parsePricePerKilowattHour(formData: FormData): number | string {
	const rawValue = formData.get('pricePerKilowattHour');
	const value = typeof rawValue === 'string' ? Number(rawValue) : Number.NaN;

	if (!Number.isFinite(value) || value < 0) {
		return 'Enter a valid price per kilowatt-hour greater than or equal to zero.';
	}

	return value;
}