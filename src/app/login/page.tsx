'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ZapIcon, MailIcon, LockIcon, ArrowRightIcon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { isLoggedIn, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/dashboard');
        }
    }, [isLoggedIn, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network request
        setTimeout(async () => {
            setIsLoading(false);
            await login();
            router.push('/dashboard');
        }, 1200);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-linear-to-br from-[#060b1d] via-[#0a1128] to-[#0f1535]">
            {/* Background Orbs */}
            <div className="bg-orb-1"></div>
            <div className="bg-orb-2"></div>

            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.6,
                    ease: 'easeOut',
                }}
                className="w-full max-w-md px-4 z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{
                            scale: 0.8,
                        }}
                        animate={{
                            scale: 1,
                        }}
                        transition={{
                            delay: 0.2,
                            type: 'spring',
                        }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#00d4ff]/20 to-blue-600/20 border border-[#00d4ff]/30 backdrop-blur-xl mb-6 relative"
                    >
                        <div className="absolute inset-0 bg-[#00d4ff] blur-xl opacity-20 rounded-2xl"></div>
                        <ZapIcon className="w-8 h-8 text-[#00d4ff] relative z-10" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Welcome to <span className="text-gradient-cyan">PowerTrack</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Smart Utility Decision-Support System</p>
                </div>

                <GlassCard className="p-8" glowColor="cyan">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="login-email"
                                className="block text-xs font-medium text-slate-400 mb-1.5 ml-1"
                            >
                                Business Email
                            </label>
                            <div className="">
                                <div className="flex items-center bg-white/4 border border-white/10 rounded-xl px-4 py-3">
                                    <div className="flex items-center justify-center mr-3">
                                        <MailIcon className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <input
                                        id="login-email"
                                        type="email"
                                        required
                                        aria-required="true"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="glass-input glass-input--plain w-full"
                                        placeholder="admin@company.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                                <label
                                    htmlFor="login-password"
                                    className="block text-xs font-medium text-slate-400"
                                >
                                    Password
                                </label>
                                <a
                                    href="#"
                                    className="text-xs text-[#00d4ff] hover:text-blue-400 transition-colors"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="">
                                <div className="flex items-center bg-white/4 border border-white/10 rounded-xl px-4 py-3">
                                    <div className="flex items-center justify-center mr-3">
                                        <LockIcon className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <input
                                        id="login-password"
                                        type="password"
                                        required
                                        aria-required="true"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="glass-input glass-input--plain w-full"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center mt-2">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-white/10 bg-white/5 text-[#00d4ff] focus:ring-[#00d4ff]/50 focus:ring-offset-0"
                            />

                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                                Remember me for 30 days
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#00d4ff] to-blue-600 hover:from-[#00b8e6] hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d4ff] focus:ring-offset-[#060b1d] transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign In <ArrowRightIcon className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </GlassCard>

                <p className="text-center text-xs text-slate-500 mt-3">
                    Demo credentials: <span className="text-white font-medium">singkoadmin@pup.com</span> /{' '}
                    <span className="text-white font-medium">singkoadmin</span>
                </p>

                <p className="text-center text-sm text-slate-500 mt-8">
                    Don&apos;t have an account?{' '}
                    <a href="#" className="text-[#00d4ff] hover:underline">
                        Contact Sales
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
