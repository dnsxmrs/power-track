'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ZapIcon, MailIcon, LockIcon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';

export function SignInClient() {
    const router = useRouter();
    const { isLoggedIn, login, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/dashboard');
        }
    }, [isLoggedIn, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        const result = await login(email, password, rememberMe);
        setIsLoading(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        router.push('/dashboard');
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setIsLoading(true);
        const result = await signInWithGoogle();
        setIsLoading(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        if (!result.error) {
            router.push('/dashboard');
        }
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
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-white mb-2">Sign In</h1>
                        <p className="text-sm text-slate-400">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-white border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    <div className="mb-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-[#0a1128]/80 text-slate-500 backdrop-blur-sm rounded-full">or sign in with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">
                                Email
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00d4ff]/50 focus-within:bg-white/10 transition-all duration-300">
                                <MailIcon className="h-5 w-5 text-slate-400 mr-3" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    aria-required="true"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="bg-transparent w-full outline-none text-white placeholder:text-slate-500 text-sm"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00d4ff]/50 focus-within:bg-white/10 transition-all duration-300">
                                <LockIcon className="h-5 w-5 text-slate-400 mr-3" />
                                <input
                                    id="login-password"
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

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={e => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-[#00d4ff] focus:ring-[#00d4ff]/50 focus:ring-offset-0 cursor-pointer transition-colors"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                                    Keep me signed in
                                </label>
                            </div>
                            <a href="#" className="text-sm font-medium text-[#00d4ff] hover:text-[#00b8e6] hover:underline transition-all">
                                Forgot password?
                            </a>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-sm text-red-400 text-center">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#00d4ff] to-blue-600 hover:from-[#00c2ea] hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:ring-offset-2 focus:ring-offset-[#0a1128] transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-8">
                        Don&apos;t have an account?{' '}
                        <a href="/sign-up" className="font-semibold text-[#00d4ff] hover:text-[#00b8e6] transition-colors rounded-xs focus:ring-2 focus:ring-[#00d4ff] focus:outline-none">
                            Sign up
                        </a>
                    </p>
                </GlassCard>
            </motion.div>
        </div>
    );
}
