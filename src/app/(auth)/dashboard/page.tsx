import { Metadata } from 'next';
import { getDashboardData } from './_actions/getDashboardData';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
    title: 'Dashboard | PowerTrack',
    description: 'Monitor your energy consumption and system health in real-time.',
};

export default async function DashboardPage() {
    // Fetch data on the server
    const data = await getDashboardData();

    return <DashboardClient data={data} />;
}
