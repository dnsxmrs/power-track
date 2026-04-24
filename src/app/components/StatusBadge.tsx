export type StatusType = 'normal' | 'warning' | 'critical' | 'info';
export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}
export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const styles = {
    normal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  const dotColors = {
    normal: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    warning: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    critical: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]',
    info: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]',
  };
  const defaultLabels = {
    normal: 'Normal',
    warning: 'Warning',
    critical: 'Critical',
    info: 'Info',
  };
  const displayLabel = label || defaultLabels[status];
  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium backdrop-blur-md ${styles[status]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dotColors[status]}`}></span>
      {displayLabel}
    </div>
  );
}
