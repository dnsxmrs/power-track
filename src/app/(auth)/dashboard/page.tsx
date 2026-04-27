import { Metadata } from 'next';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
    title: 'Dashboard | PowerTrack',
    description: 'Monitor your energy consumption and system health in real-time.',
};

export default function DashboardPage() {
    return <DashboardClient />;
}
