export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/[0.02] rounded-xl ${className}`}>
      <div className="h-4 bg-white/[0.03] rounded w-3/5 mb-4"></div>
      <div className="space-y-3">
        <div className="h-6 bg-white/[0.03] rounded w-full mb-2"></div>
        <div className="h-6 bg-white/[0.03] rounded w-full mb-2"></div>
        <div className="h-6 bg-white/[0.03] rounded w-2/3"></div>
      </div>
    </div>
  );
}
