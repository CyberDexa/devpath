-- ═══════════════════════════════════════
-- DevPath — Phase 5: Career Integration
-- Skill verification, certificates,
-- portfolio, resume, job board, mock interviews
-- ═══════════════════════════════════════

-- ═══════════════════════════════════════
-- 1. Skill Verifications (proctored challenges)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS skill_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  roadmap_id TEXT NOT NULL,
  skill_area TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'expired')),
  score NUMERIC(5,2),
  max_score NUMERIC(5,2) DEFAULT 100,
  time_limit_seconds INTEGER NOT NULL DEFAULT 1800,
  time_taken_seconds INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  challenge_data JSONB NOT NULL DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  proctoring_flags JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skill_verifications_user ON skill_verifications(user_id);
CREATE INDEX idx_skill_verifications_status ON skill_verifications(user_id, status);

ALTER TABLE skill_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verifications"
  ON skill_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verifications"
  ON skill_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verifications"
  ON skill_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 2. Certificates (digital credentials)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_id UUID REFERENCES skill_verifications(id) ON DELETE SET NULL,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('skill_verification', 'roadmap_completion', 'project_completion', 'battle_champion', 'streak_achievement')),
  title TEXT NOT NULL,
  description TEXT,
  roadmap_id TEXT,
  skill_area TEXT,
  difficulty TEXT,
  score NUMERIC(5,2),
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public certificates"
  ON certificates FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own certificates"
  ON certificates FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 3. Portfolio Sites (generated portfolios)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS portfolio_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  theme TEXT NOT NULL DEFAULT 'midnight' CHECK (theme IN ('midnight', 'ocean', 'forest', 'sunset', 'minimal', 'neon')),
  custom_domain TEXT,
  social_links JSONB DEFAULT '{}',
  featured_projects UUID[] DEFAULT '{}',
  featured_certificates UUID[] DEFAULT '{}',
  show_stats BOOLEAN DEFAULT true,
  show_activity BOOLEAN DEFAULT true,
  show_badges BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  analytics JSONB DEFAULT '{"views": 0, "unique_visitors": 0}',
  last_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolio_sites_slug ON portfolio_sites(slug);

ALTER TABLE portfolio_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published portfolios"
  ON portfolio_sites FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own portfolio"
  ON portfolio_sites FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 4. Resumes (AI-generated)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Resume',
  template TEXT NOT NULL DEFAULT 'modern' CHECK (template IN ('modern', 'classic', 'minimal', 'creative', 'technical')),
  personal_info JSONB DEFAULT '{}',
  summary TEXT,
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  custom_sections JSONB DEFAULT '[]',
  ai_suggestions JSONB DEFAULT '{}',
  target_role TEXT,
  target_company TEXT,
  is_primary BOOLEAN DEFAULT false,
  last_exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_user ON resumes(user_id);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own resumes"
  ON resumes FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 5. Job Listings (aggregated from APIs)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT,
  source TEXT NOT NULL CHECK (source IN ('indeed', 'linkedin', 'adzuna', 'github_jobs', 'manual')),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote_type TEXT CHECK (remote_type IN ('remote', 'hybrid', 'onsite', NULL)),
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  description TEXT,
  requirements JSONB DEFAULT '[]',
  required_skills TEXT[] DEFAULT '{}',
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'principal')),
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  apply_url TEXT,
  company_logo TEXT,
  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  match_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_listings_active ON job_listings(is_active);
CREATE INDEX idx_job_listings_skills ON job_listings USING GIN(required_skills);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON job_listings FOR SELECT
  USING (is_active = true);

-- ═══════════════════════════════════════
-- 6. Job Applications (user tracking)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn', 'accepted')),
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  notes TEXT,
  applied_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

CREATE INDEX idx_job_applications_user ON job_applications(user_id);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own applications"
  ON job_applications FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 7. Mock Interviews
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS mock_interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('behavioral', 'technical', 'system_design', 'coding', 'mixed')),
  target_role TEXT,
  target_company TEXT,
  difficulty TEXT NOT NULL DEFAULT 'mid' CHECK (difficulty IN ('entry', 'mid', 'senior')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  questions JSONB DEFAULT '[]',
  responses JSONB DEFAULT '[]',
  ai_feedback JSONB DEFAULT '{}',
  overall_score NUMERIC(5,2),
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mock_interviews_user ON mock_interviews(user_id);

ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interviews"
  ON mock_interviews FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 8. Profile extensions for career features
-- ═══════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available_for_hire BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_verifications_passed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_certificates INTEGER DEFAULT 0;

-- ═══════════════════════════════════════
-- 9. Sample job listings (seed data)
-- ═══════════════════════════════════════

INSERT INTO job_listings (source, title, company, location, remote_type, salary_min, salary_max, description, required_skills, experience_level, job_type, apply_url, posted_at)
VALUES
  ('manual', 'Frontend Engineer', 'TechCorp', 'San Francisco, CA', 'hybrid', 120000, 180000, 'Build beautiful, performant web applications using React and TypeScript. Work with a world-class design team to deliver pixel-perfect UIs.', ARRAY['react', 'typescript', 'css', 'html', 'javascript'], 'mid', 'full-time', 'https://example.com/apply/frontend', NOW()),
  ('manual', 'Senior Backend Developer', 'DataFlow Inc', 'New York, NY', 'remote', 150000, 220000, 'Design and implement scalable APIs and microservices. Experience with Node.js, PostgreSQL, and distributed systems required.', ARRAY['nodejs', 'postgresql', 'docker', 'typescript', 'api-design'], 'senior', 'full-time', 'https://example.com/apply/backend', NOW()),
  ('manual', 'Full Stack Engineer', 'StartupXYZ', 'Austin, TX', 'remote', 100000, 160000, 'Join our small team building the future of developer tools. Must be comfortable across the stack from React to PostgreSQL.', ARRAY['react', 'nodejs', 'postgresql', 'typescript', 'git'], 'mid', 'full-time', 'https://example.com/apply/fullstack', NOW()),
  ('manual', 'DevOps Engineer', 'CloudScale', 'Seattle, WA', 'hybrid', 140000, 200000, 'Manage CI/CD pipelines, Kubernetes clusters, and cloud infrastructure. Help us ship faster and more reliably.', ARRAY['kubernetes', 'docker', 'aws', 'terraform', 'ci-cd'], 'mid', 'full-time', 'https://example.com/apply/devops', NOW()),
  ('manual', 'Junior Developer', 'LearnTech', 'Remote', 'remote', 70000, 95000, 'Great opportunity for developers starting their career. Mentorship included. Work on React frontends and Python backends.', ARRAY['javascript', 'react', 'python', 'git'], 'entry', 'full-time', 'https://example.com/apply/junior', NOW()),
  ('manual', 'AI/ML Engineer', 'NeuralWorks', 'Boston, MA', 'hybrid', 160000, 240000, 'Build production ML pipelines and integrate LLMs into our product. Experience with PyTorch and cloud ML services required.', ARRAY['python', 'pytorch', 'tensorflow', 'docker', 'aws'], 'senior', 'full-time', 'https://example.com/apply/ml', NOW()),
  ('manual', 'React Native Developer', 'MobileFirst', 'Los Angeles, CA', 'remote', 110000, 170000, 'Build cross-platform mobile applications. Strong React Native experience and understanding of native iOS/Android required.', ARRAY['react-native', 'typescript', 'javascript', 'ios', 'android'], 'mid', 'full-time', 'https://example.com/apply/mobile', NOW()),
  ('manual', 'Platform Engineer', 'InfraTeam', 'Chicago, IL', 'onsite', 130000, 190000, 'Design and build internal developer platforms. Make other engineers more productive with great tooling.', ARRAY['golang', 'kubernetes', 'terraform', 'docker', 'linux'], 'senior', 'full-time', 'https://example.com/apply/platform', NOW());

-- ═══════════════════════════════════════
-- 10. Update activity_log allowed actions
-- ═══════════════════════════════════════

ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_action_check;
ALTER TABLE activity_log ADD CONSTRAINT activity_log_action_check
  CHECK (action IN (
    'topic_completed', 'project_submitted', 'badge_earned', 'streak_milestone',
    'roadmap_started', 'quiz_taken', 'review_completed', 'code_executed',
    'code_snapshot', 'ai_review_requested', 'challenge_completed', 'battle_won',
    'battle_completed', 'followed_user', 'level_up', 'title_change', 'daily_login',
    'verification_passed', 'certificate_earned', 'portfolio_published', 'resume_created',
    'job_applied', 'mock_interview_completed'
  ));
