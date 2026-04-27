import { ForgotPasswordClient } from './ForgotPasswordClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password - PowerTrack',
    description: 'Reset your password for PowerTrack Smart Utility Decision-Support System.',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordClient />;
}
