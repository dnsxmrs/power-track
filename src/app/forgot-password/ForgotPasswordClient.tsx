'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ZapIcon, MailIcon, ArrowLeftIcon, LockIcon, KeyRoundIcon, CheckCircle2Icon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { authClient } from '@/lib/auth-client';

type Phase = 'email' | 'otp' | 'password' | 'success';

export function ForgotPasswordClient() {
    const router = useRouter();
    
    
    const [phase, setPhase] = useState<Phase>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (phase === 'otp' && otpRefs.current[0]) {
            otpRefs.current[0].focus();
        }
    }, [phase]);

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        const { error } = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: 'forget-password',
        });
        setIsLoading(false);

        if (error) {
            setError(error.message ?? 'Failed to send code.');
            return;
        }

        setPhase('otp');
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9A-Za-z]*$/.test(value)) return;

        const newOtp = [...otp];
        
        // Handle paste
        if (value.length > 1) {
            const pasted = value.slice(0, 6).split('');
            for (let i = 0; i < pasted.length; i++) {
                if (index + i < 6) newOtp[index + i] = pasted[i];
            }
            setOtp(newOtp);
            const nextIndex = Math.min(index + pasted.length, 5);
            otpRefs.current[nextIndex]?.focus();
            return;
        }

        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        const nextIndex = Math.min(pasted.length, 5);
        otpRefs.current[nextIndex]?.focus();
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits.');
            return;
        }
        setError(null);
        setIsLoading(true);
        const { error } = await authClient.emailOtp.checkVerificationOtp({
            email,
            otp: otpString,
            type: 'forget-password',
        });
        setIsLoading(false);
        if (error) {
            setError(error.message ?? 'Invalid code.');
            return;
        }
        setPhase('password');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setError(null);
        setIsLoading(true);
        
        const otpString = otp.join('');
        const { error: resetError } = await authClient.emailOtp.resetPassword({
            email,
            otp: otpString,
            password,
        });

        if (resetError) {
            setIsLoading(false);
            setError(resetError.message ?? 'Failed to reset password.');
            return;
        }

        // Auto-sign in with new password
        const { error: loginError } = await authClient.signIn.email({
            email,
            password,
            callbackURL: '/dashboard',
        });
        setIsLoading(false);

        if (loginError) {
            // Reset succeeded but auto-login failed — still show success and let them sign in manually
            console.warn('[PowerTrack] Password reset OK but auto-login failed:', loginError.message);
        }

        setPhase('success');
        
        // Redirect after a short delay
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-linear-to-br from-[#060b1d] via-[#0a1128] to-[#0f1535] p-4">
            <div className="bg-orb-1 opacity-60"></div>
            <div className="bg-orb-2 opacity-60"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-[420px] z-10"
            >
                <div className="flex items-center justify-center gap-2 mb-8">
                    <ZapIcon className="w-6 h-6 text-[#00d4ff]" />
                    <span className="text-xl font-bold text-white tracking-wide">PowerTrack</span>
                </div>

                <GlassCard className="p-8 sm:p-10 relative overflow-hidden" glowColor="cyan">
                    <AnimatePresence mode="wait">
                        {/* PHASE 1: EMAIL INPUT */}
                        {phase === 'email' && (
                            <motion.div
                                key="email-phase"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-8 text-center">
                                    <h1 className="text-2xl font-semibold text-white mb-2">Reset Password</h1>
                                    <p className="text-sm text-slate-400">
                                        Enter your email to receive a 6-digit recovery code.
                                    </p>
                                </div>

                                <form onSubmit={handleSendEmail} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label htmlFor="reset-email" className="block text-sm font-medium text-slate-300">
                                            Email Address
                                        </label>
                                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00d4ff]/50 focus-within:bg-white/10 transition-all duration-300">
                                            <MailIcon className="h-5 w-5 text-slate-400 mr-3" />
                                            <input
                                                id="reset-email"
                                                type="email"
                                                required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="bg-transparent w-full outline-none text-white placeholder:text-slate-500 text-sm"
                                                placeholder="admin@company.com"
                                            />
                                        </div>
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
                                            "Send Recovery Code"
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* PHASE 2: OTP INPUT */}
                        {phase === 'otp' && (
                            <motion.div
                                key="otp-phase"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-[#00d4ff]/10 flex items-center justify-center mx-auto mb-4 border border-[#00d4ff]/20">
                                        <KeyRoundIcon className="w-6 h-6 text-[#00d4ff]" />
                                    </div>
                                    <h1 className="text-2xl font-semibold text-white mb-2">Enter Code</h1>
                                    <p className="text-sm text-slate-400">
                                        We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1.5">This code expires in <span className="text-amber-400 font-medium">5 minutes</span>.</p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="flex justify-between gap-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => { otpRefs.current[index] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                onPaste={handleOtpPaste}
                                                className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-semibold text-white focus:border-[#00d4ff]/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 transition-all duration-300"
                                            />
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <p className="text-sm text-red-400 text-center">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#00d4ff] to-blue-600 hover:from-[#00c2ea] hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:ring-offset-2 focus:ring-offset-[#0a1128] transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            'Verify Code'
                                        )}
                                    </button>
                                </form>
                                <div className="mt-6 text-center">
                                    <button 
                                        onClick={handleSendEmail}
                                        disabled={isLoading}
                                        className="text-sm text-[#00d4ff] hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* PHASE 3: NEW PASSWORD */}
                        {phase === 'password' && (
                            <motion.div
                                key="password-phase"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-[#00d4ff]/10 flex items-center justify-center mx-auto mb-4 border border-[#00d4ff]/20">
                                        <LockIcon className="w-6 h-6 text-[#00d4ff]" />
                                    </div>
                                    <h1 className="text-2xl font-semibold text-white mb-2">New Password</h1>
                                    <p className="text-sm text-slate-400">
                                        Enter your new secure password.
                                    </p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-5">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-medium text-slate-300">New Password</label>
                                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00d4ff]/50 focus-within:bg-white/10 transition-all duration-300">
                                                <LockIcon className="h-5 w-5 text-slate-400 mr-3" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    className="bg-transparent w-full outline-none text-white placeholder:text-slate-500 text-sm"
                                                    placeholder="••••••••"
                                                    minLength={8}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00d4ff]/50 focus-within:bg-white/10 transition-all duration-300">
                                                <LockIcon className="h-5 w-5 text-slate-400 mr-3" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    className="bg-transparent w-full outline-none text-white placeholder:text-slate-500 text-sm"
                                                    placeholder="••••••••"
                                                    minLength={8}
                                                />
                                            </div>
                                        </div>
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
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* SUCCESS PHASE */}
                        {phase === 'success' && (
                            <motion.div
                                key="success-phase"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2Icon className="w-8 h-8 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">Password Reset!</h2>
                                <p className="text-slate-400 text-sm">
                                    Your password has been successfully updated. Redirecting to dashboard...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {phase !== 'success' && (
                        <div className="mt-8 text-center">
                            <button 
                                onClick={() => router.push('/sign-in')}
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeftIcon className="w-4 h-4" />
                                Back to sign in
                            </button>
                        </div>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
}
