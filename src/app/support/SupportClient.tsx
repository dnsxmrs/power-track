'use client';

import type React from 'react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    BookOpen,
    ChevronDown,
    CircleHelp,
    LifeBuoy,
    MessageSquareText,
    Sparkles,
    Zap,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { authClient } from '@/lib/auth-client';

type FaqItem = {
    icon: React.ComponentType<{ className?: string }>;
    question: string;
    answer: string;
};

type ThreadItem = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    tag: string;
    updated: string;
    replies: number;
    pinned?: boolean;
};

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300">
            {children}
        </span>
    );
}

export function SupportClient() {
    const { data: session } = authClient.useSession();

    const faqs = useMemo<FaqItem[]>(
        () => [
            {
                icon: CircleHelp,
                question: 'How do I create an account and sign in?',
                answer:
                    'Use the Sign Up page to create an account with email + password, then sign in. If you already have access via Google, choose “Continue with Google” on the Sign In page.',
            },
            {
                icon: LifeBuoy,
                question: 'Why am I being redirected to Sign In on some pages?',
                answer:
                    'Some pages are protected (Dashboard, Devices, Alerts, Reports, Logs, Branches, Settings). If you’re not signed in, PowerTrack will ask you to authenticate before continuing.',
            },
            {
                icon: BookOpen,
                question: 'Where can I see energy usage insights?',
                answer:
                    'After signing in, go to Dashboard to view usage charts, recommendations, and system status. This Support page is public and stays accessible for everyone.',
            },
            {
                icon: Sparkles,
                question: 'Is this Help & Support content live yet?',
                answer:
                    'Not yet — this page is currently using mock FAQ + thread data. You can swap these arrays with dynamic data later without changing the layout.',
            },
        ],
        [],
    );

    const threads = useMemo<ThreadItem[]>(
        () => [
            {
                icon: MessageSquareText,
                title: 'Device shows “offline” but readings still update',
                tag: 'Devices',
                updated: '2h ago',
                replies: 14,
                pinned: true,
            },
            {
                icon: MessageSquareText,
                title: 'Best practice: alert thresholds for demand spikes',
                tag: 'Alerts',
                updated: '1d ago',
                replies: 8,
            },
            {
                icon: MessageSquareText,
                title: 'Reports export: what formats will be supported?',
                tag: 'Reports',
                updated: '3d ago',
                replies: 5,
            },
            {
                icon: MessageSquareText,
                title: 'What does “Smart Insights” consider as anomalies?',
                tag: 'Insights',
                updated: '6d ago',
                replies: 11,
            },
        ],
        [],
    );

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-[#060b1d] via-[#0a1128] to-[#0f1535] text-slate-100">
            <div className="bg-orb-1 opacity-60" />
            <div className="bg-orb-2 opacity-60" />

            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
                <motion.header
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <LifeBuoy className="h-5 w-5 text-[#00d4ff]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                                    Help &amp; Support
                                </h1>
                                <Pill>Mock data</Pill>
                            </div>
                            <p className="mt-2 text-sm text-slate-400 max-w-[62ch]">
                                FAQs and support threads — accessible to everyone. If you’re signed in, you can still stay on this page.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 hover:border-white/20 transition"
                        >
                            <Zap className="h-4 w-4 text-[#00d4ff]" />
                            PowerTrack
                        </Link>

                        {session?.user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-[#00d4ff] to-blue-600 hover:from-[#00c2ea] hover:to-blue-500 transition shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.35)]"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/sign-in"
                                className="inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-[#00d4ff] to-blue-600 hover:from-[#00c2ea] hover:to-blue-500 transition shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.35)]"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </motion.header>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
                    className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    <GlassCard className="lg:col-span-2 p-0" glowColor="cyan">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <CircleHelp className="h-5 w-5 text-[#00d4ff]" />
                                    <h2 className="text-lg font-semibold">Frequently asked questions</h2>
                                </div>
                                <Pill>Public page</Pill>
                            </div>
                            <p className="mt-2 text-sm text-slate-400">
                                Click a question to expand the answer.
                            </p>

                            <div className="mt-6 space-y-3">
                                {faqs.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <details
                                            key={item.question}
                                            className="group rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 open:bg-white/6 transition"
                                        >
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                                        <Icon className="h-4 w-4 text-slate-200" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">
                                                            {item.question}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                                            </summary>
                                            <div className="mt-3 pl-12 pr-1 text-sm text-slate-400 leading-relaxed">
                                                {item.answer}
                                            </div>
                                        </details>
                                    );
                                })}
                            </div>
                        </div>
                    </GlassCard>

                    <div className="space-y-6">
                        <GlassCard className="p-0" glowColor="indigo">
                            <div className="p-6 sm:p-7">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquareText className="h-5 w-5 text-slate-200" />
                                        <h2 className="text-lg font-semibold">Support threads</h2>
                                    </div>
                                    <Pill>Mock</Pill>
                                </div>
                                <p className="mt-2 text-sm text-slate-400">
                                    Example community topics (static for now).
                                </p>

                                <div className="mt-5 space-y-3">
                                    {threads.map((t) => {
                                        const Icon = t.icon;
                                        return (
                                            <div
                                                key={t.title}
                                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 hover:bg-white/6 hover:border-white/20 transition"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                                            <Icon className="h-4 w-4 text-slate-200" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <div className="text-sm font-medium text-white">
                                                                    {t.title}
                                                                </div>
                                                                {t.pinned ? (
                                                                    <span className="inline-flex items-center rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/10 px-2 py-0.5 text-[11px] font-medium text-[#00d4ff]">
                                                                        Pinned
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-slate-400">
                                                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                                                                    {t.tag}
                                                                </span>
                                                                <span>•</span>
                                                                <span>{t.replies} replies</span>
                                                                <span>•</span>
                                                                <span>Updated {t.updated}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-0" glowColor="cyan">
                            <div className="p-6 sm:p-7">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-[#00d4ff]" />
                                    <h2 className="text-lg font-semibold">Tip</h2>
                                </div>
                                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                                    When you implement dynamic data later, keep this page public and read-only by default — it’s a good place to surface FAQs and announcements without requiring authentication.
                                </p>
                            </div>
                        </GlassCard>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
