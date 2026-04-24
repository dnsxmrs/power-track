import { NextRequest, NextResponse } from 'next/server';
import { addRequestLog, getRequestLogs } from '@/lib/requestLogs';

export const dynamic = 'force-dynamic';

function getQuery(url: URL): Record<string, string | string[]> {
    const query: Record<string, string | string[]> = {};

    for (const [key, value] of url.searchParams.entries()) {
        if (!(key in query)) {
            query[key] = value;
            continue;
        }

        const current = query[key];
        query[key] = Array.isArray(current) ? [...current, value] : [current, value];
    }

    return query;
}

function getHeadersMap(headers: Headers): Record<string, string> {
    const headersMap: Record<string, string> = {};

    headers.forEach((value, key) => {
        headersMap[key] = value;
    });

    return headersMap;
}

async function parsePayload(request: NextRequest): Promise<unknown> {
    const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';

    if (contentType.includes('application/json')) {
        try {
            return await request.json();
        } catch {
            return { error: 'Invalid JSON body' };
        }
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        return Object.fromEntries(formData.entries());
    }

    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        return Object.fromEntries(formData.entries());
    }

    const text = await request.text();
    return text.length > 0 ? text : null;
}

async function logRequest(request: NextRequest) {
    const payload = await parsePayload(request);
    const url = new URL(request.url);

    const entry = addRequestLog({
        method: request.method,
        path: url.pathname,
        query: getQuery(url),
        headers: getHeadersMap(request.headers),
        payload,
    });

    return NextResponse.json({ ok: true, log: entry }, { status: 201 });
}

export async function GET() {
    return NextResponse.json({ logs: getRequestLogs() });
}

export async function POST(request: NextRequest) {
    return logRequest(request);
}

export async function PUT(request: NextRequest) {
    return logRequest(request);
}

export async function PATCH(request: NextRequest) {
    return logRequest(request);
}

export async function DELETE(request: NextRequest) {
    return logRequest(request);
}
