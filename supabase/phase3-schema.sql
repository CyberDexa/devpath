-- ═══════════════════════════════════════
-- DevPath — Phase 3 Schema Extension
-- Integrated Coding Environment tables
-- Run AFTER schema.sql and phase2-schema.sql
-- ═══════════════════════════════════════

-- ── Code Versions (snapshots for version history) ──
CREATE TABLE IF NOT EXISTS code_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id text NOT NULL,
  code text NOT NULL,
  language text NOT NULL DEFAULT 'javascript',
  label text DEFAULT 'Snapshot',
  auto_save boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ── Project Files (multi-file project support) ──
CREATE TABLE IF NOT EXISTS project_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id text NOT NULL,
  file_path text NOT NULL, -- e.g. 'src/index.ts', 'styles/main.css'
  content text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'javascript',
  is_entry_point boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id, file_path)
);

-- ── Code Execution Logs (for analytics and debugging) ──
CREATE TABLE IF NOT EXISTS execution_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id text NOT NULL,
  code text NOT NULL,
  language text NOT NULL,
  execution_type text NOT NULL CHECK (execution_type IN ('run', 'test', 'review')),
  result jsonb DEFAULT '{}', -- { output, error, executionTimeMs }
  test_results jsonb DEFAULT '{}', -- { passed, failed, total, results[] }
  created_at timestamptz DEFAULT now()
);

-- ── AI Reviews (cached reviews for code) ──
CREATE TABLE IF NOT EXISTS ai_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id text NOT NULL,
  code_hash text NOT NULL, -- SHA-256 hash of the code for deduplication
  review jsonb NOT NULL, -- Full CodeReview object
  score integer CHECK (score >= 1 AND score <= 10),
  language text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_code_versions_user_project ON code_versions(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_code_versions_created ON code_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_files_user_project ON project_files(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_user_project ON execution_logs(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_created ON execution_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_user_project ON ai_reviews(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_code_hash ON ai_reviews(code_hash);

-- ── Row Level Security ──
ALTER TABLE code_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users manage own code versions" ON code_versions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own project files" ON project_files
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own execution logs" ON execution_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own AI reviews" ON ai_reviews
  FOR ALL USING (auth.uid() = user_id);

-- ── Updated At Trigger for project_files ──
CREATE TRIGGER update_project_files_timestamp
  BEFORE UPDATE ON project_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Update activity_log action constraint to include new actions ──
-- (Only if the constraint exists from schema.sql)
DO $$
BEGIN
  ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_action_check;
  ALTER TABLE activity_log ADD CONSTRAINT activity_log_action_check
    CHECK (action IN (
      'node_completed', 'badge_earned', 'project_submission',
      'streak_milestone', 'level_up', 'roadmap_started', 'roadmap_completed',
      'quiz_completed', 'review_session', 'learning_plan_created',
      'code_executed', 'tests_passed', 'ai_review_received', 'code_snapshot'
    ));
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if table doesn't exist yet
END $$;
