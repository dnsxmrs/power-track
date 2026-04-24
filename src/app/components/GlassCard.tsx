import type React from 'react';
import { motion } from 'framer-motion';
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'red' | 'none';
  hover?: boolean;
  onClick?: () => void;
}
export function GlassCard({
  children,
  className = '',
  glowColor = 'none',
  hover = false,
  onClick,
}: GlassCardProps) {
  const glowClasses = {
    cyan: 'shadow-[0_0_15px_rgba(0,212,255,0.15)] border-[#00d4ff]/20',
    indigo: 'shadow-[0_0_15px_rgba(99,102,241,0.15)] border-[#6366f1]/20',
    emerald: 'shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/20',
    amber: 'shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-500/20',
    red: 'shadow-[0_0_15px_rgba(239,68,68,0.15)] border-red-500/20',
    none: 'border-white/[0.08]',
  };
  const hoverClasses = hover
    ? 'hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 cursor-pointer hover:-translate-y-1'
    : '';
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={
        hover
          ? {
              scale: 1.01,
            }
          : {}
      }
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`glass-panel rounded-2xl p-6 ${glowClasses[glowColor]} ${hoverClasses} ${className} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]/40`}
    >
      {children}
    </motion.div>
  );
}
