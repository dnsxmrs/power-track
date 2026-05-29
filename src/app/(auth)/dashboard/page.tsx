import { Metadata } from 'next';
import { ClockIcon } from 'lucide-react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardDataProvider } from './DashboardDataProvider';
import { getAdminDashboard } from '@/app/_actions/dashboard';
import { GlassCard } from '../../components/GlassCard';

export const metadata: Metadata = {
    title: 'Dashboard | PowerTrack',
    description: 'Monitor your energy consumption and system health in real-time.',
};

// any components for rendering dashboard metrics that rely on client-side interactivity or data fetching should be imported dynamically with suspense fallback to ensure the main dashboard page remains performant and responsive.
const MetricsCards = dynamic(() => import('./MetricGrid').then(m => m.MetricGrid));

const CoverageCards = dynamic(() => import('./CoverageCard').then(m => m.CoverageCard));

// skeleton for each component above
function MetricsCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={`metric-skeleton-${index}`}
                    className="glass-panel rounded-2xl p-6 h-34.5 border border-white/8"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                        <div className="h-5 w-16 rounded bg-white/10 animate-pulse" />
                    </div>
                    <div className="mt-3 h-8 w-20 rounded bg-white/10 animate-pulse" />
                </div>
            ))}
        </div>
    );
}

function CoverageCardsSkeleton() {
    return (
        <div className="glass-panel rounded-2xl p-6 border border-white/8 space-y-3" aria-hidden="true">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-6 w-56 rounded bg-white/10 animate-pulse" />
                    <div className="h-4 w-96 max-w-full rounded bg-white/10 animate-pulse" />
                </div>
                <div className="space-y-2 text-right">
                    <div className="h-4 w-24 ml-auto rounded bg-white/10 animate-pulse" />
                    <div className="h-4 w-40 ml-auto rounded bg-white/10 animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 mt-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`row-skeleton-${index}`} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 space-y-2">
                        <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                        <div className="h-4 w-12 rounded bg-white/10 animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default async function DashboardPage() {

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    // fetch admin-focused metrics for KPI strip
    const admin = await getAdminDashboard();

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Good morning, Admin. Here&apos;s your system overview.</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400 bg-white/3 px-4 py-2 rounded-lg border border-white/5">
                    <ClockIcon className="w-4 h-4 text-[#00d4ff]" />
                    <span>
                        {today}
                    </span>
                </div>
            </div>
            {/* Admin KPI strip: top-level counts for admins */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <GlassCard>
                    <p className="text-sm text-slate-400">Total Clients</p>
                    <p className="text-2xl font-bold text-white">{admin.totalClients}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-white">{admin.activeSubscriptions}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400">Pending Payments</p>
                    <p className="text-2xl font-bold text-[#f59e0b]">{admin.pendingPayments}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400">Revenue (month)</p>
                    <p className="text-2xl font-bold text-emerald-400">₱{admin.verifiedPaymentsThisMonth}</p>
                </GlassCard>
            </div>

            {/* Recent admin activity: show recent applications and pending payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Applications</h2>
                    {/* server-rendered list */}
                    {/* render recent applications from server action */}
                    <div className="space-y-3">
                        {admin.recentApplications.length === 0 && <p className="text-sm text-slate-500">No recent applications.</p>}
                        {admin.recentApplications.map((r) => (
                            <div key={r.id} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">{r.fullName}</p>
                                    <p className="text-xs text-slate-400">Ticket {r.ticketNumber} • {new Date(r.submittedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-slate-300">{r.status}</div>
                                    <a href={`/applications/${r.id}`} className="text-xs text-[#00d4ff]">Review</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
                <GlassCard>
                    <h2 className="text-lg font-semibold text-white mb-4">Pending Payments</h2>
                    {/* render pending payments from server action */}
                    <div className="space-y-3">
                        {admin.pendingPaymentsList.length === 0 && <p className="text-sm text-slate-500">No pending payments.</p>}
                        {admin.pendingPaymentsList.map((p) => (
                            <div key={p.referenceNumber} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">{p.userName ?? p.userEmail ?? p.referenceNumber}</p>
                                    <p className="text-xs text-slate-400">Ref {p.referenceNumber} • {new Date(p.submittedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm font-medium text-emerald-400">₱{p.amount}</div>
                                    <a href={`/payments`} className="text-xs text-[#00d4ff]">Verify</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
            {/* Trending plans */}
            <div className="mt-4">
                <GlassCard>
                    <h3 className="text-sm text-slate-400 mb-3">Trending Plans (last 30 days)</h3>
                    <div className="space-y-2">
                        {admin.trendingPlans.length === 0 && <p className="text-sm text-slate-500">No recent subscriptions.</p>}
                        {admin.trendingPlans.map((t) => (
                            <div key={t.planId} className="flex items-center justify-between">
                                <div className="text-sm text-white">{t.planName ?? t.planId}</div>
                                <div className="text-sm text-slate-400">{t.count}</div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
