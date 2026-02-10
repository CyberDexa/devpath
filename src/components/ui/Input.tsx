import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'glass';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, variant = 'default', className, id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const [focused, setFocused] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-silver)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-steel)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={clsx(
              'w-full rounded-lg border px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-steel)] transition-all duration-200 outline-none',
              icon && 'pl-10',
              variant === 'default' && [
                'bg-[var(--color-abyss)]',
                error
                  ? 'border-[var(--color-rose)]'
                  : focused
                    ? 'border-[var(--color-accent-teal)] shadow-[0_0_0_3px_rgba(0,229,160,0.1)]'
                    : 'border-[var(--color-charcoal)] hover:border-[var(--color-steel)]',
              ],
              variant === 'glass' && [
                'bg-white/[0.03] backdrop-blur-sm',
                error
                  ? 'border-[var(--color-rose)]'
                  : focused
                    ? 'border-[var(--color-accent-teal)] shadow-[0_0_0_3px_rgba(0,229,160,0.1)]'
                    : 'border-white/[0.06] hover:border-white/10',
              ],
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-rose)] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-steel)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
