import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "teal" | "amber" | "rose" | "violet" | "sky";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  default: "bg-elevated text-dim border-white/8",
  teal: "bg-teal/10 text-teal border-teal/20",
  amber: "bg-amber/10 text-amber border-amber/20",
  rose: "bg-rose/10 text-rose border-rose/20",
  violet: "bg-violet/10 text-violet border-violet/20",
  sky: "bg-sky/10 text-sky border-sky/20",
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium rounded-full border",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
