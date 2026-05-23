'use client';

import {
  LayoutDashboardIcon,
  CpuIcon,
  BellIcon,
  BarChart3Icon,
  BuildingIcon,
  SettingsIcon,
  LogOutIcon,
  ZapIcon,
  Menu,
  UsersIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export type PageType = 'dashboard' | 'devices' | 'alerts' | 'reports' | 'branches' | 'settings' | 'users';

const NAV_ITEMS = [
  { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboardIcon, href: '/dashboard' },
  { id: 'devices' as PageType, label: 'Devices & Areas', icon: CpuIcon, href: '/devices' },
  { id: 'alerts' as PageType, label: 'Alerts', icon: BellIcon, href: '/alerts' },
  { id: 'reports' as PageType, label: 'Reports', icon: BarChart3Icon, href: '/reports' },
  { id: 'branches' as PageType, label: 'Branches', icon: BuildingIcon, href: '/branches' },
  { id: 'users' as PageType, label: 'Users', icon: UsersIcon, href: '/users' },
  { id: 'settings' as PageType, label: 'Settings', icon: SettingsIcon, href: '/settings' },
] as const;

// Pages that are not yet functional (mocked) and should be hidden from the nav.
// Update this set to show/hide pages as features are implemented.
const HIDDEN_PAGES = new Set<PageType>(['devices', 'alerts', 'branches', 'reports']);

function getActivePage(pathname: string): PageType {
  for (const item of NAV_ITEMS) {
    if (pathname.startsWith(item.href)) return item.id;
  }
  return 'dashboard';
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const activePage = getActivePage(pathname);
  const currentUser = session?.user;
  const displayName = currentUser?.name?.trim() || currentUser?.email?.split('@')[0] || 'Account';
  const displayEmail = currentUser?.email || 'Signed in';
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('') || 'A';

  const handleNavigate = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/sign-in');
    setMobileOpen(false);
  };

  return (
    <>
      {/* Hamburger — only visible on mobile, fixed in the main area */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white/8 hover:bg-white/12 text-slate-100"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar panel */}
      <div
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={`h-screen fixed left-0 top-0 glass-panel rounded-none! border-y-0! border-l-0! flex flex-col z-50 transform transition-[width,transform] ease-in-out duration-300 ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        {/* Logo */}
        <div className={`flex items-center mb-6 py-6 transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'px-6 space-x-3'}`}>
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-[#00d4ff] blur-md opacity-40 rounded-full" />
            <div className="relative bg-linear-to-br from-[#00d4ff] to-blue-600 p-2 rounded-xl">
              <ZapIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-xl font-bold text-white tracking-wide overflow-hidden whitespace-nowrap"
              >
                Power<span className="text-[#00d4ff]">Track</span>
              </motion.span>
            )}
          </AnimatePresence>
          <div className="ml-auto md:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg text-slate-300 hover:bg-white/4"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {NAV_ITEMS.filter(item => !HIDDEN_PAGES.has(item.id)).map(item => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.href)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                    ? 'bg-white/8 text-[#00d4ff]'
                    : 'text-slate-400 hover:bg-white/4 hover:text-slate-200'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#00d4ff] rounded-r-full shadow-[0_0_10px_rgba(0,212,255,0.8)]"
                  />
                )}
                <Icon className={`w-5 h-5 shrink-0 transition-colors duration-300 ${isActive ? 'text-[#00d4ff]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="font-medium text-sm overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 mt-auto border-t border-white/8 overflow-hidden">
          <div className={`flex items-center p-3 rounded-xl bg-white/2 border border-white/5 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-inner">
              {initials}
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="ml-3 flex-1 overflow-hidden whitespace-nowrap"
                >
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={handleLogout}
                  className="p-2 ml-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                  title="Logout"
                >
                  <LogOutIcon className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
