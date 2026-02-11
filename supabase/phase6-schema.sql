-- ═══════════════════════════════════════════════════════════
-- SkillRoute Phase 6: Polish & Scale — Database Schema
-- Tables: subscriptions, payments, analytics_events,
--         page_views, email_notifications, feature_flags,
--         admin_audit_log
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════
-- 1. Subscriptions (Stripe-backed)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'teams')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'paused')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════
-- 2. Payments (transaction history)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL, -- cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 3. Analytics Events (custom tracking)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_category TEXT CHECK (event_category IN ('navigation', 'engagement', 'learning', 'social', 'career', 'billing', 'system')),
  properties JSONB DEFAULT '{}',
  device_type TEXT CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  browser TEXT,
  os TEXT,
  referrer TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════
-- 4. Page Views (lightweight tracking)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  duration_ms INTEGER, -- time on page
  device_type TEXT CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX idx_page_views_user ON page_views(user_id);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own page views"
  ON page_views FOR SELECT
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 5. Email Notifications (outbound log)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN (
    'welcome', 'streak_reminder', 'weekly_digest', 'achievement_earned',
    'subscription_confirmed', 'subscription_canceled', 'payment_receipt',
    'trial_ending', 'new_follower', 'battle_challenge', 'job_match',
    'certificate_issued', 'custom'
  )),
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'failed')),
  provider TEXT DEFAULT 'resend' CHECK (provider IN ('resend', 'sendgrid', 'ses')),
  provider_message_id TEXT,
  metadata JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_notifications_user ON email_notifications(user_id);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
CREATE INDEX idx_email_notifications_type ON email_notifications(email_type);
CREATE INDEX idx_email_notifications_scheduled ON email_notifications(scheduled_for) WHERE status = 'queued';

ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emails"
  ON email_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 6. Feature Flags (admin-controlled)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  allowed_plans TEXT[] DEFAULT ARRAY['free', 'pro', 'teams'],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feature flags"
  ON feature_flags FOR SELECT
  USING (true);

-- ═══════════════════════════════════════
-- 7. Admin Audit Log
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT CHECK (target_type IN ('user', 'subscription', 'feature_flag', 'job_listing', 'challenge', 'badge', 'system')),
  target_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_action ON admin_audit_log(action);
CREATE INDEX idx_admin_audit_created ON admin_audit_log(created_at DESC);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit log
CREATE POLICY "Service role manages audit log"
  ON admin_audit_log FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════
-- 8. Profile extensions for billing
-- ═══════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'teams'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"weekly_digest": true, "streak_reminders": true, "achievement_notifications": true, "marketing": false}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- ═══════════════════════════════════════
-- 9. Seed feature flags
-- ═══════════════════════════════════════

INSERT INTO feature_flags (name, description, enabled, rollout_percentage, allowed_plans)
VALUES
  ('ai_tutor_v2', 'Enhanced AI tutor with streaming responses', true, 100, ARRAY['free', 'pro', 'teams']),
  ('code_battles', 'Live 1v1 code battles', true, 100, ARRAY['free', 'pro', 'teams']),
  ('mock_interviews', 'AI-powered mock interviews', true, 100, ARRAY['pro', 'teams']),
  ('resume_builder', 'AI resume builder', true, 100, ARRAY['pro', 'teams']),
  ('job_matching', 'AI job matching algorithm', true, 100, ARRAY['pro', 'teams']),
  ('portfolio_builder', 'Public portfolio generator', true, 100, ARRAY['free', 'pro', 'teams']),
  ('advanced_analytics', 'Detailed learning analytics dashboard', true, 100, ARRAY['pro', 'teams']),
  ('team_dashboard', 'Team admin dashboard', true, 100, ARRAY['teams']),
  ('custom_roadmaps', 'Custom roadmap builder', false, 0, ARRAY['teams']),
  ('dark_mode_v2', 'Enhanced dark mode theming', false, 25, ARRAY['free', 'pro', 'teams']);

-- ═══════════════════════════════════════
-- 10. Materialized views for analytics
-- ═══════════════════════════════════════

-- Daily active users
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_active_users AS
SELECT
  DATE(created_at) AS day,
  COUNT(DISTINCT user_id) AS active_users,
  COUNT(*) AS total_events
FROM analytics_events
WHERE user_id IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- Learning metrics by day
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_learning_metrics AS
SELECT
  DATE(al.created_at) AS day,
  COUNT(CASE WHEN al.action = 'topic_completed' THEN 1 END) AS topics_completed,
  COUNT(CASE WHEN al.action = 'project_submitted' THEN 1 END) AS projects_submitted,
  COUNT(CASE WHEN al.action = 'quiz_taken' THEN 1 END) AS quizzes_taken,
  COUNT(CASE WHEN al.action = 'review_completed' THEN 1 END) AS reviews_completed,
  COUNT(CASE WHEN al.action = 'challenge_completed' THEN 1 END) AS challenges_completed,
  COUNT(CASE WHEN al.action = 'verification_passed' THEN 1 END) AS verifications_passed,
  COUNT(DISTINCT al.user_id) AS unique_learners
FROM activity_log al
GROUP BY DATE(al.created_at)
ORDER BY day DESC;

-- Revenue metrics by month
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_revenue AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) FILTER (WHERE status = 'succeeded') AS successful_payments,
  SUM(amount) FILTER (WHERE status = 'succeeded') AS total_revenue_cents,
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'succeeded') AS paying_users
FROM payments
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- ═══════════════════════════════════════
-- 11. Update activity_log with Phase 6 actions
-- ═══════════════════════════════════════

ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_action_check;
ALTER TABLE activity_log ADD CONSTRAINT activity_log_action_check
  CHECK (action IN (
    'topic_completed', 'project_submitted', 'badge_earned', 'streak_milestone',
    'roadmap_started', 'quiz_taken', 'review_completed', 'code_executed',
    'code_snapshot', 'ai_review_requested', 'challenge_completed', 'battle_won',
    'battle_completed', 'followed_user', 'level_up', 'title_change', 'daily_login',
    'verification_passed', 'certificate_earned', 'portfolio_published', 'resume_created',
    'job_applied', 'mock_interview_completed',
    'subscription_started', 'subscription_canceled', 'subscription_upgraded'
  ));
