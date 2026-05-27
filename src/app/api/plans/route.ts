'use server';

import { NextResponse } from 'next/server';
import { fetchPlansForManagement } from '@/app/_actions/plans/getplans';

export async function GET() {
  try {
    const plans = await fetchPlansForManagement();
    return NextResponse.json(plans);
  } catch (err) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
}
