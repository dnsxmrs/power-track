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
const requestLogs: RequestLogEntry[] = [];

export function addRequestLog(entry: Omit<RequestLogEntry, 'id' | 'receivedAt'>): RequestLogEntry {
    const log: RequestLogEntry = {
        id: crypto.randomUUID(),
        receivedAt: new Date().toISOString(),
        ...entry,
    };

    requestLogs.unshift(log);

    if (requestLogs.length > MAX_LOGS) {
        requestLogs.length = MAX_LOGS;
    }

    return log;
}

export function getRequestLogs(): RequestLogEntry[] {
    return [...requestLogs];
}
