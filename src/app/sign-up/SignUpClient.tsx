'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ZapIcon, MailIcon, LockIcon, UserIcon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { authClient } from '@/lib/auth-client';

export function SignUpClient() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            router.replace('/dashboard');
        }
    }, [session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        const { error } = await authClient.signUp.email({
            name,
            email,
            password,
            callbackURL: '/dashboard',
        });
        setIsLoading(false);

        if (error) {
            setError(error.message ?? 'Registration failed.');
            return;
        }

        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-linear-to-br from-[#060b1d] via-[#0a1128] to-[#0f1535] p-4">
            {/* Background Orbs */}
            <div className="bg-orb-1 opacity-60"></div>
            <div className="bg-orb-2 opacity-60"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-[420px] z-10"
            >
                {/* Logo Section */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <ZapIcon className="w-6 h-6 text-[#00d4ff]" />
                    <span className="text-xl font-bold text-white tracking-wide">PowerTrack</span>
                </div>

                <GlassCard className="p-8 sm:p-10" glowColor="cyan">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-semibold text-white mb-2">Create an account</h1>
                        <p className="text-sm text-slate-400">
                            Setup your temporary admin access perfectly.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="signup-name" className="block text-sm font-medium text-slate-300">
                                Full Name
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00d4ff]/50 focus-within:bg-white/10 transition-all duration-300">
                                <UserIcon className="h-5 w-5 text-slate-400 mr-3" />
                                <input
                                    id="signup-name"
                                    type="text"
                                    required
                                    aria-required="true"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="bg-transparent w-full outline-none text-white placeholder:text-slate-500 text-sm"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300">
                                Business Email
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00d4ff]/50 focus-within:bg-white/10 transition-all duration-300">
                                <MailIcon className="h-5 w-5 text-slate-400 mr-3" />
                                <input
                                    id="signup-email"
                                    type="email"
                                    required
                                    aria-required="true"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="bg-transparent w-full outline-none text-white placeholder:text-slate-500 text-sm"
                                    placeholder="admin@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00d4ff]/50 focus-within:bg-white/10 transition-all duration-300">
                                <LockIcon className="h-5 w-5 text-slate-400 mr-3" />
                                <input
                                    id="signup-password"
                                    type="password"
                                    required
                                    aria-required="true"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="bg-transparent w-full outline-none text-white placeholder:text-slate-500 text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-2">
                                <p className="text-sm text-red-400 text-center">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#00d4ff] to-blue-600 hover:from-[#00c2ea] hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:ring-offset-2 focus:ring-offset-[#0a1128] transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-8">
                        Already have an account?{' '}
                        <a href="/sign-in" className="font-semibold text-[#00d4ff] hover:text-[#00b8e6] transition-colors rounded-xs focus:ring-2 focus:ring-[#00d4ff] focus:outline-none">
                            Sign in
                        </a>
                    </p>
                </GlassCard>
            </motion.div>
        </div>
    );
}
