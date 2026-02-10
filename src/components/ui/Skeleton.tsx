import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ className, variant = 'text', width, height, lines = 1 }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-white/[0.06] rounded';

  if (variant === 'circular') {
    return (
      <div
        className={clsx(baseClasses, 'rounded-full', className)}
        style={{ width: width || 40, height: height || 40 }}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={clsx(baseClasses, 'rounded-lg', className)}
        style={{ width: width || '100%', height: height || 200 }}
      />
    );
  }

  // Text variant
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(baseClasses, 'h-4')}
          style={{
            width: i === lines - 1 && lines > 1 ? '75%' : width || '100%',
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] p-6',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="60%" />
          <Skeleton width="40%" className="mt-2" />
        </div>
      </div>
      <Skeleton lines={3} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton width={80} height={28} variant="rectangular" className="!h-7 !rounded-full" />
        <Skeleton width={60} height={28} variant="rectangular" className="!h-7 !rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRoadmapViewer() {
  return (
    <div className="rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={48} height={48} />
          <div>
            <Skeleton width={200} />
            <Skeleton width={300} className="mt-2" />
          </div>
        </div>
        <Skeleton width={120} height={8} variant="rectangular" className="!h-2 !rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-6 py-8">
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="flex gap-4 justify-center">
            {Array.from({ length: row === 1 ? 1 : row === 4 ? 2 : row }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={200}
                height={60}
                className="!rounded-lg"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
