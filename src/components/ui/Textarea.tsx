import { type TextareaHTMLAttributes, forwardRef, useState } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'glass';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, variant = 'default', className, id, ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const [focused, setFocused] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[var(--color-silver)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={clsx(
            'w-full rounded-lg border px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-steel)] transition-all duration-200 outline-none resize-y min-h-[100px]',
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
        {error && <p className="text-xs text-[var(--color-rose)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-steel)]">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
