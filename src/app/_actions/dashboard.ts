'use server';

import { prisma } from '@/lib/prisma';
import type { DashboardData, DashboardMetric } from '@/app/types/dashboard';

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

// Admin-focused dashboard data: KPIs and recent activity
export type AdminDashboardData = {
    totalClients: number;
    activeSubscriptions: number;
    pendingPayments: number;
    verifiedPaymentsThisMonth: number;
    recentApplications: Array<{ id: string; ticketNumber: string; fullName: string; status: string; submittedAt: Date }>;
    pendingPaymentsList: Array<{ referenceNumber: string; amount: number; submittedAt: Date; userName?: string | null; userEmail?: string | null; subscriptionId?: string | null }>;
    trendingPlans: Array<{ planId: string; planName: string | null; count: number }>;
};

export async function getAdminDashboard(): Promise<AdminDashboardData> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const start30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

    const [totalClients, activeSubscriptions, pendingPayments, verifiedPaymentsSum, recentApplications, pendingPaymentsList, recentSubs] = await Promise.all([
        prisma.user.count({ where: { role: 'CLIENT' } }),
        prisma.clientSubscription.count({ where: { status: 'active' } }),
        prisma.paymentSubmission.count({ where: { status: 'PENDING_VERIFICATION' } }),
        prisma.paymentSubmission.aggregate({ _sum: { amount: true }, where: { status: 'VERIFIED', createdAt: { gte: monthStart } } }).then(r => r._sum.amount ?? 0),
        prisma.application.findMany({ orderBy: { submittedAt: 'desc' }, take: 6, select: { id: true, ticketNumber: true, fullName: true, status: true, submittedAt: true } }),
        prisma.paymentSubmission.findMany({ where: { status: 'PENDING_VERIFICATION' }, orderBy: { submittedAt: 'desc' }, take: 6, select: { referenceNumber: true, amount: true, submittedAt: true, user: { select: { name: true, email: true } }, subscriptionId: true } }),
        prisma.clientSubscription.findMany({ where: { startedAt: { gte: start30 } }, select: { planId: true, plan: { select: { id: true, name: true } } } }),
    ]);

    // build trending plans counts
    const planMap: Record<string, { planName: string | null; count: number }> = {};
    for (const s of recentSubs) {
        const pid = s.planId;
        planMap[pid] ??= { planName: s.plan?.name ?? null, count: 0 };
        planMap[pid].count += 1;
    }

    const trendingPlans = Object.entries(planMap)
        .map(([planId, v]) => ({ planId, planName: v.planName, count: v.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const pendingFormatted = pendingPaymentsList.map((p: any) => ({
        referenceNumber: p.referenceNumber,
        amount: p.amount,
        submittedAt: p.submittedAt,
        userName: p.user?.name ?? null,
        userEmail: p.user?.email ?? null,
        subscriptionId: p.subscriptionId ?? null,
    }));

    return {
        totalClients,
        activeSubscriptions,
        pendingPayments,
        verifiedPaymentsThisMonth: verifiedPaymentsSum,
        recentApplications: recentApplications.map(r => ({ id: r.id, ticketNumber: r.ticketNumber, fullName: r.fullName, status: r.status, submittedAt: r.submittedAt })),
        pendingPaymentsList: pendingFormatted,
        trendingPlans,
    };
}
