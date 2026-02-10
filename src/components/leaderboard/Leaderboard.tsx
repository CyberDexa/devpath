import { useState, useMemo } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

type TimeFilter = 'weekly' | 'monthly' | 'alltime';
type CategoryFilter = 'overall' | 'frontend' | 'backend' | 'devops' | 'ai';

interface LeaderboardUser {
  rank: number;
  previousRank: number;
  username: string;
  displayName: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  topicsCompleted: number;
  badges: number;
  isCurrentUser?: boolean;
}

const mockUsers: LeaderboardUser[] = [
  { rank: 1, previousRank: 1, username: 'alexchen', displayName: 'Alex Chen', level: 42, xp: 128500, streak: 145, topicsCompleted: 234, badges: 48 },
  { rank: 2, previousRank: 3, username: 'sarahkim', displayName: 'Sarah Kim', level: 39, xp: 115200, streak: 89, topicsCompleted: 198, badges: 42 },
  { rank: 3, previousRank: 2, username: 'miguelr', displayName: 'Miguel Rodriguez', level: 38, xp: 112800, streak: 67, topicsCompleted: 187, badges: 39 },
  { rank: 4, previousRank: 5, username: 'priyap', displayName: 'Priya Patel', level: 36, xp: 105400, streak: 112, topicsCompleted: 175, badges: 37 },
  { rank: 5, previousRank: 4, username: 'jameswilson', displayName: 'James Wilson', level: 35, xp: 98700, streak: 45, topicsCompleted: 168, badges: 35 },
  { rank: 6, previousRank: 6, username: 'emilyd', displayName: 'Emily Davis', level: 34, xp: 94200, streak: 78, topicsCompleted: 156, badges: 33 },
  { rank: 7, previousRank: 9, username: 'kazutoshi', displayName: 'Kazutoshi Tanaka', level: 33, xp: 91500, streak: 56, topicsCompleted: 149, badges: 31 },
  { rank: 8, previousRank: 7, username: 'lisam', displayName: 'Lisa Müller', level: 32, xp: 88300, streak: 34, topicsCompleted: 142, badges: 29 },
  { rank: 9, previousRank: 10, username: 'omar_h', displayName: 'Omar Hassan', level: 31, xp: 85100, streak: 92, topicsCompleted: 138, badges: 28 },
  { rank: 10, previousRank: 8, username: 'annab', displayName: 'Anna Björk', level: 30, xp: 82700, streak: 23, topicsCompleted: 131, badges: 26 },
  { rank: 11, previousRank: 12, username: 'codelord', displayName: 'David Brooks', level: 29, xp: 79400, streak: 41, topicsCompleted: 125, badges: 24 },
  { rank: 12, previousRank: 11, username: 'ninaCode', displayName: 'Nina Petrov', level: 28, xp: 76800, streak: 65, topicsCompleted: 119, badges: 23 },
  { rank: 47, previousRank: 52, username: 'janedev', displayName: 'Jane Developer', level: 12, xp: 24500, streak: 7, topicsCompleted: 34, badges: 8, isCurrentUser: true },
];

function RankChangeIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = previous - current;
  if (diff > 0) {
    return (
      <span className="flex items-center gap-0.5 text-[var(--color-accent-teal)] text-[10px] font-medium">
        <ArrowUp size={10} />
        {diff}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="flex items-center gap-0.5 text-[var(--color-rose)] text-[10px] font-medium">
        <ArrowDown size={10} />
        {Math.abs(diff)}
      </span>
    );
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
        {/* Rank badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          {config.icon}
        </div>

        {/* Avatar */}
        <div className={clsx(
          'rounded-full bg-[var(--color-charcoal)] flex items-center justify-center mb-3 mt-2',
          position === 1 ? 'w-16 h-16' : 'w-12 h-12'
        )}>
          <span className={position === 1 ? 'text-2xl' : 'text-lg'}>
            {user.displayName.charAt(0)}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-white truncate max-w-full">{user.displayName}</h3>
        <p className="text-[10px] text-[var(--color-steel)]">@{user.username}</p>
        <div className="flex items-center gap-1 mt-2">
          <Star size={12} className="text-[var(--color-accent-teal)]" />
          <span className="text-xs font-semibold text-[var(--color-accent-teal)]">{user.xp.toLocaleString()} XP</span>
        </div>
        <div className="text-[10px] text-[var(--color-steel)] mt-1">Level {user.level}</div>
      </div>

      {/* Podium bar */}
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
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('weekly');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('overall');

  const topThree = mockUsers.slice(0, 3);
  const restUsers = mockUsers.slice(3);

  // Find current user if not in top list
  const currentUser = mockUsers.find((u) => u.isCurrentUser);
  const currentUserInList = restUsers.some((u) => u.isCurrentUser);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-accent-teal)]/20 bg-[var(--color-accent-teal)]/5 text-[var(--color-accent-teal)] text-xs font-medium mb-4">
          <Trophy size={14} />
          Weekly Leaderboard
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Top Developers</h1>
        <p className="text-[var(--color-steel)]">
          Compete, learn, and rise through the ranks
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        {/* Time filter */}
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
        <div className="flex items-center gap-1.5 flex-wrap">
          {([
            { value: 'overall', label: 'All' },
            { value: 'frontend', label: 'Frontend' },
            { value: 'backend', label: 'Backend' },
            { value: 'devops', label: 'DevOps' },
            { value: 'ai', label: 'AI/ML' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(opt.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                categoryFilter === opt.value
                  ? 'bg-white/[0.06] text-white border-white/10'
                  : 'text-[var(--color-steel)] border-transparent hover:text-white'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto items-end">
        <TopThreeCard user={topThree[1]} position={2} />
        <TopThreeCard user={topThree[0]} position={1} />
        <TopThreeCard user={topThree[2]} position={3} />
      </div>

      {/* Leaderboard table */}
      <div className="rounded-2xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[3rem_1fr_5rem_5rem_5rem_4rem] sm:grid-cols-[3rem_1fr_6rem_6rem_6rem_5rem] gap-2 px-5 py-3 border-b border-[var(--color-charcoal)] text-[10px] uppercase tracking-wider text-[var(--color-steel)]">
          <span>Rank</span>
          <span>Developer</span>
          <span className="text-right">XP</span>
          <span className="text-right hidden sm:block">Topics</span>
          <span className="text-right">Streak</span>
          <span className="text-right">Level</span>
        </div>

        {/* Rows */}
        {restUsers.filter((u) => !u.isCurrentUser).map((user, index) => (
          <motion.div
            key={user.username}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className="grid grid-cols-[3rem_1fr_5rem_5rem_5rem_4rem] sm:grid-cols-[3rem_1fr_6rem_6rem_6rem_5rem] gap-2 px-5 py-3 border-b border-[var(--color-charcoal)]/50 hover:bg-white/[0.02] transition-colors items-center"
          >
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-[var(--color-silver)] tabular-nums">{user.rank}</span>
              <RankChangeIndicator current={user.rank} previous={user.previousRank} />
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--color-charcoal)] flex items-center justify-center text-xs font-medium text-[var(--color-silver)] shrink-0">
                {user.displayName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                <p className="text-[10px] text-[var(--color-steel)] truncate">@{user.username}</p>
              </div>
            </div>
            <span className="text-sm text-[var(--color-silver)] text-right tabular-nums">{user.xp.toLocaleString()}</span>
            <span className="text-sm text-[var(--color-steel)] text-right tabular-nums hidden sm:block">{user.topicsCompleted}</span>
            <span className="text-sm text-right tabular-nums">
              <span className="inline-flex items-center gap-1 text-[var(--color-amber)]">
                <Flame size={12} />
                {user.streak}
              </span>
            </span>
            <span className="text-sm text-[var(--color-steel)] text-right tabular-nums">{user.level}</span>
          </motion.div>
        ))}

        {/* Current user row (sticky) */}
        {currentUser && !currentUserInList && (
          <>
            <div className="px-5 py-1">
              <div className="border-t border-dashed border-[var(--color-charcoal)]"></div>
              <p className="text-[10px] text-[var(--color-steel)] text-center my-1">· · ·</p>
            </div>
            <div className="grid grid-cols-[3rem_1fr_5rem_5rem_5rem_4rem] sm:grid-cols-[3rem_1fr_6rem_6rem_6rem_5rem] gap-2 px-5 py-3 bg-[var(--color-accent-teal)]/[0.04] border-t border-[var(--color-accent-teal)]/10 items-center">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-[var(--color-accent-teal)] tabular-nums">{currentUser.rank}</span>
                <RankChangeIndicator current={currentUser.rank} previous={currentUser.previousRank} />
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/20 flex items-center justify-center text-xs font-medium text-[var(--color-accent-teal)] shrink-0">
                  {currentUser.displayName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-accent-teal)] truncate">{currentUser.displayName} <span className="text-[10px] text-[var(--color-steel)]">(You)</span></p>
                  <p className="text-[10px] text-[var(--color-steel)] truncate">@{currentUser.username}</p>
                </div>
              </div>
              <span className="text-sm text-[var(--color-accent-teal)] text-right tabular-nums font-medium">{currentUser.xp.toLocaleString()}</span>
              <span className="text-sm text-[var(--color-steel)] text-right tabular-nums hidden sm:block">{currentUser.topicsCompleted}</span>
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

      {/* Stats footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        {[
          { icon: <Users size={18} />, label: 'Active Learners', value: '12,847' },
          { icon: <Flame size={18} />, label: 'Avg. Streak', value: '14 days' },
          { icon: <Trophy size={18} />, label: 'Topics Completed', value: '847K' },
          { icon: <Star size={18} />, label: 'Badges Earned', value: '234K' },
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
