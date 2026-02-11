// ═══════════════════════════════════════
// SkillRoute — Activity Feed Component
// Social feed from followed users + own activity
// ═══════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Award,
  BookOpen,
  Code2,
  Flame,
  GitBranch,
  Loader2,
  Play,
  Sparkles,
  Star,
  Swords,
  Trophy,
  UserPlus,
  Zap,
  ArrowUpRight,
  Users,
  Heart,
} from 'lucide-react';

interface FeedItem {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, any>;
  xp_gained: number;
  created_at: string;
  profiles?: {
    display_name: string;
    username: string;
    avatar_url: string | null;
    level: number;
    title: string;
  };
}

interface ActivityFeedProps {
  userId: string;
  mode?: 'social' | 'personal';
}

// ═══════════════════════════════════════
// Activity type config
// ═══════════════════════════════════════

const ACTIVITY_CONFIG: Record<string, { icon: any; color: string; label: string; verb: string }> = {
  node_completed: { icon: BookOpen, color: 'text-teal', label: 'Topic Completed', verb: 'completed a topic' },
  roadmap_started: { icon: GitBranch, color: 'text-sky', label: 'Roadmap Started', verb: 'started a new roadmap' },
  roadmap_completed: { icon: Trophy, color: 'text-amber', label: 'Roadmap Complete', verb: 'completed a roadmap!' },
  project_submission: { icon: Code2, color: 'text-violet', label: 'Project Submitted', verb: 'submitted a project' },
  badge_earned: { icon: Award, color: 'text-amber', label: 'Badge Earned', verb: 'earned a badge' },
  level_up: { icon: Star, color: 'text-teal', label: 'Level Up', verb: 'leveled up' },
  streak_milestone: { icon: Flame, color: 'text-amber', label: 'Streak Milestone', verb: 'hit a streak milestone' },
  quiz_completed: { icon: Sparkles, color: 'text-violet', label: 'Quiz Completed', verb: 'completed a quiz' },
  daily_challenge_completed: { icon: Zap, color: 'text-amber', label: 'Challenge Done', verb: 'completed the daily challenge' },
  battle_won: { icon: Swords, color: 'text-teal', label: 'Battle Won', verb: 'won a code battle' },
  battle_lost: { icon: Swords, color: 'text-dim', label: 'Battle Played', verb: 'competed in a code battle' },
  followed_user: { icon: UserPlus, color: 'text-sky', label: 'New Follow', verb: 'followed someone' },
  code_executed: { icon: Play, color: 'text-dim', label: 'Code Run', verb: 'ran some code' },
  tests_passed: { icon: Code2, color: 'text-teal', label: 'Tests Passed', verb: 'passed all tests' },
  ai_review_received: { icon: Sparkles, color: 'text-violet', label: 'AI Review', verb: 'got an AI code review' },
  review_session: { icon: BookOpen, color: 'text-sky', label: 'Review Session', verb: 'completed a review session' },
  became_mentor: { icon: Heart, color: 'text-rose', label: 'Mentor', verb: 'became a community mentor' },
};

const DEFAULT_CONFIG = { icon: Activity, color: 'text-dim', label: 'Activity', verb: 'did something' };

// ═══════════════════════════════════════
// Time formatting
// ═══════════════════════════════════════

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ═══════════════════════════════════════
// Sample feed data (fallback)
// ═══════════════════════════════════════

const SAMPLE_FEED: FeedItem[] = [
  {
    id: '1', user_id: '1', action: 'level_up',
    metadata: { level: 12, title: 'Skilled Developer' }, xp_gained: 0,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    profiles: { display_name: 'Alex Chen', username: 'alexchen', avatar_url: null, level: 12, title: 'Skilled Developer' },
  },
  {
    id: '2', user_id: '2', action: 'daily_challenge_completed',
    metadata: { challenge: 'Two Sum', difficulty: 'medium' }, xp_gained: 75,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    profiles: { display_name: 'Sarah Kim', username: 'sarahkim', avatar_url: null, level: 8, title: 'Developer' },
  },
  {
    id: '3', user_id: '3', action: 'badge_earned',
    metadata: { badge_name: 'On Fire', badge_icon: '🔥' }, xp_gained: 100,
    created_at: new Date(Date.now() - 14400000).toISOString(),
    profiles: { display_name: 'Marcus Li', username: 'marcusli', avatar_url: null, level: 15, title: 'Senior Developer' },
  },
  {
    id: '4', user_id: '1', action: 'battle_won',
    metadata: { battle_title: 'Array Mastery' }, xp_gained: 100,
    created_at: new Date(Date.now() - 28800000).toISOString(),
    profiles: { display_name: 'Alex Chen', username: 'alexchen', avatar_url: null, level: 12, title: 'Skilled Developer' },
  },
  {
    id: '5', user_id: '4', action: 'roadmap_completed',
    metadata: { roadmap: 'Frontend' }, xp_gained: 500,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    profiles: { display_name: 'Emily Rodriguez', username: 'emilyrodriguez', avatar_url: null, level: 20, title: 'Expert' },
  },
  {
    id: '6', user_id: '2', action: 'streak_milestone',
    metadata: { days: 14, bonus_xp: 100 }, xp_gained: 100,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: { display_name: 'Sarah Kim', username: 'sarahkim', avatar_url: null, level: 8, title: 'Developer' },
  },
];

// ═══════════════════════════════════════
// Feed Item Component
// ═══════════════════════════════════════

function FeedItemCard({ item, isOwn }: { item: FeedItem; isOwn: boolean }) {
  const config = ACTIVITY_CONFIG[item.action] || DEFAULT_CONFIG;
  const Icon = config.icon;
  const profile = item.profiles;

  const getDetailText = () => {
    const m = item.metadata;
    switch (item.action) {
      case 'level_up': return `Reached Level ${m.level}${m.title ? ` — "${m.title}"` : ''}`;
      case 'badge_earned': return `${m.badge_icon || '🏆'} ${m.badge_name}`;
      case 'streak_milestone': return `${m.days}-day streak achieved!`;
      case 'daily_challenge_completed': return `Solved "${m.challenge || 'Daily Challenge'}" (${m.difficulty || 'easy'})`;
      case 'battle_won': return `Won "${m.battle_title || 'Code Battle'}"`;
      case 'roadmap_completed': return `Completed the ${m.roadmap || ''} roadmap`;
      case 'roadmap_started': return `Started the ${m.roadmap || ''} roadmap`;
      case 'project_submission': return `Submitted ${m.project || 'a project'}`;
      default: return '';
    }
  };

  const detail = getDetailText();
  const initial = (profile?.display_name || '?')[0].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-4 rounded-xl bg-surface/30 hover:bg-surface/50 border border-white/5 hover:border-white/8 transition-all group"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal/20 to-violet/20 flex items-center justify-center text-sm font-bold text-teal">
            {initial}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-sm font-semibold text-text">
              {isOwn ? 'You' : profile?.display_name || 'Unknown'}
            </span>
            <span className="text-sm text-dim ml-1.5">{config.verb}</span>
          </div>
          <span className="text-[10px] text-muted flex-shrink-0">{timeAgo(item.created_at)}</span>
        </div>

        {detail && (
          <p className="text-xs text-soft mt-1">{detail}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <div className={`flex items-center gap-1 text-[10px] ${config.color}`}>
            <Icon size={10} />
            {config.label}
          </div>
          {item.xp_gained > 0 && (
            <span className="text-[10px] text-amber font-semibold">+{item.xp_gained} XP</span>
          )}
          {profile?.level && !isOwn && (
            <span className="text-[10px] text-muted">Lv.{profile.level}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export default function ActivityFeed({ userId, mode = 'social' }: ActivityFeedProps) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadFeed = async () => {
      try {
        if (mode === 'social') {
          const { getActivityFeed } = await import('../../lib/gamification');
          const data = await getActivityFeed(userId);
          setFeed(data as FeedItem[]);
        } else {
          const { getUserActivity } = await import('../../lib/data');
          const data = await getUserActivity(userId, 30);
          setFeed(data as FeedItem[]);
        }
      } catch {
        setFeed(SAMPLE_FEED);
      }
      setLoading(false);
    };
    loadFeed();
  }, [userId, mode]);

  // Filter out noise (code_executed, code_snapshot) for social feed
  const filteredFeed = feed.filter((item) => {
    if (mode === 'social' && ['code_executed', 'code_snapshot'].includes(item.action)) return false;
    if (filter === 'all') return true;
    if (filter === 'achievements') return ['badge_earned', 'level_up', 'streak_milestone', 'roadmap_completed'].includes(item.action);
    if (filter === 'challenges') return ['daily_challenge_completed', 'battle_won', 'battle_lost'].includes(item.action);
    if (filter === 'learning') return ['node_completed', 'roadmap_started', 'quiz_completed', 'review_session'].includes(item.action);
    return true;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'challenges', label: 'Challenges' },
    { key: 'learning', label: 'Learning' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-dim">
        <Loader2 size={20} className="animate-spin mr-2" />
        Loading activity...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-1.5 p-1 bg-surface/50 rounded-xl border border-white/5 w-fit">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.key
                ? 'bg-teal/10 text-teal border border-teal/20'
                : 'text-dim hover:text-text hover:bg-white/5 border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {filteredFeed.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Users size={40} className="text-muted mb-3" />
          <h3 className="text-sm font-semibold text-text mb-1">No activity yet</h3>
          <p className="text-xs text-dim max-w-xs">
            {mode === 'social'
              ? 'Follow other developers to see their activity here!'
              : 'Start learning, coding, or completing challenges to build your activity.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFeed.map((item) => (
            <FeedItemCard key={item.id} item={item} isOwn={item.user_id === userId} />
          ))}
        </div>
      )}
    </div>
  );
}
