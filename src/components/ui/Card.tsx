import { clsx } from "clsx";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "glass" | "glow" | "interactive";
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-surface border border-white/5",
  glass: "glass",
  glow: "bg-surface glow-border",
  interactive:
    "bg-surface border border-white/5 hover:border-teal/20 hover:shadow-glow cursor-pointer transition-all duration-300",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  variant = "default",
  className,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
