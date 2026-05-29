'use server';

import { prisma } from '@/lib/prisma';

export type ReportsPayload = {
  totalClients: number;
  activeSubscriptions: number;
  pendingPayments: number;
  verifiedPaymentsThisMonth: number;
  applicationsThisMonth: number;
  totalDevices: number;
  dailyAvgWatts: Array<{ date: string; avgWatts: number }>; // last 30 days
  dailyTrends: Array<{
    date: string;
    applicationsCreated: number;
    subscriptionsCreated: number;
    paymentsVerified: number;
    newClients: number;
  }>;
};

export async function getReportsData(): Promise<ReportsPayload> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalClients, activeSubscriptions, pendingPayments, verifiedPaymentsSum, applicationsThisMonth, totalDevices] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.clientSubscription.count({ where: { status: 'active' } }),
    prisma.paymentSubmission.count({ where: { status: 'PENDING_VERIFICATION' } }),
    prisma.paymentSubmission.aggregate({
      _sum: { amount: true },
      where: { status: 'VERIFIED', createdAt: { gte: monthStart } },
    }).then(r => r._sum.amount ?? 0),
    prisma.application.count({ where: { submittedAt: { gte: monthStart } } }),
    prisma.device.count(),
  ]);

  // extract recent request logs to estimate daily average watts for the last 30 days
  const logs = await prisma.requestLog.findMany({
    where: { createdAt: { gte: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 35) } },
    orderBy: { createdAt: 'desc' },
    take: 2000,
    select: { payload: true, createdAt: true },
  });

  const daily: Record<string, { sum: number; count: number }> = {};

  for (const log of logs) {
    const d = log.createdAt.toISOString().slice(0, 10);
    let watts: number | null = null;
    try {
      const p: any = log.payload as any;
      const w = typeof p?.watts === 'number' ? p.watts : typeof p?.watts === 'string' ? Number(p.watts) : NaN;
      if (Number.isFinite(w)) watts = w;
    } catch (e) {
      watts = null;
    }
    if (watts === null) continue;
    if (!daily[d]) daily[d] = { sum: 0, count: 0 };
    daily[d].sum += watts;
    daily[d].count += 1;
  }

  const last30: Array<{ date: string; avgWatts: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const entry = daily[key];
    last30.push({ date: key, avgWatts: entry ? Math.round(entry.sum / entry.count) : 0 });
  }

  // build daily trends for last 30 days
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

  const [apps, subs, payments, clients] = await Promise.all([
    prisma.application.findMany({ where: { submittedAt: { gte: startDate } }, select: { submittedAt: true } }),
    prisma.clientSubscription.findMany({ where: { startedAt: { gte: startDate } }, select: { startedAt: true } }),
    prisma.paymentSubmission.findMany({ where: { reviewedAt: { gte: startDate }, status: 'VERIFIED' }, select: { reviewedAt: true } }),
    prisma.user.findMany({ where: { role: 'CLIENT', createdAt: { gte: startDate } }, select: { createdAt: true } }),
  ]);

  const trendsMap: Record<string, { applicationsCreated: number; subscriptionsCreated: number; paymentsVerified: number; newClients: number }> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    trendsMap[key] = { applicationsCreated: 0, subscriptionsCreated: 0, paymentsVerified: 0, newClients: 0 };
  }

  for (const a of apps) {
    const k = a.submittedAt.toISOString().slice(0, 10);
    if (trendsMap[k]) trendsMap[k].applicationsCreated += 1;
  }
  for (const s of subs) {
    const k = s.startedAt.toISOString().slice(0, 10);
    if (trendsMap[k]) trendsMap[k].subscriptionsCreated += 1;
  }
  for (const p of payments) {
    const k = p.reviewedAt!.toISOString().slice(0, 10);
    if (trendsMap[k]) trendsMap[k].paymentsVerified += 1;
  }
  for (const c of clients) {
    const k = c.createdAt.toISOString().slice(0, 10);
    if (trendsMap[k]) trendsMap[k].newClients += 1;
  }

  const dailyTrends = Object.keys(trendsMap)
    .sort()
    .map((k) => ({ date: k, ...trendsMap[k] }));

  return {
    totalClients,
    activeSubscriptions,
    pendingPayments,
    verifiedPaymentsThisMonth: verifiedPaymentsSum,
    applicationsThisMonth,
    totalDevices,
    dailyAvgWatts: last30,
    dailyTrends,
  };
}
