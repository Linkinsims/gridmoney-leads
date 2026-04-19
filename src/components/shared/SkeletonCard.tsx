"use client";

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card animate-pulse">
      <div className="shimmer h-4 w-1/3 rounded mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer h-3 rounded mb-2"
          style={{ width: `${80 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="shimmer h-10 w-full rounded-t-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer h-14 w-full border-t border-surface-border" />
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}
