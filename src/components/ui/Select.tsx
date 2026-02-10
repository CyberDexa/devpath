import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Search, X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  error?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(lower) ||
        o.description?.toLowerCase().includes(lower)
    );
  }, [options, search]);

  return (
    <div className="relative flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-silver)]">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full rounded-lg border px-4 py-2.5 text-sm text-left transition-all duration-200 outline-none flex items-center justify-between',
          'bg-[var(--color-abyss)]',
          error
            ? 'border-[var(--color-rose)]'
            : isOpen
              ? 'border-[var(--color-accent-teal)] shadow-[0_0_0_3px_rgba(0,229,160,0.1)]'
              : 'border-[var(--color-charcoal)] hover:border-[var(--color-steel)]'
        )}
      >
        <span className={selected ? 'text-white' : 'text-[var(--color-steel)]'}>
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.icon}
              {selected.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <svg
          className={clsx('w-4 h-4 text-[var(--color-steel)] transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] shadow-xl overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-[var(--color-charcoal)]">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-steel)]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-[var(--color-abyss)] border border-[var(--color-charcoal)] rounded-md pl-8 pr-8 py-1.5 text-sm text-white placeholder:text-[var(--color-steel)] outline-none focus:border-[var(--color-accent-teal)]"
                    autoFocus
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-steel)] hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[var(--color-steel)] text-center">
                  No options found
                </div>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={clsx(
                      'w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors',
                      option.value === value
                        ? 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)]'
                        : 'text-[var(--color-silver)] hover:bg-white/[0.04] hover:text-white'
                    )}
                  >
                    {option.icon}
                    <div>
                      <div>{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-[var(--color-steel)] mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {option.value === value && (
                      <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
      {error && <p className="text-xs text-[var(--color-rose)]">{error}</p>}
    </div>
  );
}
