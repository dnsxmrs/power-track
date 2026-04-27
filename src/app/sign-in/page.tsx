import { SignInClient } from './SignInClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In - PowerTrack',
    description: 'Sign in to the PowerTrack Smart Utility Decision-Support System.',
};

export default function LoginPage() {
    return <SignInClient />;
}
