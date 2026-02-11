import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Flame,
  TrendingUp,
  Crown,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../../lib/supabase';
import { getLeaderboard as getLeaderboardLegacy } from '../../lib/data';
import { getLeaderboard as getLeaderboardEnhanced } from '../../lib/gamification';

type TimeFilter = 'weekly' | 'monthly' | 'alltime';
type CategoryFilter = 'xp' | 'streak' | 'projects' | 'battles';

interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

function RankChangeIndicator({ rank }: { rank: number }) {
  // Since we don't store historical rankings yet, show static indicator
  if (rank <= 3) {
    return <ArrowUp size={10} className="text-[var(--color-accent-teal)]" />;
  }
  return <Minus size={10} className="text-[var(--color-steel)]" />;
}

function TopThreeCard({ user, position }: { user: LeaderboardUser; position: 1 | 2 | 3 }) {
  const config = {
    1: { gradient: 'from-amber-500/20 to-yellow-600/5', border: 'border-amber-500/30', icon: <Crown size={20} className="text-amber-400" />, size: 'h-36' },
    2: { gradient: 'from-gray-300/15 to-gray-500/5', border: 'border-gray-400/20', icon: <Medal size={18} className="text-gray-300" />, size: 'h-28' },
    3: { gradient: 'from-orange-600/15 to-orange-800/5', border: 'border-orange-500/20', icon: <Medal size={16} className="text-orange-400" />, size: 'h-24' },
  }[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.1 }}
      className={clsx(
        'flex flex-col items-center',
        position === 1 ? 'order-2' : position === 2 ? 'order-1' : 'order-3'
      )}
    >
      <div className={clsx(
        'relative rounded-2xl border p-5 flex flex-col items-center w-full bg-gradient-to-b',
        config.gradient,
        config.border
      )}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">{config.icon}</div>

        <div className={clsx(
          'rounded-full bg-[var(--color-charcoal)] flex items-center justify-center mb-3 mt-2 overflow-hidden',
          position === 1 ? 'w-16 h-16' : 'w-12 h-12'
        )}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
          ) : (
            <span className={position === 1 ? 'text-2xl' : 'text-lg'}>
              {user.display_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-white truncate max-w-full">{user.display_name}</h3>
        <p className="text-[10px] text-[var(--color-steel)]">@{user.username}</p>
        <div className="flex items-center gap-1 mt-2">
          <Star size={12} className="text-[var(--color-accent-teal)]" />
          <span className="text-xs font-semibold text-[var(--color-accent-teal)]">{user.xp.toLocaleString()} XP</span>
        </div>
        <div className="text-[10px] text-[var(--color-steel)] mt-1">Level {user.level}</div>
      </div>

      <div className={clsx(
        'w-full rounded-t-none rounded-b-lg bg-gradient-to-b',
        config.gradient,
        config.size,
        'border-x border-b',
        config.border,
        'flex items-end justify-center pb-2'
      )}>
        <span className="text-4xl font-black text-white/10">#{position}</span>
      </div>
    </motion.div>
  );
}

export function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('alltime');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('xp');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [timeFilter, categoryFilter]);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }

      // Try enhanced leaderboard first (supports time/category), fall back to legacy
      let data: any[] | null = null;
      try {
        const period = timeFilter === 'alltime' ? 'all-time' : timeFilter;
        data = await getLeaderboardEnhanced(period, categoryFilter, 50);
      } catch {
        data = await getLeaderboardLegacy(50);
      }

      if (data) {
        const ranked = data.map((u: any, i: number) => ({
          rank: i + 1,
          id: u.id,
          username: u.username,
          display_name: u.display_name,
          avatar_url: u.avatar_url,
          level: u.level,
          xp: u.xp,
          streak: u.streak,
          isCurrentUser: u.id === session?.user?.id,
        }));
        setUsers(ranked);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const topThree = users.slice(0, 3);
  const restUsers = users.slice(3);
  const currentUser = users.find((u) => u.isCurrentUser);
  const currentUserInRest = restUsers.some((u) => u.isCurrentUser);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-accent-teal)]/20 bg-[var(--color-accent-teal)]/5 text-[var(--color-accent-teal)] text-xs font-medium mb-4">
            <Trophy size={14} />
            Leaderboard
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Top Developers</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[var(--color-accent-teal)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-accent-teal)]/20 bg-[var(--color-accent-teal)]/5 text-[var(--color-accent-teal)] text-xs font-medium mb-4">
          <Trophy size={14} />
          Leaderboard
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Top Developers</h1>
        <p className="text-[var(--color-steel)]">
          Compete, learn, and rise through the ranks
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="flex items-center gap-1 bg-[var(--color-abyss)] rounded-xl border border-[var(--color-charcoal)] p-1">
          {([
            { value: 'weekly', label: 'This Week', icon: <Calendar size={13} /> },
            { value: 'monthly', label: 'This Month', icon: <TrendingUp size={13} /> },
            { value: 'alltime', label: 'All Time', icon: <Trophy size={13} /> },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFilter(opt.value)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                timeFilter === opt.value
                  ? 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)]'
                  : 'text-[var(--color-steel)] hover:text-white'
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 bg-[var(--color-abyss)] rounded-xl border border-[var(--color-charcoal)] p-1">
          {([
            { value: 'xp' as const, label: 'XP' },
            { value: 'streak' as const, label: 'Streak' },
            { value: 'projects' as const, label: 'Projects' },
            { value: 'battles' as const, label: 'Battles' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(opt.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                categoryFilter === opt.value
                  ? 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)]'
                  : 'text-[var(--color-steel)] hover:text-white'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {users.length === 0 && (
        <div className="text-center py-20">
          <Trophy size={48} className="mx-auto text-[var(--color-steel)] mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No developers yet</h2>
          <p className="text-[var(--color-steel)] mb-6">Be the first to earn XP and claim the #1 spot!</p>
          <a href="/roadmaps" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-teal)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity">
            Start Learning
          </a>
        </div>
      )}

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto items-end">
          <TopThreeCard user={topThree[1]} position={2} />
          <TopThreeCard user={topThree[0]} position={1} />
          <TopThreeCard user={topThree[2]} position={3} />
        </div>
      )}

      {/* Smaller podium for 1-2 users */}
      {topThree.length > 0 && topThree.length < 3 && (
        <div className="flex justify-center gap-4 mb-10 max-w-lg mx-auto">
          {topThree.map((user, i) => (
            <div key={user.id} className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent p-6 text-center flex-1">
              <Crown size={20} className="mx-auto text-amber-400 mb-2" />
              <div className="w-14 h-14 rounded-full bg-[var(--color-charcoal)] flex items-center justify-center mx-auto mb-2 overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{user.display_name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white">{user.display_name}</h3>
              <p className="text-xs text-[var(--color-accent-teal)] mt-1">{user.xp.toLocaleString()} XP</p>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard table */}
      {restUsers.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_5rem_5rem_4rem] sm:grid-cols-[3rem_1fr_6rem_6rem_5rem] gap-2 px-5 py-3 border-b border-[var(--color-charcoal)] text-[10px] uppercase tracking-wider text-[var(--color-steel)]">
            <span>Rank</span>
            <span>Developer</span>
            <span className="text-right">XP</span>
            <span className="text-right">Streak</span>
            <span className="text-right">Level</span>
          </div>

          {restUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className={clsx(
                'grid grid-cols-[3rem_1fr_5rem_5rem_4rem] sm:grid-cols-[3rem_1fr_6rem_6rem_5rem] gap-2 px-5 py-3 border-b border-[var(--color-charcoal)]/50 hover:bg-white/[0.02] transition-colors items-center',
                user.isCurrentUser && 'bg-[var(--color-accent-teal)]/[0.04] border-t border-[var(--color-accent-teal)]/10'
              )}
            >
              <div className="flex items-center gap-1">
                <span className={clsx(
                  'text-sm font-semibold tabular-nums',
                  user.isCurrentUser ? 'text-[var(--color-accent-teal)]' : 'text-[var(--color-silver)]'
                )}>{user.rank}</span>
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden',
                  user.isCurrentUser
                    ? 'bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/20 text-[var(--color-accent-teal)]'
                    : 'bg-[var(--color-charcoal)] text-[var(--color-silver)]'
                )}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                  ) : (
                    user.display_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className={clsx(
                    'text-sm font-medium truncate',
                    user.isCurrentUser ? 'text-[var(--color-accent-teal)]' : 'text-white'
                  )}>
                    {user.display_name}
                    {user.isCurrentUser && <span className="text-[10px] text-[var(--color-steel)] ml-1">(You)</span>}
                  </p>
                  <p className="text-[10px] text-[var(--color-steel)] truncate">@{user.username}</p>
                </div>
              </div>
              <span className={clsx(
                'text-sm text-right tabular-nums',
                user.isCurrentUser ? 'text-[var(--color-accent-teal)] font-medium' : 'text-[var(--color-silver)]'
              )}>{user.xp.toLocaleString()}</span>
              <span className="text-sm text-right tabular-nums">
                <span className="inline-flex items-center gap-1 text-[var(--color-amber)]">
                  <Flame size={12} />
                  {user.streak}
                </span>
              </span>
              <span className="text-sm text-[var(--color-steel)] text-right tabular-nums">{user.level}</span>
            </motion.div>
          ))}

          {/* Current user if not visible in list */}
          {currentUser && !currentUserInRest && currentUser.rank > 3 && (
            <>
              <div className="px-5 py-1">
                <div className="border-t border-dashed border-[var(--color-charcoal)]"></div>
                <p className="text-[10px] text-[var(--color-steel)] text-center my-1">...</p>
              </div>
              <div className="grid grid-cols-[3rem_1fr_5rem_5rem_4rem] sm:grid-cols-[3rem_1fr_6rem_6rem_5rem] gap-2 px-5 py-3 bg-[var(--color-accent-teal)]/[0.04] border-t border-[var(--color-accent-teal)]/10 items-center">
                <span className="text-sm font-semibold text-[var(--color-accent-teal)] tabular-nums">{currentUser.rank}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/20 flex items-center justify-center text-xs font-medium text-[var(--color-accent-teal)] shrink-0 overflow-hidden">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-accent-teal)] truncate">
                      {currentUser.display_name} <span className="text-[10px] text-[var(--color-steel)]">(You)</span>
                    </p>
                    <p className="text-[10px] text-[var(--color-steel)] truncate">@{currentUser.username}</p>
                  </div>
                </div>
                <span className="text-sm text-[var(--color-accent-teal)] text-right tabular-nums font-medium">{currentUser.xp.toLocaleString()}</span>
                <span className="text-sm text-right tabular-nums">
                  <span className="inline-flex items-center gap-1 text-[var(--color-amber)]">
                    <Flame size={12} />
                    {currentUser.streak}
                  </span>
                </span>
                <span className="text-sm text-[var(--color-steel)] text-right tabular-nums">{currentUser.level}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Stats footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
        {[
          { icon: <Users size={18} />, label: 'Total Learners', value: String(users.length) },
          { icon: <Trophy size={18} />, label: 'Top XP', value: users[0] ? users[0].xp.toLocaleString() : '0' },
          { icon: <Flame size={18} />, label: 'Best Streak', value: `${Math.max(0, ...users.map(u => u.streak))} days` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] p-4 text-center">
            <div className="flex justify-center text-[var(--color-steel)] mb-2">{stat.icon}</div>
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-[var(--color-steel)]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
