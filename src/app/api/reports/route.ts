import { NextResponse } from 'next/server';
import { getReportsData } from '@/app/_actions/reports/getreports';

export async function GET() {
  try {
    const data = await getReportsData();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to compute reports', detail: String(err) }, { status: 500 });
  }
}
