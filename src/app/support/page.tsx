import type { Metadata } from 'next';
import { SupportClient } from './SupportClient';

export const metadata: Metadata = {
    title: 'Help & Support - PowerTrack',
    description: 'Browse FAQs and support threads for PowerTrack.',
};

export default function SupportPage() {
    return <SupportClient />;
}
