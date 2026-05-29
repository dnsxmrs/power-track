import { NextResponse } from 'next/server';
import { fetchApprovedApplicationsForClientCreation } from '@/app/_actions/users';

export async function GET() {
	try {
		const applications = await fetchApprovedApplicationsForClientCreation();
		return NextResponse.json(applications);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch approved applications.';
		const status = message === 'Unauthorized' || message === 'Forbidden' ? 401 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}