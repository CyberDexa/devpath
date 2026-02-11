// ═══════════════════════════════════════════════════════════
// DevPath — Analytics & Admin Services
// Phase 6: Tracking, billing, email, feature flags, admin
// ═══════════════════════════════════════════════════════════

import { supabase } from './supabase';

// ── Types ──

export type Plan = 'free' | 'pro' | 'teams';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'paused';
export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type EventCategory = 'navigation' | 'engagement' | 'learning' | 'social' | 'career' | 'billing' | 'system';
export type EmailType =
  | 'welcome' | 'streak_reminder' | 'weekly_digest' | 'achievement_earned'
  | 'subscription_confirmed' | 'subscription_canceled' | 'payment_receipt'
  | 'trial_ending' | 'new_follower' | 'battle_challenge' | 'job_match'
  | 'certificate_issued' | 'custom';
export type EmailStatus = 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_start: string | null;
  trial_end: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  session_id?: string;
  event_name: string;
  event_category?: EventCategory;
  properties?: Record<string, unknown>;
  device_type?: DeviceType;
  browser?: string;
  os?: string;
  referrer?: string;
  page_url?: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_percentage: number;
  allowed_plans: Plan[];
  metadata: Record<string, unknown>;
}

export interface EmailNotification {
  id: string;
  user_id: string;
  email_type: EmailType;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  status: EmailStatus;
  provider: string;
  sent_at: string | null;
  created_at: string;
}

export interface DailyStats {
  day: string;
  active_users: number;
  total_events: number;
}

export interface LearningMetrics {
  day: string;
  topics_completed: number;
  projects_submitted: number;
  quizzes_taken: number;
  reviews_completed: number;
  challenges_completed: number;
  verifications_passed: number;
  unique_learners: number;
}

export interface RevenueMetrics {
  month: string;
  successful_payments: number;
  total_revenue_cents: number;
  paying_users: number;
}

export interface PlatformOverview {
  totalUsers: number;
  activeToday: number;
  proSubscribers: number;
  teamsSubscribers: number;
  monthlyRevenue: number;
  totalProjects: number;
  totalBadgesEarned: number;
  avgSessionMinutes: number;
}

// ── Session Management ──

let currentSessionId: string | null = null;

function getSessionId(): string {
  if (currentSessionId) return currentSessionId;
  currentSessionId = typeof window !== 'undefined'
    ? sessionStorage.getItem('dp_session_id') || generateSessionId()
    : generateSessionId();
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('dp_session_id', currentSessionId);
  }
  return currentSessionId;
}

function generateSessionId(): string {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
}

function detectOS(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}

// ══════════════════════════════════
// ANALYTICS TRACKING
// ══════════════════════════════════

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('analytics_events').insert({
      user_id: event.user_id || user?.id || null,
      session_id: event.session_id || getSessionId(),
      event_name: event.event_name,
      event_category: event.event_category || 'engagement',
      properties: event.properties || {},
      device_type: event.device_type || detectDevice(),
      browser: event.browser || detectBrowser(),
      os: event.os || detectOS(),
      referrer: event.referrer || (typeof document !== 'undefined' ? document.referrer : null),
      page_url: event.page_url || (typeof window !== 'undefined' ? window.location.pathname : null),
    });
  } catch (e) {
    console.warn('Analytics tracking failed:', e);
  }
}

export async function trackPageView(pagePath: string, pageTitle?: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('page_views').insert({
      user_id: user?.id || null,
      session_id: getSessionId(),
      page_path: pagePath,
      page_title: pageTitle || (typeof document !== 'undefined' ? document.title : null),
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      device_type: detectDevice(),
    });
  } catch (e) {
    console.warn('Page view tracking failed:', e);
  }
}

export async function trackPageDuration(pagePath: string, durationMs: number): Promise<void> {
  try {
    await supabase.from('page_views').update({ duration_ms: durationMs })
      .eq('session_id', getSessionId())
      .eq('page_path', pagePath)
      .order('created_at', { ascending: false })
      .limit(1);
  } catch (e) {
    console.warn('Duration tracking failed:', e);
  }
}

// Convenience wrappers for common events
export const track = {
  roadmapViewed: (roadmapId: string) =>
    trackEvent({ event_name: 'roadmap_viewed', event_category: 'learning', properties: { roadmap_id: roadmapId } }),
  topicCompleted: (topicId: string, roadmapId: string) =>
    trackEvent({ event_name: 'topic_completed', event_category: 'learning', properties: { topic_id: topicId, roadmap_id: roadmapId } }),
  projectStarted: (projectId: string) =>
    trackEvent({ event_name: 'project_started', event_category: 'learning', properties: { project_id: projectId } }),
  projectSubmitted: (projectId: string, score: number) =>
    trackEvent({ event_name: 'project_submitted', event_category: 'learning', properties: { project_id: projectId, score } }),
  codeExecuted: (language: string) =>
    trackEvent({ event_name: 'code_executed', event_category: 'engagement', properties: { language } }),
  aiTutorAsked: (topic: string) =>
    trackEvent({ event_name: 'ai_tutor_asked', event_category: 'engagement', properties: { topic } }),
  challengeCompleted: (challengeId: string, score: number) =>
    trackEvent({ event_name: 'challenge_completed', event_category: 'engagement', properties: { challenge_id: challengeId, score } }),
  battleJoined: (battleId: string) =>
    trackEvent({ event_name: 'battle_joined', event_category: 'social', properties: { battle_id: battleId } }),
  jobApplied: (jobId: string) =>
    trackEvent({ event_name: 'job_applied', event_category: 'career', properties: { job_id: jobId } }),
  subscriptionClicked: (plan: Plan) =>
    trackEvent({ event_name: 'subscription_clicked', event_category: 'billing', properties: { plan } }),
  signupCompleted: (method: string) =>
    trackEvent({ event_name: 'signup_completed', event_category: 'system', properties: { method } }),
  featureUsed: (feature: string) =>
    trackEvent({ event_name: 'feature_used', event_category: 'engagement', properties: { feature } }),
};

// ══════════════════════════════════
// ANALYTICS QUERIES (Dashboard)
// ══════════════════════════════════

export async function getPlatformOverview(): Promise<PlatformOverview> {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles').select('*', { count: 'exact', head: true });

    // Active today
    const today = new Date().toISOString().split('T')[0];
    const { count: activeToday } = await supabase
      .from('analytics_events').select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    // Pro subscribers
    const { count: proSubscribers } = await supabase
      .from('subscriptions').select('*', { count: 'exact', head: true })
      .eq('plan', 'pro').eq('status', 'active');

    // Teams subscribers
    const { count: teamsSubscribers } = await supabase
      .from('subscriptions').select('*', { count: 'exact', head: true })
      .eq('plan', 'teams').eq('status', 'active');

    // Monthly revenue (current month)
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: payments } = await supabase
      .from('payments').select('amount')
      .eq('status', 'succeeded')
      .gte('created_at', monthStart);
    const monthlyRevenue = (payments || []).reduce((sum, p) => sum + p.amount, 0);

    // Total projects submitted
    const { count: totalProjects } = await supabase
      .from('project_submissions').select('*', { count: 'exact', head: true });

    // Total badges earned
    const { count: totalBadgesEarned } = await supabase
      .from('user_badges').select('*', { count: 'exact', head: true });

    return {
      totalUsers: totalUsers || 0,
      activeToday: activeToday || 0,
      proSubscribers: proSubscribers || 0,
      teamsSubscribers: teamsSubscribers || 0,
      monthlyRevenue,
      totalProjects: totalProjects || 0,
      totalBadgesEarned: totalBadgesEarned || 0,
      avgSessionMinutes: 0, // computed from page_views
    };
  } catch {
    return { totalUsers: 0, activeToday: 0, proSubscribers: 0, teamsSubscribers: 0, monthlyRevenue: 0, totalProjects: 0, totalBadgesEarned: 0, avgSessionMinutes: 0 };
  }
}

export async function getDailyActiveUsers(days: number = 30): Promise<DailyStats[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('analytics_events')
    .select('created_at, user_id')
    .gte('created_at', since)
    .not('user_id', 'is', null);

  // Group by day
  const dayMap = new Map<string, Set<string>>();
  const countMap = new Map<string, number>();
  for (const row of data || []) {
    const day = row.created_at.split('T')[0];
    if (!dayMap.has(day)) dayMap.set(day, new Set());
    dayMap.get(day)!.add(row.user_id);
    countMap.set(day, (countMap.get(day) || 0) + 1);
  }

  return Array.from(dayMap.entries())
    .map(([day, users]) => ({ day, active_users: users.size, total_events: countMap.get(day) || 0 }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export async function getLearningMetrics(days: number = 30): Promise<LearningMetrics[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('activity_log')
    .select('action, user_id, created_at')
    .gte('created_at', since);

  const dayMap = new Map<string, LearningMetrics>();
  for (const row of data || []) {
    const day = row.created_at.split('T')[0];
    if (!dayMap.has(day)) {
      dayMap.set(day, { day, topics_completed: 0, projects_submitted: 0, quizzes_taken: 0, reviews_completed: 0, challenges_completed: 0, verifications_passed: 0, unique_learners: 0 });
    }
    const m = dayMap.get(day)!;
    switch (row.action) {
      case 'topic_completed': m.topics_completed++; break;
      case 'project_submitted': m.projects_submitted++; break;
      case 'quiz_taken': m.quizzes_taken++; break;
      case 'review_completed': m.reviews_completed++; break;
      case 'challenge_completed': m.challenges_completed++; break;
      case 'verification_passed': m.verifications_passed++; break;
    }
  }

  return Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day));
}

export async function getTopPages(days: number = 7, limit: number = 20): Promise<{ path: string; views: number; unique_users: number }[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('page_views')
    .select('page_path, user_id')
    .gte('created_at', since);

  const pageMap = new Map<string, { views: number; users: Set<string> }>();
  for (const row of data || []) {
    if (!pageMap.has(row.page_path)) pageMap.set(row.page_path, { views: 0, users: new Set() });
    const p = pageMap.get(row.page_path)!;
    p.views++;
    if (row.user_id) p.users.add(row.user_id);
  }

  return Array.from(pageMap.entries())
    .map(([path, d]) => ({ path, views: d.views, unique_users: d.users.size }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getEventBreakdown(days: number = 7): Promise<{ event_name: string; count: number; category: string }[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('analytics_events')
    .select('event_name, event_category')
    .gte('created_at', since);

  const eventMap = new Map<string, { count: number; category: string }>();
  for (const row of data || []) {
    if (!eventMap.has(row.event_name)) eventMap.set(row.event_name, { count: 0, category: row.event_category || 'other' });
    eventMap.get(row.event_name)!.count++;
  }

  return Array.from(eventMap.entries())
    .map(([event_name, d]) => ({ event_name, count: d.count, category: d.category }))
    .sort((a, b) => b.count - a.count);
}

// ══════════════════════════════════
// USER ANALYTICS (personal dashboard)
// ══════════════════════════════════

export interface UserAnalytics {
  totalTopicsCompleted: number;
  totalProjectsSubmitted: number;
  totalQuizzesTaken: number;
  totalReviewsDone: number;
  totalChallengesCompleted: number;
  totalBattlesWon: number;
  totalCertificatesEarned: number;
  currentStreak: number;
  longestStreak: number;
  topRoadmaps: { roadmap_id: string; topics_completed: number }[];
  weeklyActivity: { day: string; count: number }[];
  skillBreakdown: { skill: string; proficiency: number }[];
}

export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  try {
    const { data: activities } = await supabase
      .from('activity_log')
      .select('action, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const acts = activities || [];
    const topicsCompleted = acts.filter(a => a.action === 'topic_completed').length;
    const projectsSubmitted = acts.filter(a => a.action === 'project_submitted').length;
    const quizzesTaken = acts.filter(a => a.action === 'quiz_taken').length;
    const reviewsDone = acts.filter(a => a.action === 'review_completed').length;
    const challengesCompleted = acts.filter(a => a.action === 'challenge_completed').length;
    const battlesWon = acts.filter(a => a.action === 'battle_won').length;
    const certificatesEarned = acts.filter(a => a.action === 'certificate_earned').length;

    // Streak
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .single();

    // Weekly activity (last 7 days)
    const weeklyActivity: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayStr = d.toISOString().split('T')[0];
      const count = acts.filter(a => a.created_at.startsWith(dayStr)).length;
      weeklyActivity.push({ day: dayStr, count });
    }

    // Top roadmaps
    const roadmapCounts = new Map<string, number>();
    for (const a of acts) {
      if (a.action === 'topic_completed' && a.metadata?.roadmap_id) {
        const rid = a.metadata.roadmap_id as string;
        roadmapCounts.set(rid, (roadmapCounts.get(rid) || 0) + 1);
      }
    }
    const topRoadmaps = Array.from(roadmapCounts.entries())
      .map(([roadmap_id, topics_completed]) => ({ roadmap_id, topics_completed }))
      .sort((a, b) => b.topics_completed - a.topics_completed)
      .slice(0, 5);

    // Skills
    const { data: skills } = await supabase
      .from('user_skills')
      .select('node_id, proficiency')
      .eq('user_id', userId)
      .order('proficiency', { ascending: false })
      .limit(10);

    return {
      totalTopicsCompleted: topicsCompleted,
      totalProjectsSubmitted: projectsSubmitted,
      totalQuizzesTaken: quizzesTaken,
      totalReviewsDone: reviewsDone,
      totalChallengesCompleted: challengesCompleted,
      totalBattlesWon: battlesWon,
      totalCertificatesEarned: certificatesEarned,
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      topRoadmaps,
      weeklyActivity,
      skillBreakdown: (skills || []).map(s => ({ skill: s.node_id, proficiency: s.proficiency })),
    };
  } catch {
    return {
      totalTopicsCompleted: 0, totalProjectsSubmitted: 0, totalQuizzesTaken: 0,
      totalReviewsDone: 0, totalChallengesCompleted: 0, totalBattlesWon: 0,
      totalCertificatesEarned: 0, currentStreak: 0, longestStreak: 0,
      topRoadmaps: [], weeklyActivity: [], skillBreakdown: [],
    };
  }
}

// ══════════════════════════════════
// SUBSCRIPTION & BILLING
// ══════════════════════════════════

// Plan limits
export const PLAN_LIMITS: Record<Plan, {
  roadmaps: number;
  aiQuestions: number;
  projects: number;
  ide: boolean;
  personalizedPaths: boolean;
  analytics: boolean;
  career: boolean;
  teamDashboard: boolean;
}> = {
  free: { roadmaps: 3, aiQuestions: 10, projects: 5, ide: false, personalizedPaths: false, analytics: false, career: false, teamDashboard: false },
  pro: { roadmaps: Infinity, aiQuestions: Infinity, projects: Infinity, ide: true, personalizedPaths: true, analytics: true, career: true, teamDashboard: false },
  teams: { roadmaps: Infinity, aiQuestions: Infinity, projects: Infinity, ide: true, personalizedPaths: true, analytics: true, career: true, teamDashboard: true },
};

export const PLAN_PRICES: Record<Plan, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  pro: { monthly: 1200, annual: 1000 }, // cents
  teams: { monthly: 2900, annual: 2400 },
};

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const sub = await getUserSubscription(userId);
  if (!sub) return 'free';
  if (sub.status === 'active' || sub.status === 'trialing') return sub.plan;
  return 'free';
}

export function canAccessFeature(plan: Plan, feature: keyof typeof PLAN_LIMITS['free']): boolean {
  return !!PLAN_LIMITS[plan][feature];
}

export function getRemainingQuota(plan: Plan, feature: keyof typeof PLAN_LIMITS['free'], used: number): number {
  const limit = PLAN_LIMITS[plan][feature];
  if (typeof limit === 'boolean') return limit ? Infinity : 0;
  if (limit === Infinity) return Infinity;
  return Math.max(0, (limit as number) - used);
}

// Stripe checkout session (client-side redirect)
export function getCheckoutUrl(plan: Plan, cycle: BillingCycle): string {
  // In production, this would create a Stripe Checkout session via API
  // For now, return a mock URL
  const priceId = plan === 'pro'
    ? (cycle === 'monthly' ? 'price_pro_monthly' : 'price_pro_annual')
    : (cycle === 'monthly' ? 'price_teams_monthly' : 'price_teams_annual');
  return `/api/checkout?price_id=${priceId}`;
}

export function getCustomerPortalUrl(): string {
  return '/api/billing-portal';
}

export async function getPaymentHistory(userId: string): Promise<Payment[]> {
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return data || [];
}

// ══════════════════════════════════
// EMAIL NOTIFICATIONS
// ══════════════════════════════════

const EMAIL_TEMPLATES: Record<EmailType, { subject: string; body: (data: Record<string, string>) => string }> = {
  welcome: {
    subject: 'Welcome to DevPath!',
    body: (d) => `<h1>Welcome, ${d.name}!</h1><p>You've just joined DevPath — the AI-powered developer career platform. Start by picking a roadmap and tracking your progress.</p><a href="https://devpath-phi.vercel.app/roadmaps">Explore Roadmaps</a>`,
  },
  streak_reminder: {
    subject: "Don't break your streak!",
    body: (d) => `<h1>🔥 ${d.streak}-day streak!</h1><p>You've been on fire lately. Don't break it — log in today to keep your streak alive!</p><a href="https://devpath-phi.vercel.app/challenges">Continue Learning</a>`,
  },
  weekly_digest: {
    subject: 'Your weekly DevPath digest',
    body: (d) => `<h1>📊 Weekly Recap</h1><p>This week you completed <strong>${d.topics}</strong> topics, submitted <strong>${d.projects}</strong> projects, and earned <strong>${d.xp}</strong> XP. Keep it up!</p>`,
  },
  achievement_earned: {
    subject: 'New achievement unlocked!',
    body: (d) => `<h1>🏆 ${d.badge_name}</h1><p>Congratulations! You've earned the "${d.badge_name}" badge. Check your profile to see all your achievements.</p>`,
  },
  subscription_confirmed: {
    subject: 'Your DevPath Pro subscription is active',
    body: (d) => `<h1>✅ Subscription confirmed</h1><p>Welcome to DevPath ${d.plan}! You now have access to unlimited AI tutor, all projects, advanced analytics, and career tools.</p>`,
  },
  subscription_canceled: {
    subject: 'Subscription canceled',
    body: (d) => `<h1>Your subscription was canceled</h1><p>Your ${d.plan} plan will remain active until ${d.end_date}. You can resubscribe anytime from Settings.</p>`,
  },
  payment_receipt: {
    subject: 'Payment receipt',
    body: (d) => `<h1>💳 Payment received</h1><p>Amount: <strong>$${d.amount}</strong><br/>Date: ${d.date}<br/>Invoice: ${d.invoice_id}</p>`,
  },
  trial_ending: {
    subject: 'Your free trial ends soon',
    body: (d) => `<h1>⏰ Trial ending in ${d.days} days</h1><p>Upgrade now to keep all your Pro features. Your progress will be saved either way.</p>`,
  },
  new_follower: {
    subject: 'You have a new follower!',
    body: (d) => `<h1>👤 ${d.follower_name} followed you</h1><p>Check out their profile and follow them back to see their activity in your feed.</p>`,
  },
  battle_challenge: {
    subject: 'You\'ve been challenged!',
    body: (d) => `<h1>⚔️ Code Battle Challenge</h1><p>${d.challenger_name} has challenged you to a code battle. Accept the challenge and prove your skills!</p>`,
  },
  job_match: {
    subject: 'New jobs matching your skills',
    body: (d) => `<h1>💼 ${d.count} new job matches</h1><p>We found ${d.count} new positions that match your verified skills. Check them out on the job board.</p>`,
  },
  certificate_issued: {
    subject: 'Certificate issued!',
    body: (d) => `<h1>📜 Certificate: ${d.cert_name}</h1><p>Your certificate (${d.cert_number}) is ready. Share it with employers or add it to your portfolio.</p>`,
  },
  custom: {
    subject: 'DevPath Update',
    body: (d) => d.body || '<p>You have a new notification from DevPath.</p>',
  },
};

export async function queueEmail(
  userId: string,
  emailType: EmailType,
  templateData: Record<string, string> = {},
  scheduledFor?: Date
): Promise<string | null> {
  try {
    const template = EMAIL_TEMPLATES[emailType];
    const { data, error } = await supabase.from('email_notifications').insert({
      user_id: userId,
      email_type: emailType,
      subject: template.subject,
      body_html: template.body(templateData),
      body_text: template.body(templateData).replace(/<[^>]+>/g, ''),
      status: 'queued',
      scheduled_for: scheduledFor?.toISOString() || new Date().toISOString(),
    }).select('id').single();

    if (error) throw error;
    return data?.id || null;
  } catch (e) {
    console.error('Failed to queue email:', e);
    return null;
  }
}

export async function getUserEmailHistory(userId: string): Promise<EmailNotification[]> {
  const { data } = await supabase
    .from('email_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return data || [];
}

export async function updateEmailPreferences(
  userId: string,
  prefs: { weekly_digest?: boolean; streak_reminders?: boolean; achievement_notifications?: boolean; marketing?: boolean }
): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_preferences')
    .eq('id', userId)
    .single();

  await supabase.from('profiles').update({
    email_preferences: { ...(profile?.email_preferences || {}), ...prefs },
  }).eq('id', userId);
}

// ══════════════════════════════════
// FEATURE FLAGS
// ══════════════════════════════════

let flagCache: FeatureFlag[] | null = null;
let flagCacheTime = 0;
const FLAG_CACHE_TTL = 60000; // 1 minute

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  if (flagCache && Date.now() - flagCacheTime < FLAG_CACHE_TTL) return flagCache;
  const { data } = await supabase.from('feature_flags').select('*');
  flagCache = data || [];
  flagCacheTime = Date.now();
  return flagCache;
}

export async function isFeatureEnabled(flagName: string, userPlan: Plan = 'free'): Promise<boolean> {
  const flags = await getFeatureFlags();
  const flag = flags.find(f => f.name === flagName);
  if (!flag || !flag.enabled) return false;
  if (!flag.allowed_plans.includes(userPlan)) return false;
  if (flag.rollout_percentage < 100) {
    // Simple hash-based rollout
    const hash = flagName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100;
    return hash < flag.rollout_percentage;
  }
  return true;
}

// ══════════════════════════════════
// ADMIN
// ══════════════════════════════════

export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return data?.is_admin || false;
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  });
}

export async function getAllUsers(
  page: number = 1,
  limit: number = 50,
  search?: string
): Promise<{ users: Record<string, unknown>[]; total: number }> {
  let query = supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, xp, level, plan, is_admin, created_at, last_seen_at', { count: 'exact' });

  if (search) {
    query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
  }

  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  return { users: data || [], total: count || 0 };
}

export async function getRevenueMetrics(): Promise<{
  mrr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
}> {
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('plan, billing_cycle')
    .in('status', ['active', 'trialing']);

  let mrr = 0;
  for (const sub of activeSubs || []) {
    const price = PLAN_PRICES[sub.plan as Plan];
    mrr += sub.billing_cycle === 'annual' ? price.annual : price.monthly;
  }

  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'succeeded');
  const totalRevenue = (allPayments || []).reduce((s, p) => s + p.amount, 0);

  // Churn: canceled in last 30 days / total active
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { count: canceledCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'canceled')
    .gte('updated_at', thirtyDaysAgo);

  const totalActive = (activeSubs || []).length;
  const churnRate = totalActive > 0 ? (canceledCount || 0) / (totalActive + (canceledCount || 0)) * 100 : 0;

  return {
    mrr,
    totalRevenue,
    activeSubscriptions: totalActive,
    churnRate: Math.round(churnRate * 10) / 10,
  };
}

export async function getAuditLog(limit: number = 100): Promise<Record<string, unknown>[]> {
  const { data } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}
