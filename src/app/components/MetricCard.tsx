import type React from 'react';
import { GlassCard } from './GlassCard';
import { StatusBadge, StatusType } from './StatusBadge';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  status: StatusType;
  className?: string;
  glowColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'red' | 'none';
}
export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  status,
  className,
  glowColor = 'none',
}: MetricCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : MinusIcon;
  // For power/cost, down is usually good (green), up is bad (red).
  // We'll invert this logic if the title implies otherwise, but for simplicity we'll stick to this standard for energy monitoring.
  const isPositiveTrend = trend === 'down';
  const actualTrendColor = isPositiveTrend
    ? 'text-emerald-400'
    : trend === 'up'
    ? 'text-red-400'
    : 'text-slate-400';
  return (
    <GlassCard className={`flex flex-col ${className}`} hover glowColor={glowColor}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-white/[0.05] rounded-xl border border-white/[0.1]">
            <Icon className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-auto">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
          {unit && <span className="text-slate-400 text-sm font-medium">{unit}</span>}
        </div>

        <div className="flex items-center mt-2 space-x-2">
          <div className={`flex items-center text-xs font-medium ${actualTrendColor}`}>
            <TrendIcon className="w-3 h-3 mr-1" />
            {trendValue}
          </div>
          <span className="text-slate-500 text-xs">vs last month</span>
        </div>
      </div>
    </GlassCard>
  );
}
