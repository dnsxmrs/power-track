import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export type RequestLogEntry = {
    id: string;
    method: string;
    path: string;
    query: Record<string, string | string[]>;
    headers: Record<string, string>;
    payload: unknown;
    receivedAt: string;
};

const MAX_LOGS = 100;

function toInputJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

export async function addRequestLog(entry: Omit<RequestLogEntry, 'id' | 'receivedAt'>): Promise<RequestLogEntry> {
    const created = await prisma.requestLog.create({
        data: {
            method: entry.method,
            path: entry.path,
            query: toInputJson(entry.query),
            headers: toInputJson(entry.headers),
            payload: toInputJson(entry.payload),
        },
    });

    return {
        id: created.id,
        method: created.method,
        path: created.path,
        query: (created.query ?? {}) as Record<string, string | string[]>,
        headers: created.headers as Record<string, string>,
        payload: created.payload,
        receivedAt: created.createdAt.toISOString(),
    };
}

export async function getRequestLogs(): Promise<RequestLogEntry[]> {
    const logs = await prisma.requestLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: MAX_LOGS,
    });

    return logs.map((log) => ({
        id: log.id,
        method: log.method,
        path: log.path,
        query: (log.query ?? {}) as Record<string, string | string[]>,
        headers: log.headers as Record<string, string>,
        payload: log.payload,
        receivedAt: log.createdAt.toISOString(),
    }));
}
