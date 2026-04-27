import { SignUpClient } from './SignUpClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up - PowerTrack',
    description: 'Create an administrator account for PowerTrack.',
};

export default function SignUpPage() {
    return <SignUpClient />;
}
