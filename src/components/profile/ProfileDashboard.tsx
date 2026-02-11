import { useState, useEffect } from 'react';
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
  Loader2,
  LogIn,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { supabase } from '../../lib/supabase';
import { getProfile } from '../../lib/auth';
import {
  getUserRoadmapProgress,
  getUserActivity,
  getUserBadges,
  getUserSubmissions,
} from '../../lib/data';

// ── Types ──
interface ProfileData {
  id: string;
  display_name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  github_username: string | null;
  twitter_handle: string | null;
  xp: number;
  level: number;
  streak: number;
  longest_streak: number;
  created_at: string;
}

interface RoadmapProgressItem {
  roadmap_id: string;
  node_statuses: Record<string, string>;
  started_at: string;
  last_activity_at: string;
}

interface ActivityItem {
  id: string;
  action: string;
  metadata: Record<string, any>;
  xp_gained: number;
  created_at: string;
}

interface BadgeItem {
  id: string;
  earned_at: string;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xp_reward: number;
  };
}

// Roadmap metadata for display
const roadmapMeta: Record<string, { title: string; icon: string; totalTopics: number }> = {
  frontend: { title: 'Frontend Developer', icon: '🎨', totalTopics: 14 },
  backend: { title: 'Backend Developer', icon: '⚙️', totalTopics: 12 },
  fullstack: { title: 'Full Stack Developer', icon: '🔥', totalTopics: 18 },
  devops: { title: 'DevOps Engineer', icon: '🚀', totalTopics: 10 },
  'ai-engineer': { title: 'AI Engineer', icon: '🤖', totalTopics: 8 },
};

function generateHeatmapFromActivity(activities: ActivityItem[]) {
  const data: { date: string; count: number }[] = [];
  const counts: Record<string, number> = {};

  activities.forEach((a) => {
    const date = a.created_at.split('T')[0];
    counts[date] = (counts[date] || 0) + 1;
  });

  const now = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    data.push({ date: key, count: counts[key] || 0 });
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

  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];
  data.forEach((d) => {
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

function formatTimeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getActionLabel(action: string, metadata: Record<string, any>) {
  switch (action) {
    case 'node_completed':
      return { type: 'completed' as const, text: `Completed a topic in ${metadata.roadmap_id || 'a roadmap'}` };
    case 'roadmap_started':
      return { type: 'started' as const, text: `Started ${roadmapMeta[metadata.roadmap_id]?.title || 'a roadmap'}` };
    case 'project_submitted':
      return { type: 'project' as const, text: `Submitted project ${metadata.project_id || ''}` };
    case 'project_passed':
      return { type: 'project' as const, text: `Passed project ${metadata.project_id || ''}` };
    case 'badge_earned':
      return { type: 'badge' as const, text: `Earned a new badge` };
    case 'level_up':
      return { type: 'completed' as const, text: `Leveled up to Level ${metadata.to || ''}!` };
    case 'streak_updated':
      return { type: 'started' as const, text: `Streak updated to ${metadata.days || ''} days` };
    default:
      return { type: 'started' as const, text: action.replace(/_/g, ' ') };
  }
}

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmaps' | 'badges' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgressItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [allBadges, setAllBadges] = useState<{ id: string; name: string; description: string; icon: string; category: string }[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    loadProfileData();
  }, []);

  async function loadProfileData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      const [profileData, progress, activityData, badgesData, submissions, allBadgesData] = await Promise.all([
        getProfile(userId),
        getUserRoadmapProgress(userId),
        getUserActivity(userId, 50),
        getUserBadges(userId),
        getUserSubmissions(userId),
        supabase.from('badges').select('*').order('category'),
      ]);

      setProfile(profileData as ProfileData);
      setRoadmapProgress((progress || []) as RoadmapProgressItem[]);
      setActivities((activityData || []) as ActivityItem[]);
      setBadges((badgesData || []) as BadgeItem[]);
      setTotalProjects(submissions?.length || 0);
      setAllBadges((allBadgesData.data || []) as any[]);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-[var(--color-accent-teal)]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <LogIn size={48} className="text-[var(--color-steel)] mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your profile</h2>
        <p className="text-[var(--color-steel)] mb-6 max-w-md">
          Track your progress, earn badges, and see your learning journey.
        </p>
        <a href="/login">
          <Button>Sign In</Button>
        </a>
      </div>
    );
  }

  // Unified XP formula: level = floor(sqrt(xp/100)) + 1
  // XP needed for next level = level^2 * 100 (total), current level threshold = (level-1)^2 * 100
  const currentLevelXp = Math.pow(profile.level - 1, 2) * 100;
  const nextLevelXp = Math.pow(profile.level, 2) * 100;
  const xpInLevel = profile.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpProgress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;
  const completedTopics = roadmapProgress.reduce((sum, rp) => {
    const statuses = rp.node_statuses || {};
    return sum + Object.values(statuses).filter((s) => s === 'completed').length;
  }, 0);

  const heatmapData = generateHeatmapFromActivity(activities);
  const earnedBadgeIds = new Set(badges.map((b) => b.badges?.id));
  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

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
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[var(--color-accent-teal)] text-[var(--color-void)] text-xs font-bold">
              Lv.{profile.level}
            </div>
          </div>

          {/* User info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">
                {profile.display_name}
              </h1>
            </div>
            <p className="text-sm text-[var(--color-steel)] mb-2">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-[var(--color-silver)] mb-4 max-w-lg">{profile.bio}</p>}

            <div className="flex items-center gap-5 text-xs text-[var(--color-steel)]">
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin size={12} /> {profile.location}</span>
              )}
              <span className="flex items-center gap-1"><Calendar size={12} /> Joined {joinedDate}</span>
              {profile.github_username && (
                <a href={`https://github.com/${profile.github_username}`} className="flex items-center gap-1 hover:text-white transition-colors">
                  <Github size={12} /> {profile.github_username}
                </a>
              )}
              {profile.twitter_handle && (
                <a href={`https://twitter.com/${profile.twitter_handle}`} className="flex items-center gap-1 hover:text-white transition-colors">
                  <Twitter size={12} /> {profile.twitter_handle}
                </a>
              )}
              {profile.website && (
                <a href={profile.website} className="flex items-center gap-1 hover:text-white transition-colors">
                  <Globe size={12} /> Website
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <a href="/settings">
              <Button variant="ghost" size="sm"><Settings size={16} /></Button>
            </a>
            <a href="/settings">
              <Button variant="secondary" size="sm"><Edit3 size={14} className="mr-1.5" />Edit Profile</Button>
            </a>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-steel)]">Level {profile.level} Progress</span>
            <span className="text-xs font-mono text-[var(--color-accent-teal)]">{xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
          </div>
          <ProgressBar value={xpProgress} showLabel={false} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { icon: Flame, label: 'Current Streak', value: `${profile.streak} days`, color: 'text-[var(--color-accent-amber)]' },
            { icon: BookOpen, label: 'Topics Completed', value: String(completedTopics), color: 'text-[var(--color-accent-teal)]' },
            { icon: Code2, label: 'Projects Done', value: String(totalProjects), color: 'text-[var(--color-accent-violet)]' },
            { icon: Trophy, label: 'Badges Earned', value: String(badges.length), color: 'text-[var(--color-accent-sky)]' },
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
              <ActivityHeatmap data={heatmapData} />
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
                {activities.length === 0 && (
                  <p className="text-xs text-[var(--color-steel)]">No activity yet. Start learning!</p>
                )}
                {activities.slice(0, 5).map((activity) => {
                  const label = getActionLabel(activity.action, activity.metadata);
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5',
                        label.type === 'completed' && 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)]',
                        label.type === 'started' && 'bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]',
                        label.type === 'badge' && 'bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]',
                        label.type === 'project' && 'bg-[var(--color-accent-sky)]/10 text-[var(--color-accent-sky)]',
                      )}>
                        {label.type === 'completed' && '✓'}
                        {label.type === 'started' && '→'}
                        {label.type === 'badge' && '★'}
                        {label.type === 'project' && '◆'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--color-silver)] leading-relaxed">{label.text}</p>
                        {activity.xp_gained > 0 && (
                          <span className="text-[10px] text-[var(--color-accent-teal)]">+{activity.xp_gained} XP</span>
                        )}
                        <p className="text-[10px] text-[var(--color-steel)] mt-0.5">{formatTimeAgo(activity.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Roadmaps */}
            <div className="col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Active Roadmaps</h3>
                <a href="/roadmaps" className="text-xs text-[var(--color-accent-teal)] hover:underline">Browse all</a>
              </div>
              {roadmapProgress.length === 0 ? (
                <p className="text-sm text-[var(--color-steel)]">No roadmaps started yet. <a href="/roadmaps" className="text-[var(--color-accent-teal)] hover:underline">Explore roadmaps</a></p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {roadmapProgress.map((rp) => {
                    const meta = roadmapMeta[rp.roadmap_id] || { title: rp.roadmap_id, icon: '📘', totalTopics: 10 };
                    const completed = Object.values(rp.node_statuses || {}).filter((s) => s === 'completed').length;
                    const progress = Math.round((completed / Math.max(meta.totalTopics, 1)) * 100);
                    return (
                      <a
                        key={rp.roadmap_id}
                        href={`/roadmaps/${rp.roadmap_id}`}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-[var(--color-accent-teal)]/20 transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{meta.icon}</span>
                          <div>
                            <h4 className="text-sm font-semibold text-white group-hover:text-[var(--color-accent-teal)] transition-colors">{meta.title}</h4>
                            <p className="text-xs text-[var(--color-steel)]">{meta.totalTopics} topics</p>
                          </div>
                        </div>
                        <ProgressBar value={progress} showLabel />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-3 gap-4">
            {allBadges.length === 0 && badges.length === 0 && (
              <p className="col-span-3 text-sm text-[var(--color-steel)] text-center py-8">
                No badges available yet. Keep learning to earn them!
              </p>
            )}
            {allBadges.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={clsx(
                    'rounded-xl border p-5 text-center transition-all',
                    earned
                      ? 'border-white/[0.08] bg-white/[0.02] hover:border-[var(--color-accent-teal)]/20'
                      : 'border-white/[0.04] bg-white/[0.01] opacity-50'
                  )}
                >
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <h4 className="text-sm font-semibold text-white mb-1">{badge.name}</h4>
                  <p className="text-xs text-[var(--color-steel)] mb-2">{badge.description}</p>
                  {earned ? (
                    <Badge variant="teal" size="sm">Earned</Badge>
                  ) : (
                    <Badge variant="default" size="sm">Locked</Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'roadmaps' && (
          <div className="space-y-4">
            {roadmapProgress.length === 0 && (
              <p className="text-sm text-[var(--color-steel)] text-center py-8">
                No roadmaps started yet. <a href="/roadmaps" className="text-[var(--color-accent-teal)] hover:underline">Browse roadmaps</a>
              </p>
            )}
            {roadmapProgress.map((rp) => {
              const meta = roadmapMeta[rp.roadmap_id] || { title: rp.roadmap_id, icon: '📘', totalTopics: 10 };
              const completed = Object.values(rp.node_statuses || {}).filter((s) => s === 'completed').length;
              const progress = Math.round((completed / Math.max(meta.totalTopics, 1)) * 100);
              return (
                <a
                  key={rp.roadmap_id}
                  href={`/roadmaps/${rp.roadmap_id}`}
                  className="flex items-center gap-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-[var(--color-accent-teal)]/20 transition-all group"
                >
                  <span className="text-3xl">{meta.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white group-hover:text-[var(--color-accent-teal)] transition-colors">{meta.title}</h4>
                    <p className="text-xs text-[var(--color-steel)] mt-1">{completed}/{meta.totalTopics} topics completed</p>
                  </div>
                  <div className="w-48">
                    <ProgressBar value={progress} showLabel />
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            {activities.length === 0 ? (
              <p className="text-sm text-[var(--color-steel)] text-center py-8">No activity yet. Start learning to see your progress here!</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const label = getActionLabel(activity.action, activity.metadata);
                  return (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                      <div className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0',
                        label.type === 'completed' && 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)]',
                        label.type === 'started' && 'bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]',
                        label.type === 'badge' && 'bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]',
                        label.type === 'project' && 'bg-[var(--color-accent-sky)]/10 text-[var(--color-accent-sky)]',
                      )}>
                        {label.type === 'completed' && '✓'}
                        {label.type === 'started' && '→'}
                        {label.type === 'badge' && '★'}
                        {label.type === 'project' && '◆'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--color-silver)]">{label.text}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {activity.xp_gained > 0 && (
                            <span className="text-xs text-[var(--color-accent-teal)]">+{activity.xp_gained} XP</span>
                          )}
                          <span className="text-xs text-[var(--color-steel)]">{formatTimeAgo(activity.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
