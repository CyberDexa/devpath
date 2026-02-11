-- ═══════════════════════════════════════
-- SkillRoute — Phase 2: Adaptive AI Learning
-- Run AFTER schema.sql in Supabase SQL Editor
-- ═══════════════════════════════════════

-- ══════════════════════════════════════
-- QUIZ QUESTIONS (per roadmap topic)
-- ══════════════════════════════════════
create table public.quiz_questions (
  id uuid default uuid_generate_v4() primary key,
  roadmap_id text not null,
  node_id text not null,
  question text not null,
  question_type text not null check (question_type in ('multiple_choice', 'true_false', 'code_output')),
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  tags text[] default '{}',
  created_at timestamptz default now() not null
);

create index quiz_questions_roadmap_idx on public.quiz_questions(roadmap_id, node_id);
create index quiz_questions_difficulty_idx on public.quiz_questions(difficulty);

-- ══════════════════════════════════════
-- QUIZ ATTEMPTS (diagnostic & review)
-- ══════════════════════════════════════
create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  roadmap_id text not null,
  quiz_type text not null check (quiz_type in ('diagnostic', 'review', 'practice')),
  questions jsonb not null default '[]'::jsonb, -- [{question_id, user_answer, correct, time_ms}]
  score integer not null default 0,
  total integer not null default 0,
  percentage numeric(5,2) not null default 0,
  completed_at timestamptz default now() not null
);

create index quiz_attempts_user_idx on public.quiz_attempts(user_id);
create index quiz_attempts_roadmap_idx on public.quiz_attempts(user_id, roadmap_id);

-- ══════════════════════════════════════
-- USER SKILLS (proficiency per topic)
-- ══════════════════════════════════════
create table public.user_skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  roadmap_id text not null,
  node_id text not null,
  proficiency numeric(3,2) default 0 not null check (proficiency >= 0 and proficiency <= 1),
  confidence numeric(3,2) default 0 not null check (confidence >= 0 and confidence <= 1),
  times_tested integer default 0 not null,
  last_tested_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  unique(user_id, roadmap_id, node_id)
);

create index user_skills_user_idx on public.user_skills(user_id);
create index user_skills_roadmap_idx on public.user_skills(user_id, roadmap_id);

-- ══════════════════════════════════════
-- REVIEW ITEMS (spaced repetition)
-- SM-2 algorithm fields
-- ══════════════════════════════════════
create table public.review_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  roadmap_id text not null,
  node_id text not null,
  question_id uuid references public.quiz_questions(id) on delete cascade,
  -- SM-2 algorithm fields
  easiness_factor numeric(4,2) default 2.50 not null,
  interval integer default 1 not null, -- days until next review
  repetitions integer default 0 not null,
  next_review_at timestamptz default now() not null,
  last_review_at timestamptz,
  last_quality integer, -- 0-5 quality of response
  created_at timestamptz default now() not null,

  unique(user_id, question_id)
);

create index review_items_user_next_idx on public.review_items(user_id, next_review_at);
create index review_items_user_roadmap_idx on public.review_items(user_id, roadmap_id);

-- ══════════════════════════════════════
-- LEARNING PLANS (AI-generated)
-- ══════════════════════════════════════
create table public.learning_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  roadmap_id text not null,
  title text not null,
  goal text,
  timeline_weeks integer default 12 not null,
  node_order text[] default '{}', -- Ordered list of node IDs
  daily_minutes integer default 60 not null,
  generated_by text default 'ai' not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  unique(user_id, roadmap_id)
);

create index learning_plans_user_idx on public.learning_plans(user_id);

-- ══════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════

-- Quiz questions readable by everyone
alter table public.quiz_questions enable row level security;
create policy "Quiz questions are viewable by everyone"
  on public.quiz_questions for select using (true);

-- Quiz attempts
alter table public.quiz_attempts enable row level security;
create policy "Users can view own quiz attempts"
  on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "Users can insert own quiz attempts"
  on public.quiz_attempts for insert with check (auth.uid() = user_id);

-- User skills
alter table public.user_skills enable row level security;
create policy "Users can view own skills"
  on public.user_skills for select using (auth.uid() = user_id);
create policy "Users can insert own skills"
  on public.user_skills for insert with check (auth.uid() = user_id);
create policy "Users can update own skills"
  on public.user_skills for update using (auth.uid() = user_id);

-- Review items
alter table public.review_items enable row level security;
create policy "Users can view own review items"
  on public.review_items for select using (auth.uid() = user_id);
create policy "Users can insert own review items"
  on public.review_items for insert with check (auth.uid() = user_id);
create policy "Users can update own review items"
  on public.review_items for update using (auth.uid() = user_id);
create policy "Users can delete own review items"
  on public.review_items for delete using (auth.uid() = user_id);

-- Learning plans
alter table public.learning_plans enable row level security;
create policy "Users can view own learning plans"
  on public.learning_plans for select using (auth.uid() = user_id);
create policy "Users can insert own learning plans"
  on public.learning_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own learning plans"
  on public.learning_plans for update using (auth.uid() = user_id);
create policy "Users can delete own learning plans"
  on public.learning_plans for delete using (auth.uid() = user_id);

-- ══════════════════════════════════════
-- Add quiz_taken and review actions to activity_log
-- ══════════════════════════════════════
alter table public.activity_log drop constraint if exists activity_log_action_check;
alter table public.activity_log add constraint activity_log_action_check check (action in (
  'roadmap_started', 'node_completed', 'project_submitted',
  'project_passed', 'badge_earned', 'streak_updated', 'level_up',
  'quiz_completed', 'review_completed', 'skill_assessed', 'plan_generated'
));

-- Updated_at trigger for new tables
create trigger set_updated_at_user_skills
  before update on public.user_skills
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_learning_plans
  before update on public.learning_plans
  for each row execute function public.handle_updated_at();
