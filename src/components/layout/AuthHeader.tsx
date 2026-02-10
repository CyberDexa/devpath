// ═══════════════════════════════════════
// DevPath — Auth-Aware Header (React Island)
// Shows user avatar + dropdown when authenticated
// ═══════════════════════════════════════

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getProfile, signOut } from '../../lib/auth';
import {
  User,
  LogOut,
  Settings,
  Trophy,
  Map,
  ChevronDown,
  Zap,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function AuthHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id)
          .then(setProfile)
          .catch(() => {}); // Profile may not exist yet
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id)
          .then(setProfile)
          .catch(() => {});
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    try {
      await signOut();
    } catch {
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
      </div>
    );
  }

  // Not authenticated — show login/signup
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/login"
          className="hidden sm:inline-flex text-sm font-medium text-[var(--color-dim)] hover:text-[var(--color-text)] transition-colors duration-200"
        >
          Log in
        </a>
        <a
          href="/signup"
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-accent-teal)] text-[var(--color-void)] hover:brightness-90 transition-all duration-200"
          style={{ boxShadow: '0 0 20px rgba(0, 229, 160, 0.15)' }}
        >
          Get Started
        </a>
      </div>
    );
  }

  // Authenticated — show user menu
  const displayName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'Developer';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;

  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      {/* XP badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-accent-amber)]/10 border border-[var(--color-accent-amber)]/20">
        <Zap size={14} className="text-[var(--color-accent-amber)]" />
        <span className="text-xs font-semibold text-[var(--color-accent-amber)]">
          {xp.toLocaleString()} XP
        </span>
      </div>

      {/* Avatar button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] transition-colors duration-200"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full ring-2 ring-[var(--color-accent-teal)]/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent-teal)]/15 border border-[var(--color-accent-teal)]/30 flex items-center justify-center">
            <span className="text-xs font-bold text-[var(--color-accent-teal)]">
              {initials}
            </span>
          </div>
        )}
        <ChevronDown
          size={14}
          className={`text-[var(--color-dim)] transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {dropdownOpen && (
        <div className="absolute top-14 right-4 w-64 rounded-xl border border-white/[0.06] bg-[var(--color-surface)] shadow-2xl overflow-hidden z-[100]">
          {/* User info */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-semibold text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-[var(--color-dim)] truncate">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-[var(--color-accent-teal)] bg-[var(--color-accent-teal)]/10 px-2 py-0.5 rounded-full">
                Level {level}
              </span>
              <span className="text-xs text-[var(--color-steel)]">
                {xp.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            <a
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-white/[0.04] transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <User size={16} className="text-[var(--color-dim)]" />
              Profile
            </a>
            <a
              href="/roadmaps"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-white/[0.04] transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <Map size={16} className="text-[var(--color-dim)]" />
              My Roadmaps
            </a>
            <a
              href="/leaderboard"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-white/[0.04] transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <Trophy size={16} className="text-[var(--color-dim)]" />
              Leaderboard
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-white/[0.04] transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <Settings size={16} className="text-[var(--color-dim)]" />
              Settings
            </a>
          </div>

          {/* Sign out */}
          <div className="border-t border-white/[0.06] py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-accent-rose)] hover:bg-[var(--color-accent-rose)]/5 transition-colors w-full text-left"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
