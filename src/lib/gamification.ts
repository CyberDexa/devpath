// ═══════════════════════════════════════
// SkillRoute — Gamification Engine
// XP rules, badge checker, streak manager,
// titles, notifications, and level system
// ═══════════════════════════════════════

import { supabase } from './supabase';

// ═══════════════════════════════════════
// XP & Level System (unified formulas)
// ═══════════════════════════════════════

/**
 * Calculate level from total XP.
 * Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 400 XP, Level n = (n-1)² × 100
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/** XP needed to reach a specific level */
export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

/** XP needed for the NEXT level from current XP */
export function xpToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = calculateLevel(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progress = nextLevelXp > currentLevelXp
    ? Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
    : 100;
  return { current: xp - currentLevelXp, needed: nextLevelXp - currentLevelXp, progress };
}

// ═══════════════════════════════════════
// XP Reward Rules
// ═══════════════════════════════════════

export const XP_REWARDS: Record<string, number> = {
  // Learning
  node_completed: 10,
  roadmap_started: 25,
  roadmap_completed: 500,
  quiz_completed: 30,
  review_session: 20,
  learning_plan_created: 15,

  // Coding
  project_submission: 50,
  project_passed: 100,
  code_executed: 2,
  tests_passed: 25,
  ai_review_received: 10,
  code_snapshot: 5,

  // Challenges
  daily_challenge_easy: 50,
  daily_challenge_medium: 75,
  daily_challenge_hard: 100,

  // Battles
  battle_won: 100,
  battle_lost: 25, // consolation XP
  battle_created: 10,

  // Social
  followed_user: 5,

  // Streaks (bonus multiplier applied separately)
  streak_bonus_7: 50,
  streak_bonus_14: 100,
  streak_bonus_30: 200,
  streak_bonus_60: 400,
  streak_bonus_100: 1000,
};

// ═══════════════════════════════════════
// Titles (earned at certain levels)
// ═══════════════════════════════════════

export const TITLES: { level: number; title: string; color: string }[] = [
  { level: 1, title: 'Beginner', color: '#6b7280' },
  { level: 3, title: 'Apprentice', color: '#8b5cf6' },
  { level: 5, title: 'Student', color: '#3b82f6' },
  { level: 8, title: 'Developer', color: '#06b6d4' },
  { level: 12, title: 'Skilled Developer', color: '#10b981' },
  { level: 16, title: 'Senior Developer', color: '#00e5a0' },
  { level: 20, title: 'Expert', color: '#f59e0b' },
  { level: 25, title: 'Master', color: '#f97316' },
  { level: 30, title: 'Grandmaster', color: '#ef4444' },
  { level: 40, title: 'Architect', color: '#ec4899' },
  { level: 50, title: 'Legend', color: '#fbbf24' },
];

export function getTitleForLevel(level: number): { title: string; color: string } {
  const title = [...TITLES].reverse().find((t) => level >= t.level);
  return title || TITLES[0];
}

// ═══════════════════════════════════════
// Streak Manager
// ═══════════════════════════════════════

/** Record today's activity and update streak */
export async function recordDailyActivity(userId: string, xpEarned: number = 0) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Upsert today's streak record
  const { error: streakError } = await supabase
    .from('user_streaks')
    .upsert(
      {
        user_id: userId,
        activity_date: today,
        activities_count: 1,
        xp_earned: xpEarned,
      },
      { onConflict: 'user_id,activity_date' }
    );
  if (streakError) console.error('Streak upsert error:', streakError);

  // Calculate current streak
  const streak = await calculateStreak(userId);

  // Update profile streak
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak, longest_streak')
    .eq('id', userId)
    .single();

  const longestStreak = Math.max(profile?.longest_streak || 0, streak);

  await supabase
    .from('profiles')
    .update({
      streak,
      longest_streak: longestStreak,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Check streak milestones
  const milestones = [7, 14, 30, 60, 100];
  for (const milestone of milestones) {
    if (streak === milestone) {
      const xpKey = `streak_bonus_${milestone}` as keyof typeof XP_REWARDS;
      const bonusXp = XP_REWARDS[xpKey] || 0;

      await supabase.from('activity_log').insert({
        user_id: userId,
        action: 'streak_milestone',
        metadata: { days: milestone, bonus_xp: bonusXp },
        xp_gained: bonusXp,
      });

      if (bonusXp > 0) {
        await addXpDirect(userId, bonusXp);
      }

      await createNotification(userId, 'streak_milestone',
        `${milestone}-Day Streak! 🔥`,
        `You've maintained a ${milestone}-day learning streak! +${bonusXp} bonus XP`,
        { days: milestone }
      );
    }
  }

  return streak;
}

/** Calculate consecutive days of activity */
async function calculateStreak(userId: string): Promise<number> {
  const { data: streaks, error } = await supabase
    .from('user_streaks')
    .select('activity_date')
    .eq('user_id', userId)
    .order('activity_date', { ascending: false })
    .limit(365);

  if (error || !streaks?.length) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (streaks.some((s: any) => s.activity_date === dateStr)) {
      streak++;
    } else if (i === 0) {
      // Today hasn't been active yet — check from yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

// ═══════════════════════════════════════
// Badge Engine
// ═══════════════════════════════════════

interface BadgeRequirement {
  type: string;
  count?: number;
  days?: number;
  value?: number;
  seconds?: number;
  name?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: BadgeRequirement;
  xp_reward: number;
}

/** Check all badges and award any newly earned ones */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  // Fetch all badges and user's already-earned badges
  const [{ data: allBadges }, { data: userBadges }] = await Promise.all([
    supabase.from('badges').select('*'),
    supabase.from('user_badges').select('badge_id').eq('user_id', userId),
  ]);

  if (!allBadges) return [];

  const earnedIds = new Set((userBadges || []).map((ub: any) => ub.badge_id));
  const unearned = (allBadges as Badge[]).filter((b) => !earnedIds.has(b.id));

  if (unearned.length === 0) return [];

  // Gather user stats for evaluation
  const stats = await getUserStats(userId);
  const newlyEarned: string[] = [];

  for (const badge of unearned) {
    if (evaluateBadgeRequirement(badge.requirement, stats)) {
      // Award badge
      const { error } = await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
      });

      if (!error) {
        newlyEarned.push(badge.name);

        // Award XP
        if (badge.xp_reward > 0) {
          await addXpDirect(userId, badge.xp_reward);
        }

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: userId,
          action: 'badge_earned',
          metadata: { badge_name: badge.name, badge_icon: badge.icon },
          xp_gained: badge.xp_reward,
        });

        // Notify
        await createNotification(userId, 'badge_earned',
          `Badge Earned: ${badge.icon} ${badge.name}`,
          badge.description,
          { badge_id: badge.id, xp_reward: badge.xp_reward }
        );
      }
    }
  }

  return newlyEarned;
}

/** Gather all stats needed for badge evaluation */
async function getUserStats(userId: string) {
  const [
    { data: profile },
    { data: roadmaps },
    { data: submissions },
    { data: challengeSubs },
    { data: battles },
    { data: follows },
    { data: followers },
    { data: activities },
    { data: streakData },
  ] = await Promise.all([
    supabase.from('profiles').select('level, streak, longest_streak, xp').eq('id', userId).single(),
    supabase.from('roadmap_progress').select('roadmap_id, completed_at').eq('user_id', userId),
    supabase.from('project_submissions').select('id, status, language').eq('user_id', userId),
    supabase.from('challenge_submissions').select('id, passed').eq('user_id', userId),
    supabase.from('code_battles').select('id, winner_id, status, started_at, completed_at')
      .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`),
    supabase.from('follows').select('id').eq('follower_id', userId),
    supabase.from('follows').select('id').eq('following_id', userId),
    supabase.from('activity_log').select('action, created_at').eq('user_id', userId),
    supabase.from('user_streaks').select('activity_date').eq('user_id', userId).order('activity_date', { ascending: false }),
  ]);

  const actionCounts: Record<string, number> = {};
  (activities || []).forEach((a: any) => {
    actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
  });

  const passedSubmissions = (submissions || []).filter((s: any) => s.status === 'passed');
  const uniqueLanguages = new Set((submissions || []).map((s: any) => s.language));
  const battlesWon = (battles || []).filter((b: any) => b.winner_id === userId && b.status === 'completed');
  const completedChallenges = (challengeSubs || []).filter((c: any) => c.passed);

  // Calculate challenge streak
  let challengeStreak = 0;
  if (streakData?.length) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      // Check if there was a challenge completion on this date
      if (completedChallenges.length > i) {
        challengeStreak++;
      } else break;
    }
  }

  return {
    level: profile?.level || 1,
    streak: profile?.streak || 0,
    longest_streak: profile?.longest_streak || 0,
    xp: profile?.xp || 0,
    roadmaps_started: roadmaps?.length || 0,
    roadmaps_completed: (roadmaps || []).filter((r: any) => r.completed_at).length,
    projects_submitted: submissions?.length || 0,
    projects_passed: passedSubmissions.length,
    unique_languages: uniqueLanguages.size,
    challenges_completed: completedChallenges.length,
    challenge_streak: challengeStreak,
    battles_won: battlesWon.length,
    battles_played: (battles || []).filter((b: any) => b.status === 'completed').length,
    following_count: follows?.length || 0,
    followers_count: followers?.length || 0,
    action_counts: actionCounts,
    is_mentor: false, // checked separately
  };
}

/** Evaluate a single badge requirement against user stats */
function evaluateBadgeRequirement(
  req: BadgeRequirement,
  stats: Awaited<ReturnType<typeof getUserStats>>
): boolean {
  switch (req.type) {
    case 'roadmap_started':
      return stats.roadmaps_started >= (req.count || 1);
    case 'roadmap_completed':
      return stats.roadmaps_completed >= (req.count || 1);
    case 'project_submitted':
      return stats.projects_submitted >= (req.count || 1);
    case 'project_passed':
      return stats.projects_passed >= (req.count || 1);
    case 'streak':
      return stats.longest_streak >= (req.days || 1);
    case 'level':
      return stats.level >= (req.value || 1);
    case 'challenge_completed':
      return stats.challenges_completed >= (req.count || 1);
    case 'challenge_streak':
      return stats.challenge_streak >= (req.days || 1);
    case 'battle_won':
      return stats.battles_won >= (req.count || 1);
    case 'following_count':
      return stats.following_count >= (req.count || 1);
    case 'followers_count':
      return stats.followers_count >= (req.count || 1);
    case 'unique_languages':
      return stats.unique_languages >= (req.count || 1);
    case 'code_executed':
      return (stats.action_counts['code_executed'] || 0) >= (req.count || 1);
    case 'ai_review_received':
      return (stats.action_counts['ai_review_received'] || 0) >= (req.count || 1);
    case 'special':
      // Special badges are awarded manually or via specific triggers
      return false;
    default:
      return false;
  }
}

// ═══════════════════════════════════════
// Notifications
// ═══════════════════════════════════════

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    metadata,
  });
  if (error) console.error('Notification error:', error);
}

export async function getNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) return 0;
  return count || 0;
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  const query = supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId);

  if (ids && ids.length > 0) {
    query.in('id', ids);
  }

  const { error } = await query;
  if (error) throw error;
}

// ═══════════════════════════════════════
// Social: Follows
// ═══════════════════════════════════════

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error('Cannot follow yourself');

  const { error } = await supabase.from('follows').insert({
    follower_id: followerId,
    following_id: followingId,
  });

  if (error) {
    if (error.code === '23505') return; // Already following
    throw error;
  }

  // Notify the followed user
  const { data: follower } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', followerId)
    .single();

  await createNotification(followingId, 'new_follower',
    'New Follower! 👋',
    `${follower?.display_name || 'Someone'} started following you`,
    { follower_id: followerId, follower_name: follower?.display_name }
  );

  // Award XP for following
  await supabase.from('activity_log').insert({
    user_id: followerId,
    action: 'followed_user',
    metadata: { following_id: followingId },
    xp_gained: XP_REWARDS.followed_user,
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  if (error) throw error;
}

export async function getFollowers(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, profiles!follows_follower_id_fkey(id, display_name, username, avatar_url, level, title)')
    .eq('following_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getFollowing(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id, profiles!follows_following_id_fkey(id, display_name, username, avatar_url, level, title)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();
  return !!data;
}

export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return { followers: followers || 0, following: following || 0 };
}

// ═══════════════════════════════════════
// Activity Feed
// ═══════════════════════════════════════

/** Get activity feed from followed users + own activity */
export async function getActivityFeed(userId: string, limit = 30) {
  // Get user's following list
  const { data: followList } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = (followList || []).map((f: any) => f.following_id);
  const allIds = [userId, ...followingIds];

  const { data, error } = await supabase
    .from('activity_log')
    .select('*, profiles!activity_log_user_id_fkey(display_name, username, avatar_url, level, title)')
    .in('user_id', allIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ═══════════════════════════════════════
// Daily Challenges
// ═══════════════════════════════════════

export async function getTodayChallenge() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('active_date', today)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getChallengeHistory(limit = 7) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .lte('active_date', today)
    .order('active_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function submitChallengeAttempt(
  userId: string,
  challengeId: string,
  code: string,
  language: string,
  passed: boolean,
  executionTimeMs?: number
) {
  const { data, error } = await supabase
    .from('challenge_submissions')
    .upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
        code,
        language,
        passed,
        execution_time_ms: executionTimeMs,
      },
      { onConflict: 'user_id,challenge_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserChallengeSubmission(userId: string, challengeId: string) {
  const { data, error } = await supabase
    .from('challenge_submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ═══════════════════════════════════════
// Code Battles
// ═══════════════════════════════════════

export async function createBattle(
  challengerId: string,
  title: string,
  description: string,
  starterCode: string,
  language: string,
  testCases: any[],
  difficulty: string,
  timeLimitSeconds: number = 900
) {
  const { data, error } = await supabase
    .from('code_battles')
    .insert({
      challenger_id: challengerId,
      challenge_title: title,
      challenge_description: description,
      starter_code: starterCode,
      language,
      test_cases: testCases,
      difficulty,
      time_limit_seconds: timeLimitSeconds,
      xp_reward: difficulty === 'hard' ? 150 : difficulty === 'medium' ? 100 : 75,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinBattle(battleId: string, opponentId: string) {
  const { data, error } = await supabase
    .from('code_battles')
    .update({
      opponent_id: opponentId,
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .eq('id', battleId)
    .eq('status', 'waiting')
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOpenBattles(limit = 10) {
  const { data, error } = await supabase
    .from('code_battles')
    .select('*, profiles!code_battles_challenger_id_fkey(display_name, username, avatar_url, level)')
    .eq('status', 'waiting')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getActiveBattles(userId: string) {
  const { data, error } = await supabase
    .from('code_battles')
    .select('*, profiles!code_battles_challenger_id_fkey(display_name, username, avatar_url, level)')
    .eq('status', 'active')
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function submitBattleSolution(
  battleId: string,
  userId: string,
  code: string,
  passed: boolean,
  testsPassed: number,
  testsTotal: number,
  executionTimeMs?: number
) {
  const { data, error } = await supabase
    .from('battle_submissions')
    .upsert(
      {
        battle_id: battleId,
        user_id: userId,
        code,
        passed,
        tests_passed: testsPassed,
        tests_total: testsTotal,
        execution_time_ms: executionTimeMs,
      },
      { onConflict: 'battle_id,user_id' }
    )
    .select()
    .single();

  if (error) throw error;

  // Check if both players have submitted — determine winner
  const { data: allSubs } = await supabase
    .from('battle_submissions')
    .select('*')
    .eq('battle_id', battleId);

  if (allSubs && allSubs.length === 2) {
    await resolveBattle(battleId, allSubs);
  }

  return data;
}

async function resolveBattle(battleId: string, submissions: any[]) {
  const [a, b] = submissions;
  let winnerId: string | null = null;

  // Winner: most tests passed → fastest time → first submit
  if (a.tests_passed !== b.tests_passed) {
    winnerId = a.tests_passed > b.tests_passed ? a.user_id : b.user_id;
  } else if (a.execution_time_ms !== b.execution_time_ms) {
    winnerId = (a.execution_time_ms || Infinity) < (b.execution_time_ms || Infinity) ? a.user_id : b.user_id;
  } else {
    winnerId = new Date(a.submitted_at) < new Date(b.submitted_at) ? a.user_id : b.user_id;
  }

  const loserId = winnerId === a.user_id ? b.user_id : a.user_id;

  // Update battle
  await supabase
    .from('code_battles')
    .update({
      status: 'completed',
      winner_id: winnerId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', battleId);

  // Fetch battle for XP
  const { data: battle } = await supabase
    .from('code_battles')
    .select('xp_reward')
    .eq('id', battleId)
    .single();

  const xpReward = battle?.xp_reward || 100;

  // Award XP
  await addXpDirect(winnerId, xpReward);
  await addXpDirect(loserId, XP_REWARDS.battle_lost);

  // Log activities
  await supabase.from('activity_log').insert([
    { user_id: winnerId, action: 'battle_won' as any, metadata: { battle_id: battleId }, xp_gained: xpReward },
    { user_id: loserId, action: 'battle_lost' as any, metadata: { battle_id: battleId }, xp_gained: XP_REWARDS.battle_lost },
  ]);

  // Notifications
  await createNotification(winnerId, 'battle_result', 'Battle Won! ⚔️',
    `You won the code battle! +${xpReward} XP`, { battle_id: battleId });
  await createNotification(loserId, 'battle_result', 'Battle Complete',
    `You completed the code battle. +${XP_REWARDS.battle_lost} XP`, { battle_id: battleId });

  // Update profile battle stats
  await Promise.all([
    supabase.rpc('increment_battle_stats', { p_user_id: winnerId, p_won: true }),
    supabase.rpc('increment_battle_stats', { p_user_id: loserId, p_won: false }),
  ].map(p => p.catch(() => {
    // RPC may not exist — update manually
  })));
}

// ═══════════════════════════════════════
// Enhanced Leaderboard
// ═══════════════════════════════════════

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all-time';
export type LeaderboardCategory = 'xp' | 'streak' | 'projects' | 'battles';

export async function getLeaderboard(
  period: LeaderboardPeriod = 'all-time',
  category: LeaderboardCategory = 'xp',
  limit = 50
) {
  if (period === 'all-time') {
    // Simple profile query with ordering
    const orderCol = category === 'streak' ? 'streak'
      : category === 'battles' ? 'total_battles_won'
      : category === 'projects' ? 'total_challenges_completed'
      : 'xp';

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url, xp, level, streak, title, total_battles_won, total_challenges_completed')
      .order(orderCol, { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Time-filtered: sum XP from activity_log within period
  const now = new Date();
  const startDate = period === 'weekly'
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: activities, error } = await supabase
    .from('activity_log')
    .select('user_id, xp_gained')
    .gte('created_at', startDate.toISOString())
    .gt('xp_gained', 0);

  if (error) throw error;

  // Aggregate XP per user
  const userXp: Record<string, number> = {};
  (activities || []).forEach((a: any) => {
    userXp[a.user_id] = (userXp[a.user_id] || 0) + a.xp_gained;
  });

  const sortedUserIds = Object.entries(userXp)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (sortedUserIds.length === 0) return [];

  // Fetch profiles for these users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url, xp, level, streak, title')
    .in('id', sortedUserIds);

  // Sort by period XP and attach period_xp
  return (profiles || [])
    .map((p: any) => ({ ...p, period_xp: userXp[p.id] || 0 }))
    .sort((a: any, b: any) => b.period_xp - a.period_xp);
}

// ═══════════════════════════════════════
// Direct XP add (bypasses logActivity to avoid recursion)
// ═══════════════════════════════════════

async function addXpDirect(userId: string, amount: number) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level, title')
    .eq('id', userId)
    .single();

  if (!profile) return;

  const newXp = (profile.xp || 0) + amount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > (profile.level || 1);
  const newTitle = getTitleForLevel(newLevel);

  const updates: any = { xp: newXp, level: newLevel };
  if (newTitle.title !== profile.title) {
    updates.title = newTitle.title;
  }

  await supabase.from('profiles').update(updates).eq('id', userId);

  if (leveledUp) {
    await createNotification(userId, 'level_up',
      `Level Up! 🎉`,
      `You've reached Level ${newLevel}!${newTitle.title !== profile.title ? ` New title: ${newTitle.title}` : ''}`,
      { level: newLevel, title: newTitle.title }
    );
  }
}

// ═══════════════════════════════════════
// User Profile (public view)
// ═══════════════════════════════════════

export async function getPublicProfile(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url, bio, location, website, github_username, twitter_handle, xp, level, streak, longest_streak, title, is_mentor, mentor_topics, created_at, total_battles_won, total_battles_played, total_challenges_completed')
    .eq('username', username)
    .single();

  if (error) throw error;
  return data;
}
