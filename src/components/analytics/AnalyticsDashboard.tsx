import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, BookOpen, Code, Trophy, Target, Flame, Calendar, ChevronDown } from 'lucide-react';
import type { UserAnalytics } from '../../lib/analytics';
import { getUserAnalytics } from '../../lib/analytics';
import { supabase } from '../../lib/supabase';

type TimeRange = '7d' | '30d' | '90d';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const data = await getUserAnalytics(user.id);
        setAnalytics(data);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[var(--color-surface)] border border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!userId || !analytics) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <BarChart3 className="w-16 h-16 text-[var(--color-muted)] mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl text-[var(--color-bright)] mb-2">Sign in to view analytics</h2>
        <p className="text-[var(--color-dim)]">Track your learning progress with detailed insights.</p>
      </div>
    );
  }

  const stats = [
    { label: 'Topics Completed', value: analytics.totalTopicsCompleted, icon: BookOpen, color: 'teal' },
    { label: 'Projects Submitted', value: analytics.totalProjectsSubmitted, icon: Code, color: 'sky' },
    { label: 'Quizzes Taken', value: analytics.totalQuizzesTaken, icon: Target, color: 'violet' },
    { label: 'Challenges Done', value: analytics.totalChallengesCompleted, icon: Trophy, color: 'amber' },
    { label: 'Battles Won', value: analytics.totalBattlesWon, icon: Flame, color: 'rose' },
    { label: 'Certificates', value: analytics.totalCertificatesEarned, icon: BarChart3, color: 'teal' },
    { label: 'Current Streak', value: `${analytics.currentStreak}d`, icon: Flame, color: 'amber' },
    { label: 'Longest Streak', value: `${analytics.longestStreak}d`, icon: Calendar, color: 'violet' },
  ];

  const maxActivity = Math.max(...analytics.weeklyActivity.map(d => d.count), 1);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--color-bright)]">Learning Analytics</h1>
          <p className="text-[var(--color-dim)] mt-1">Track your progress and identify areas to improve.</p>
        </div>
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="appearance-none bg-[var(--color-surface)] border border-white/8 rounded-lg px-4 py-2 pr-8 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)]/30"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-dim)] pointer-events-none" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-5 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 text-[var(--color-${stat.color})]`} />
                <TrendingUp className="w-3.5 h-3.5 text-[var(--color-teal)]" />
              </div>
              <p className="font-display font-bold text-2xl text-[var(--color-bright)]">{stat.value}</p>
              <p className="text-xs text-[var(--color-dim)] mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Weekly Activity Chart */}
      <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6 mb-8">
        <h2 className="font-display font-bold text-lg text-[var(--color-bright)] mb-6">Weekly Activity</h2>
        <div className="flex items-end gap-2 h-40">
          {analytics.weeklyActivity.map((day, i) => {
            const height = maxActivity > 0 ? (day.count / maxActivity) * 100 : 0;
            const date = new Date(day.day);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-[var(--color-dim)]">{day.count}</span>
                <div className="w-full relative rounded-t-md overflow-hidden" style={{ height: `${Math.max(height, 4)}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-teal)]/60 to-[var(--color-teal)]" />
                </div>
                <span className="text-[10px] text-[var(--color-subtle)]">{dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Roadmaps */}
        <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
          <h2 className="font-display font-bold text-lg text-[var(--color-bright)] mb-4">Top Roadmaps</h2>
          {analytics.topRoadmaps.length === 0 ? (
            <p className="text-sm text-[var(--color-dim)]">No roadmap activity yet. Start a roadmap to see progress here!</p>
          ) : (
            <div className="space-y-4">
              {analytics.topRoadmaps.map((rm) => {
                const maxTopics = Math.max(...analytics.topRoadmaps.map(r => r.topics_completed), 1);
                const pct = (rm.topics_completed / maxTopics) * 100;
                return (
                  <div key={rm.roadmap_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[var(--color-text)] capitalize">{rm.roadmap_id.replace(/-/g, ' ')}</span>
                      <span className="text-xs text-[var(--color-dim)]">{rm.topics_completed} topics</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-abyss)]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-sky)] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill Breakdown */}
        <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
          <h2 className="font-display font-bold text-lg text-[var(--color-bright)] mb-4">Skill Proficiency</h2>
          {analytics.skillBreakdown.length === 0 ? (
            <p className="text-sm text-[var(--color-dim)]">Take a skill assessment to see your proficiency breakdown.</p>
          ) : (
            <div className="space-y-3">
              {analytics.skillBreakdown.map((skill) => {
                const getColor = (p: number) =>
                  p >= 80 ? 'var(--color-teal)' : p >= 60 ? 'var(--color-sky)' : p >= 40 ? 'var(--color-amber)' : 'var(--color-rose)';
                return (
                  <div key={skill.skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--color-text)] capitalize">{skill.skill.replace(/-/g, ' ')}</span>
                      <span className="text-xs font-mono" style={{ color: getColor(skill.proficiency) }}>{skill.proficiency}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-abyss)]">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${skill.proficiency}%`, backgroundColor: getColor(skill.proficiency) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
        <h2 className="font-display font-bold text-lg text-[var(--color-bright)] mb-4">💡 Insights & Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {generateInsights(analytics).map((insight, i) => (
            <div key={i} className="rounded-lg bg-[var(--color-abyss)] border border-white/3 p-4">
              <span className="text-lg mb-2 block">{insight.emoji}</span>
              <p className="text-sm text-[var(--color-text)] font-medium mb-1">{insight.title}</p>
              <p className="text-xs text-[var(--color-dim)]">{insight.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateInsights(analytics: UserAnalytics): { emoji: string; title: string; desc: string }[] {
  const insights: { emoji: string; title: string; desc: string }[] = [];

  if (analytics.currentStreak > 0 && analytics.currentStreak < analytics.longestStreak) {
    insights.push({ emoji: '🔥', title: 'Keep your streak!', desc: `You're ${analytics.longestStreak - analytics.currentStreak} days away from your best streak. Don't stop now!` });
  }

  if (analytics.totalChallengesCompleted === 0) {
    insights.push({ emoji: '🎯', title: 'Try daily challenges', desc: 'Daily coding challenges are a great way to build consistency and earn XP.' });
  }

  if (analytics.totalProjectsSubmitted < 3) {
    insights.push({ emoji: '🚀', title: 'Build more projects', desc: 'Hands-on projects help solidify your learning. Try completing at least 3 this month.' });
  }

  if (analytics.totalCertificatesEarned === 0) {
    insights.push({ emoji: '📜', title: 'Get certified', desc: 'Verify your skills to earn certificates. They strengthen your portfolio and resume.' });
  }

  const weakSkills = analytics.skillBreakdown.filter(s => s.proficiency < 50);
  if (weakSkills.length > 0) {
    insights.push({ emoji: '📚', title: 'Focus on fundamentals', desc: `Skills like ${weakSkills[0].skill.replace(/-/g, ' ')} need attention. Review the related roadmap topics.` });
  }

  if (analytics.totalBattlesWon === 0) {
    insights.push({ emoji: '⚔️', title: 'Join a code battle', desc: 'Code battles are a fun way to test your skills against others and earn XP.' });
  }

  // Ensure at least 3 insights
  if (insights.length < 3) {
    insights.push({ emoji: '⭐', title: 'Stay consistent', desc: 'Regular daily practice — even 15 minutes — compounds into massive skill growth over time.' });
  }

  return insights.slice(0, 3);
}
