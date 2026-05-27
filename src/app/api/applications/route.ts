import { NextResponse } from 'next/server';
import { fetchApplicationsForManagement } from '@/app/_actions/application/getapplication';

export async function GET() {
	try {
		const applications = await fetchApplicationsForManagement();
		return NextResponse.json(applications);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch applications.';
		const status = message === 'Unauthorized' || message === 'Forbidden' ? 401 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}