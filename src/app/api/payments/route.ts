import { NextResponse } from 'next/server';
import { fetchPaymentsForManagement } from '@/app/_actions/payments/getpayment';

export async function GET() {
	try {
		const payments = await fetchPaymentsForManagement();
		return NextResponse.json(payments);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch payments.';
		const status = message === 'Unauthorized' || message === 'Forbidden' ? 401 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}