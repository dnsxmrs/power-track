'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, PageType } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoggedIn, loading, logout } = useAuth();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!isLoggedIn) {
            router.replace('/login');
        }
    }, [isLoggedIn, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-linear-to-br from-[#060b1d] via-[#0a1128] to-[#0f1535] text-slate-100 flex items-center justify-center">
                <div className="glass-panel rounded-2xl px-6 py-4 text-sm text-slate-300">Loading workspace...</div>
            </div>
        );
    }

    const pathToPage = (path: string): PageType => {
        if (path.startsWith('/devices')) return 'devices';
        if (path.startsWith('/alerts')) return 'alerts';
        if (path.startsWith('/reports')) return 'reports';
        if (path.startsWith('/branches')) return 'branches';
        if (path.startsWith('/settings')) return 'settings';
        return 'dashboard';
    };

    const handleNavigate = (page: PageType) => {
        switch (page) {
            case 'devices':
                router.push('/devices');
                break;
            case 'alerts':
                router.push('/alerts');
                break;
            case 'reports':
                router.push('/reports');
                break;
            case 'branches':
                router.push('/branches');
                break;
            case 'settings':
                router.push('/settings');
                break;
            default:
                router.push('/dashboard');
        }
        setMobileSidebarOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
        setMobileSidebarOpen(false);
    };

    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#060b1d] via-[#0a1128] to-[#0f1535] text-slate-100 flex relative overflow-hidden">
            <div className="bg-orb-1"></div>
            <div className="bg-orb-2"></div>

            <Sidebar
                activePage={pathToPage(pathname)}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                mobileOpen={mobileSidebarOpen}
                onRequestClose={() => setMobileSidebarOpen(false)}
            />

            <main className="flex-1 overflow-hidden">
                {/* Mobile menu button */}
                {isLoggedIn && (
                    <button
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white/8 hover:bg-white/12 text-slate-100"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}
                <div className="flex-1 overflow-auto">{children}</div>
            </main>
        </div>
    );
}
