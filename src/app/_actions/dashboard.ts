import { prisma } from '@/lib/prisma';
import type { StatusType } from '@/app/types/status';

const MAX_LOGS_TO_SCAN = 100;

type TelemetryPayload = {
    amps?: unknown;
    watts?: unknown;
    voltage?: unknown;
    deviceId?: unknown;
};

type TelemetryReading = {
    deviceId: string;
    amps: number;
    watts: number;
    voltage: number;
    receivedAt: string;
};

export type DashboardMetric = {
    title: string;
    value: string | number;
    unit?: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    status: StatusType;
    glowColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'red' | 'none';
};

export type DashboardData = {
    metrics: DashboardMetric[];
    coverage: {
        charts: 'NA';
        insights: 'NA';
        recommendations: 'NA';
        branchOverview: 'NA';
    };
    latestReadingAt: string | null;
};

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function isTelemetryPayload(payload: unknown): payload is TelemetryPayload {
    return typeof payload === 'object' && payload !== null;
}

function extractTelemetryReading(payload: unknown, receivedAt: string): TelemetryReading | null {
    if (!isTelemetryPayload(payload)) {
        return null;
    }

    const deviceId = typeof payload.deviceId === 'string' ? payload.deviceId.trim() : '';
    const amps = toNumber(payload.amps);
    const watts = toNumber(payload.watts);
    const voltage = toNumber(payload.voltage);

    if (!deviceId || amps === null || watts === null || voltage === null) {
        return null;
    }

    return {
        deviceId,
        amps,
        watts,
        voltage,
        receivedAt,
    };
}

function formatTrend(current: number, previous?: number | null) {
    if (typeof previous !== 'number' || !Number.isFinite(previous) || previous === 0) {
        return {
            trend: 'neutral' as const,
            trendValue: 'NA',
        };
    }

    const delta = ((current - previous) / previous) * 100;

    return {
        trend: delta > 0 ? ('up' as const) : delta < 0 ? ('down' as const) : ('neutral' as const),
        trendValue: `${Math.abs(delta).toFixed(1)}%`,
    };
}

export async function getDashboardData(): Promise<DashboardData> {
    const logs = await prisma.requestLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: MAX_LOGS_TO_SCAN,
        select: {
            payload: true,
            createdAt: true,
        },
    });

    const telemetryReadings = logs
        .map((log) => extractTelemetryReading(log.payload, log.createdAt.toISOString()))
        .filter((reading): reading is TelemetryReading => reading !== null);

    const latestReading = telemetryReadings[0] ?? null;
    const previousReadingForDevice = latestReading
        ? telemetryReadings.find((reading, index) => index > 0 && reading.deviceId === latestReading.deviceId)
        : null;

    const metrics: DashboardMetric[] = latestReading
        ? [
            {
                title: 'Device ID',
                value: latestReading.deviceId,
                trend: 'neutral',
                trendValue: 'NA',
                status: 'info',
                glowColor: 'indigo',
            },
            {
                title: 'Voltage',
                value: latestReading.voltage,
                unit: 'V',
                ...formatTrend(latestReading.voltage, previousReadingForDevice?.voltage),
                status: 'normal',
                glowColor: 'cyan',
            },
            {
                title: 'Amps',
                value: latestReading.amps,
                unit: 'A',
                ...formatTrend(latestReading.amps, previousReadingForDevice?.amps),
                status: 'normal',
                glowColor: 'emerald',
            },
            {
                title: 'Watts',
                value: latestReading.watts,
                unit: 'W',
                ...formatTrend(latestReading.watts, previousReadingForDevice?.watts),
                status: 'normal',
                glowColor: 'amber',
            },
        ]
        : [
            {
                title: 'Device ID',
                value: 'NA',
                trend: 'neutral',
                trendValue: 'NA',
                status: 'warning',
                glowColor: 'none',
            },
            {
                title: 'Voltage',
                value: 'NA',
                unit: 'V',
                trend: 'neutral',
                trendValue: 'NA',
                status: 'warning',
                glowColor: 'none',
            },
            {
                title: 'Amps',
                value: 'NA',
                unit: 'A',
                trend: 'neutral',
                trendValue: 'NA',
                status: 'warning',
                glowColor: 'none',
            },
            {
                title: 'Watts',
                value: 'NA',
                unit: 'W',
                trend: 'neutral',
                trendValue: 'NA',
                status: 'warning',
                glowColor: 'none',
            },
        ];

    return {
        metrics,
        coverage: {
            charts: 'NA',
            insights: 'NA',
            recommendations: 'NA',
            branchOverview: 'NA',
        },
        latestReadingAt: latestReading?.receivedAt ?? null,
    };
}
