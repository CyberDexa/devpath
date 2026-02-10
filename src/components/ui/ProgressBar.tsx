import { clsx } from "clsx";

interface ProgressBarProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div
        className={clsx(
          "flex-1 rounded-full bg-elevated overflow-hidden",
          heights[size],
        )}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal to-sky transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-dim tabular-nums min-w-[3ch] text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
