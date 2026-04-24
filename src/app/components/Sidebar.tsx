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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
export type PageType = 'dashboard' | 'devices' | 'alerts' | 'reports' | 'branches' | 'settings';
interface SidebarProps {
  activePage: PageType;
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
  // mobile support
  mobileOpen?: boolean;
  onRequestClose?: () => void;
}
export function Sidebar({
  activePage,
  onNavigate,
  onLogout,
  mobileOpen = false,
  onRequestClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      id: 'devices',
      label: 'Devices & Areas',
      icon: CpuIcon,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: BellIcon,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3Icon,
    },
    {
      id: 'branches',
      label: 'Branches',
      icon: BuildingIcon,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
    },
  ] as const;
  return (
    <>
      {/* backdrop for mobile */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onRequestClose}
      />

      <div
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={`w-64 ${collapsed ? 'md:w-20' : 'md:w-64'} h-screen fixed left-0 top-0 glass-panel !rounded-none !border-y-0 !border-l-0 flex flex-col z-50 transform transition-all duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center space-x-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00d4ff] blur-md opacity-40 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-[#00d4ff] to-blue-600 p-2 rounded-xl">
              <ZapIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-white tracking-wide">
              Power<span className="text-[#00d4ff]">Track</span>
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={onRequestClose}
              className="ml-0 md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/[0.04]"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                    ? 'bg-white/[0.08] text-[#00d4ff]'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#00d4ff] rounded-r-full shadow-[0_0_10px_rgba(0,212,255,0.8)]"
                  />
                )}
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-[#00d4ff]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                />

                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Area */}
        <div className="p-4 mt-auto border-t border-white/[0.08]">
          <div className={`flex items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
              AD
            </div>
            {!collapsed && (
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-slate-500 truncate">admin@powertrack.io</p>
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
