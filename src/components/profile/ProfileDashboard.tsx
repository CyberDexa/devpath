import { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  User,
  MapPin,
  Calendar,
  Github,
  Twitter,
  Globe,
  Flame,
  Trophy,
  BookOpen,
  Code2,
  TrendingUp,
  Settings,
  Edit3,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

// Mock data - will be replaced with Supabase data
const mockUser = {
  name: 'Jane Developer',
  username: 'janedev',
  avatar: null,
  bio: 'Full stack developer passionate about React, TypeScript, and building great developer tools.',
  location: 'San Francisco, CA',
  joinedDate: 'Feb 2026',
  website: 'https://janedev.com',
  github: 'janedev',
  twitter: 'janedev',
  level: 12,
  xp: 2450,
  xpToNext: 3000,
  streak: 7,
  longestStreak: 21,
  totalHours: 128,
  completedTopics: 34,
  completedProjects: 8,
  badges: [
    { id: '1', name: 'Early Adopter', icon: '🌟', description: 'Joined during beta', earned: '2026-02-10' },
    { id: '2', name: 'Week Warrior', icon: '🔥', description: '7-day learning streak', earned: '2026-02-10' },
    { id: '3', name: 'Frontend Hero', icon: '🎨', description: 'Completed Frontend roadmap', earned: null },
    { id: '4', name: 'Code Reviewer', icon: '👁️', description: 'First AI code review', earned: '2026-02-10' },
    { id: '5', name: 'Quiz Master', icon: '🧠', description: 'Score 100% on 5 quizzes', earned: null },
    { id: '6', name: 'Night Owl', icon: '🦉', description: 'Study session after midnight', earned: '2026-02-10' },
  ],
  activeRoadmaps: [
    { id: 'frontend', title: 'Frontend Developer', icon: '🎨', progress: 42, totalTopics: 14 },
    { id: 'backend', title: 'Backend Developer', icon: '⚙️', progress: 18, totalTopics: 12 },
    { id: 'ai-engineer', title: 'AI Engineer', icon: '🤖', progress: 5, totalTopics: 8 },
  ],
  recentActivity: [
    { type: 'completed', topic: 'React Hooks', roadmap: 'Frontend', time: '2 hours ago' },
    { type: 'started', topic: 'Node.js Basics', roadmap: 'Backend', time: '5 hours ago' },
    { type: 'badge', badge: 'Week Warrior', time: '1 day ago' },
    { type: 'completed', topic: 'TypeScript Generics', roadmap: 'Frontend', time: '1 day ago' },
    { type: 'project', project: 'Todo API', time: '2 days ago' },
  ],
  heatmap: generateHeatmapData(),
};

function generateHeatmapData() {
  const data: { date: string; count: number }[] = [];
  const now = new Date(2026, 1, 10);
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      count: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0,
    });
  }
  return data;
}

function ActivityHeatmap({ data }: { data: { date: string; count: number }[] }) {
  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/[0.04]';
    if (count === 1) return 'bg-[var(--color-accent-teal)]/20';
    if (count === 2) return 'bg-[var(--color-accent-teal)]/40';
    if (count === 3) return 'bg-[var(--color-accent-teal)]/60';
    return 'bg-[var(--color-accent-teal)]/80';
  };

  // Group by weeks (columns)
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];
  data.forEach((d, i) => {
    const dayOfWeek = new Date(d.date).getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(d);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day) => (
            <div
              key={day.date}
              className={clsx('w-3 h-3 rounded-[2px] transition-colors', getColor(day.count))}
              title={`${day.date}: ${day.count} activities`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmaps' | 'badges' | 'activity'>('overview');
  const user = mockUser;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { id: 'roadmaps' as const, label: 'Roadmaps', icon: MapPin },
    { id: 'badges' as const, label: 'Badges', icon: Trophy },
    { id: 'activity' as const, label: 'Activity', icon: BookOpen },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--color-accent-teal)]/20 to-[var(--color-accent-violet)]/20 border border-white/[0.08] flex items-center justify-center text-4xl">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User size={40} className="text-[var(--color-steel)]" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[var(--color-accent-teal)] text-[var(--color-void)] text-xs font-bold">
              Lv.{user.level}
            </div>
          </div>

          {/* User info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">
                {user.name}
              </h1>
              <Badge variant="teal" size="sm">Pro</Badge>
            </div>
            <p className="text-sm text-[var(--color-steel)] mb-2">@{user.username}</p>
            <p className="text-sm text-[var(--color-silver)] mb-4 max-w-lg">{user.bio}</p>

            <div className="flex items-center gap-5 text-xs text-[var(--color-steel)]">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {user.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Joined {user.joinedDate}
              </span>
              {user.github && (
                <a href={`https://github.com/${user.github}`} className="flex items-center gap-1 hover:text-white transition-colors">
                  <Github size={12} /> {user.github}
                </a>
              )}
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter}`} className="flex items-center gap-1 hover:text-white transition-colors">
                  <Twitter size={12} /> {user.twitter}
                </a>
              )}
              {user.website && (
                <a href={user.website} className="flex items-center gap-1 hover:text-white transition-colors">
                  <Globe size={12} /> Website
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
            <Button variant="secondary" size="sm">
              <Edit3 size={14} className="mr-1.5" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-steel)]">Level {user.level} Progress</span>
            <span className="text-xs font-mono text-[var(--color-accent-teal)]">{user.xp} / {user.xpToNext} XP</span>
          </div>
          <ProgressBar value={Math.round((user.xp / user.xpToNext) * 100)} showLabel={false} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { icon: Flame, label: 'Current Streak', value: `${user.streak} days`, color: 'text-[var(--color-accent-amber)]' },
            { icon: BookOpen, label: 'Topics Completed', value: String(user.completedTopics), color: 'text-[var(--color-accent-teal)]' },
            { icon: Code2, label: 'Projects Done', value: String(user.completedProjects), color: 'text-[var(--color-accent-violet)]' },
            { icon: Trophy, label: 'Total Hours', value: `${user.totalHours}h`, color: 'text-[var(--color-accent-sky)]' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-center">
              <stat.icon size={20} className={clsx('mx-auto mb-2', stat.color)} />
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-[var(--color-steel)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)] border border-[var(--color-accent-teal)]/20'
                : 'text-[var(--color-steel)] hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Activity Heatmap */}
            <div className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Learning Activity</h3>
              <ActivityHeatmap data={user.heatmap} />
              <div className="flex items-center justify-end gap-2 mt-3">
                <span className="text-[10px] text-[var(--color-steel)]">Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={clsx(
                      'w-3 h-3 rounded-[2px]',
                      level === 0 && 'bg-white/[0.04]',
                      level === 1 && 'bg-[var(--color-accent-teal)]/20',
                      level === 2 && 'bg-[var(--color-accent-teal)]/40',
                      level === 3 && 'bg-[var(--color-accent-teal)]/60',
                      level === 4 && 'bg-[var(--color-accent-teal)]/80',
                    )}
                  />
                ))}
                <span className="text-[10px] text-[var(--color-steel)]">More</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {user.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5',
                      activity.type === 'completed' && 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)]',
                      activity.type === 'started' && 'bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]',
                      activity.type === 'badge' && 'bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]',
                      activity.type === 'project' && 'bg-[var(--color-accent-sky)]/10 text-[var(--color-accent-sky)]',
                    )}>
                      {activity.type === 'completed' && '✓'}
                      {activity.type === 'started' && '→'}
                      {activity.type === 'badge' && '★'}
                      {activity.type === 'project' && '◆'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--color-silver)] leading-relaxed">
                        {activity.type === 'completed' && <>Completed <strong className="text-white">{activity.topic}</strong> in {activity.roadmap}</>}
                        {activity.type === 'started' && <>Started <strong className="text-white">{activity.topic}</strong> in {activity.roadmap}</>}
                        {activity.type === 'badge' && <>Earned <strong className="text-white">{activity.badge}</strong> badge</>}
                        {activity.type === 'project' && <>Finished project <strong className="text-white">{activity.project}</strong></>}
                      </p>
                      <p className="text-[10px] text-[var(--color-steel)] mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Roadmaps */}
            <div className="col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Active Roadmaps</h3>
                <a href="/roadmaps" className="text-xs text-[var(--color-accent-teal)] hover:underline">Browse all</a>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {user.activeRoadmaps.map((rm) => (
                  <a
                    key={rm.id}
                    href={`/roadmaps/${rm.id}`}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-[var(--color-accent-teal)]/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{rm.icon}</span>
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-[var(--color-accent-teal)] transition-colors">{rm.title}</h4>
                        <p className="text-xs text-[var(--color-steel)]">{rm.totalTopics} topics</p>
                      </div>
                    </div>
                    <ProgressBar value={rm.progress} showLabel />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-3 gap-4">
            {user.badges.map((badge) => (
              <div
                key={badge.id}
                className={clsx(
                  'rounded-xl border p-5 text-center transition-all',
                  badge.earned
                    ? 'border-white/[0.08] bg-white/[0.02] hover:border-[var(--color-accent-teal)]/20'
                    : 'border-white/[0.04] bg-white/[0.01] opacity-50'
                )}
              >
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h4 className="text-sm font-semibold text-white mb-1">{badge.name}</h4>
                <p className="text-xs text-[var(--color-steel)] mb-2">{badge.description}</p>
                {badge.earned ? (
                  <Badge variant="teal" size="sm">Earned</Badge>
                ) : (
                  <Badge variant="default" size="sm">Locked</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'roadmaps' && (
          <div className="space-y-4">
            {user.activeRoadmaps.map((rm) => (
              <a
                key={rm.id}
                href={`/roadmaps/${rm.id}`}
                className="flex items-center gap-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-[var(--color-accent-teal)]/20 transition-all group"
              >
                <span className="text-3xl">{rm.icon}</span>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-white group-hover:text-[var(--color-accent-teal)] transition-colors">{rm.title}</h4>
                  <p className="text-xs text-[var(--color-steel)] mt-1">{rm.totalTopics} topics</p>
                </div>
                <div className="w-48">
                  <ProgressBar value={rm.progress} showLabel />
                </div>
              </a>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="space-y-4">
              {user.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0',
                    activity.type === 'completed' && 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)]',
                    activity.type === 'started' && 'bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]',
                    activity.type === 'badge' && 'bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]',
                    activity.type === 'project' && 'bg-[var(--color-accent-sky)]/10 text-[var(--color-accent-sky)]',
                  )}>
                    {activity.type === 'completed' && '✓'}
                    {activity.type === 'started' && '→'}
                    {activity.type === 'badge' && '★'}
                    {activity.type === 'project' && '◆'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-silver)]">
                      {activity.type === 'completed' && <>Completed <strong className="text-white">{activity.topic}</strong> in {activity.roadmap}</>}
                      {activity.type === 'started' && <>Started learning <strong className="text-white">{activity.topic}</strong> in {activity.roadmap}</>}
                      {activity.type === 'badge' && <>Earned the <strong className="text-white">{activity.badge}</strong> badge</>}
                      {activity.type === 'project' && <>Finished project <strong className="text-white">{activity.project}</strong></>}
                    </p>
                    <p className="text-xs text-[var(--color-steel)] mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
