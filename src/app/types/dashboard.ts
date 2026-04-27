import type { StatusType } from '@/app/types/status';

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
