import { StatusType } from '@/app/components/StatusBadge';
import { 
    LightbulbIcon, 
    AlertTriangleIcon, 
    TrendingUpIcon, 
    ThermometerIcon,
    WindIcon,
    WrenchIcon
} from 'lucide-react';

export async function getDashboardData() {
    // In a real app, this would be a Prisma call or similar.
    // We keep the data here to separate it from the UI components.
    
    const chartData = [
        { time: '12 AM', power: 4.2, voltage: 220 },
        { time: '3 AM', power: 3.8, voltage: 221 },
        { time: '6 AM', power: 5.5, voltage: 222 },
        { time: '9 AM', power: 14.2, voltage: 218 },
        { time: '12 PM', power: 18.4, voltage: 215 },
        { time: '3 PM', power: 16.8, voltage: 217 },
        { time: '6 PM', power: 12.5, voltage: 220 },
        { time: '9 PM', power: 8.4, voltage: 222 },
        { time: '11 PM', power: 5.1, voltage: 221 },
    ];

    const topAreas = [
        { name: 'Air Conditioning', value: 4.2, percentage: 32, color: 'bg-cyan-500' },
        { name: 'Power Tools Section', value: 3.8, percentage: 29, color: 'bg-indigo-500' },
        { name: 'Warehouse Lighting', value: 2.1, percentage: 16, color: 'bg-emerald-500' },
        { name: 'Office Area', value: 1.5, percentage: 12, color: 'bg-amber-500' },
        { name: 'Display Area', value: 1.2, percentage: 9, color: 'bg-purple-500' },
    ];

    const recentAlerts = [
        { id: 1, title: 'Power spike in Warehouse B', time: '5 min ago', status: 'critical' as StatusType },
        { id: 2, title: 'AC Unit 3 above threshold', time: '23 min ago', status: 'warning' as StatusType },
        { id: 3, title: 'Monthly target 80% reached', time: '1 hr ago', status: 'warning' as StatusType },
        { id: 4, title: 'Voltage fluctuation detected', time: '2 hrs ago', status: 'normal' as StatusType },
    ];

    const insightsData = [
        {
            icon: 'LightbulbIcon',
            color: 'amber' as const,
            text: 'Lighting Area is consuming 23% more power than usual today. This may indicate lights left on in unused sections.',
            time: 'Detected 15 min ago',
        },
        {
            icon: 'AlertTriangleIcon',
            color: 'red' as const,
            text: 'Possible overload risk detected in Warehouse Tools section. Current draw is approaching 90% of rated capacity.',
            time: 'Detected 8 min ago',
        },
        {
            icon: 'TrendingUpIcon',
            color: 'amber' as const,
            text: 'Branch 2 (Cebu) may exceed its normal weekly consumption by 12% if current usage continues.',
            time: 'Projected today',
        },
        {
            icon: 'ThermometerIcon',
            color: 'blue' as const,
            text: 'AC Unit 3 efficiency has dropped 15% over the past week. Maintenance may be needed.',
            time: 'Trend detected',
        },
    ];

    const recommendationsData = [
        {
            icon: 'LightbulbIcon',
            title: 'Check idle lighting after store hours',
            desc: 'Automated sensors detected lights active in Display Area at 10:30 PM last night. Estimated savings: ₱1,200/month',
            action: 'Set Schedule',
        },
        {
            icon: 'WindIcon',
            title: 'Reduce AC runtime during non-peak hours',
            desc: 'AC units are running at full capacity during low-traffic periods (6-8 AM). Off-peak scheduling could save 15%.',
            action: 'Optimize',
        },
        {
            icon: 'WrenchIcon',
            title: 'Inspect high-consumption equipment',
            desc: 'Power Tools section shows 40% higher draw than baseline. Equipment may need maintenance or replacement.',
            action: 'View Report',
        },
    ];

    const branchOverviewData = [
        { name: 'Main Store - Manila', usage: 12.8, status: 'normal' as StatusType },
        { name: 'Warehouse Hub - QC', usage: 18.4, status: 'warning' as StatusType },
        { name: 'Branch 2 - Cebu', usage: 8.2, status: 'normal' as StatusType },
        { name: 'Branch 3 - Davao', usage: 6.5, status: 'normal' as StatusType },
    ];

    const metrics = [
        { title: 'Power Health Score', value: '87', unit: '/100', trend: 'up', trendValue: '3.2%', status: 'normal' },
        { title: 'Voltage', value: '223.5', unit: 'V', trend: 'up', trendValue: '0.3%', status: 'normal' },
        { title: 'Current', value: '45.2', unit: 'A', trend: 'up', trendValue: '2.1%', status: 'normal' },
        { title: 'Power Consumption', value: '12.8', unit: 'kW', trend: 'down', trendValue: '5.4%', status: 'normal' },
        { title: 'Est. Monthly Bill', value: '₱48,250', trend: 'down', trendValue: '8.2%', status: 'normal' },
        { title: 'Peak Usage Today', value: '18.4', unit: 'kW', trend: 'up', trendValue: '12.4%', status: 'warning' },
        { title: 'Active Alerts', value: '3', trend: 'up', trendValue: '1', status: 'warning' },
    ];

    return {
        chartData,
        topAreas,
        recentAlerts,
        insightsData,
        recommendationsData,
        branchOverviewData,
        metrics
    };
}
