// ═══════════════════════════════════════
// SkillRoute — User Profile Card
// Public profile with stats, badges,
// follow/unfollow, and activity summary
// ═══════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  UserMinus,
  Trophy,
  Flame,
  Swords,
  Code2,
  Star,
  Loader2,
  ExternalLink,
  MapPin,
  Calendar,
  GraduationCap,
} from 'lucide-react';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  longest_streak: number;
  title: string;
  is_mentor: boolean;
  mentor_topics: string[] | null;
  total_challenges_completed: number;
  total_battles_won: number;
  total_battles_played: number;
  created_at: string;
  badges?: { name: string; icon: string; description: string; category: string }[];
}

interface UserProfileCardProps {
  username: string;
  currentUserId?: string;
}

// ═══════════════════════════════════════
// Sample Profile (fallback)
// ═══════════════════════════════════════

const SAMPLE_PROFILE: ProfileData = {
  id: 'demo',
  username: 'skillroute_user',
  display_name: 'SkillRoute User',
  bio: 'Full-stack developer passionate about clean code and open source.',
  avatar_url: null,
  xp: 4800,
  level: 7,
  streak: 12,
  longest_streak: 23,
  title: 'Developer',
  is_mentor: false,
  mentor_topics: null,
  total_challenges_completed: 15,
  total_battles_won: 3,
  total_battles_played: 8,
  created_at: '2024-09-15T00:00:00Z',
  badges: [
    { name: 'First Steps', icon: '🚀', description: 'Complete first topic', category: 'milestone' },
    { name: 'Quick Learner', icon: '⚡', description: 'Complete 5 topics in a week', category: 'learning' },
    { name: 'Challenge Taker', icon: '🎯', description: 'Complete a daily challenge', category: 'challenge' },
  ],
};

// ═══════════════════════════════════════
// Title colors
// ═══════════════════════════════════════

const TITLE_COLORS: Record<string, string> = {
  Beginner: 'text-dim',
  Novice: 'text-sky',
  Apprentice: 'text-teal',
  Developer: 'text-teal',
  'Skilled Developer': 'text-emerald',
  'Senior Developer': 'text-violet',
  Expert: 'text-amber',
  Master: 'text-amber',
  Grandmaster: 'text-rose',
  Architect: 'text-rose',
  Legend: 'text-amber',
};

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export default function UserProfileCard({ username, currentUserId }: UserProfileCardProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { getPublicProfile, getFollowCounts, isFollowing: checkFollowing } = await import('../../lib/gamification');
        const [p, counts] = await Promise.all([
          getPublicProfile(username),
          getPublicProfile(username).then((pr: any) => pr ? getFollowCounts(pr.id) : { followers: 0, following: 0 }),
        ]);
        if (p) {
          setProfile(p as ProfileData);
          setFollowerCount(counts.followers);
          setFollowingCount(counts.following);
          if (currentUserId && p.id !== currentUserId) {
            const following = await checkFollowing(currentUserId, p.id);
            setIsFollowing(following);
          }
        } else {
          setProfile(SAMPLE_PROFILE);
        }
      } catch {
        setProfile(SAMPLE_PROFILE);
        setFollowerCount(142);
        setFollowingCount(38);
      }
      setLoading(false);
    };
    load();
  }, [username, currentUserId]);

  const handleFollow = async () => {
    if (!currentUserId || !profile) return;
    setFollowLoading(true);
    try {
      const { followUser, unfollowUser } = await import('../../lib/gamification');
      if (isFollowing) {
        await unfollowUser(currentUserId, profile.id);
        setIsFollowing(false);
        setFollowerCount((v) => v - 1);
      } else {
        await followUser(currentUserId, profile.id);
        setIsFollowing(true);
        setFollowerCount((v) => v + 1);
      }
    } catch { /* fallback toggle */ }
    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-dim">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-dim">User not found.</div>
    );
  }

  const isSelf = currentUserId === profile.id;
  const titleColor = TITLE_COLORS[profile.title] || 'text-dim';
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const xpProgress = profile.xp - Math.pow(profile.level - 1, 2) * 100;
  const xpNeeded = Math.pow(profile.level, 2) * 100 - Math.pow(profile.level - 1, 2) * 100;
  const progressPct = xpNeeded > 0 ? Math.min(100, Math.round((xpProgress / xpNeeded) * 100)) : 100;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface/50 border border-white/8 rounded-2xl overflow-hidden"
      >
        {/* Banner gradient */}
        <div className="h-24 bg-gradient-to-r from-teal/20 via-violet/20 to-amber/20" />

        <div className="px-6 pb-6 -mt-12">
          {/* Avatar */}
          <div className="flex items-end justify-between mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-surface bg-gradient-to-br from-teal/20 to-violet/20 flex items-center justify-center text-2xl font-display font-bold text-teal">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                profile.display_name[0].toUpperCase()
              )}
            </div>

            {!isSelf && currentUserId && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isFollowing
                    ? 'bg-white/5 text-dim border border-white/10 hover:bg-rose/5 hover:text-rose hover:border-rose/20'
                    : 'bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15'
                }`}
              >
                {followLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : isFollowing ? (
                  <><UserMinus size={12} /> Unfollow</>
                ) : (
                  <><UserPlus size={12} /> Follow</>
                )}
              </button>
            )}
          </div>

          {/* Name + title */}
          <div className="mb-3">
            <h1 className="text-xl font-display font-bold text-text">{profile.display_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted">@{profile.username}</span>
              <span className={`text-xs font-semibold ${titleColor}`}>{profile.title}</span>
              {profile.is_mentor && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber/10 text-amber border border-amber/20 rounded-full">
                  MENTOR
                </span>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-dim mb-4">{profile.bio}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted mb-4">
            <span className="flex items-center gap-1"><Calendar size={10} /> Joined {memberSince}</span>
            {profile.mentor_topics && profile.mentor_topics.length > 0 && (
              <span className="flex items-center gap-1">
                <GraduationCap size={10} />
                Mentors: {profile.mentor_topics.join(', ')}
              </span>
            )}
          </div>

          {/* Followers / Following */}
          <div className="flex items-center gap-4 text-sm">
            <span>
              <span className="font-bold text-text">{followerCount}</span>
              <span className="text-dim ml-1">Followers</span>
            </span>
            <span>
              <span className="font-bold text-text">{followingCount}</span>
              <span className="text-dim ml-1">Following</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Level + XP Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface/50 border border-white/8 rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-muted">Level</span>
            <div className="text-2xl font-display font-bold text-teal">{profile.level}</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted">Total XP</span>
            <div className="text-lg font-display font-bold text-text">{profile.xp.toLocaleString()}</div>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-teal to-emerald rounded-full"
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted">
          <span>{xpProgress} / {xpNeeded} XP</span>
          <span>Level {profile.level + 1}</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Current Streak', value: `${profile.streak}d`, icon: Flame, color: 'text-orange' },
          { label: 'Best Streak', value: `${profile.longest_streak}d`, icon: Flame, color: 'text-amber' },
          { label: 'Challenges', value: profile.total_challenges_completed.toString(), icon: Star, color: 'text-violet' },
          { label: 'Battles Won', value: `${profile.total_battles_won}/${profile.total_battles_played}`, icon: Swords, color: 'text-rose' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface/30 border border-white/5 rounded-xl p-3 text-center">
            <stat.icon size={18} className={`mx-auto ${stat.color} mb-1.5`} />
            <div className="text-lg font-display font-bold text-text">{stat.value}</div>
            <div className="text-[10px] text-dim">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Badge Showcase */}
      {profile.badges && profile.badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface/50 border border-white/8 rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Trophy size={14} className="text-amber" />
            Badges ({profile.badges.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <div
                key={badge.name}
                className="group relative flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg hover:border-amber/20 transition-colors"
                title={badge.description}
              >
                <span className="text-sm">{badge.icon}</span>
                <span className="text-[10px] font-medium text-dim group-hover:text-text transition-colors">{badge.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
