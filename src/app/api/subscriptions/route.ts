import { NextResponse } from 'next/server';
import { fetchSubscriptionsForManagement } from '@/app/_actions/subscriptions/getsubscriptions';

export async function GET() {
	try {
		const subscriptions = await fetchSubscriptionsForManagement();
		return NextResponse.json(subscriptions);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch subscriptions.';
		const status = message === 'Unauthorized' || message === 'Forbidden' ? 401 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}