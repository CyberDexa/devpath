-- ═══════════════════════════════════════
-- SkillRoute — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════

-- ── Enable UUID extension ──
create extension if not exists "uuid-ossp";

-- ══════════════════════════════════════
-- PROFILES (extends Supabase auth.users)
-- ══════════════════════════════════════
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text not null,
  username text unique not null,
  avatar_url text,
  bio text,
  location text,
  website text,
  github_username text,
  twitter_handle text,
  xp integer default 0 not null,
  level integer default 1 not null,
  streak integer default 0 not null,
  longest_streak integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for username lookups
create unique index profiles_username_idx on public.profiles(username);

-- ══════════════════════════════════════
-- ROADMAP PROGRESS
-- ══════════════════════════════════════
create table public.roadmap_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  roadmap_id text not null,
  node_statuses jsonb default '{}'::jsonb not null,
  started_at timestamptz default now() not null,
  last_activity_at timestamptz default now() not null,
  completed_at timestamptz,
  
  unique(user_id, roadmap_id)
);

create index roadmap_progress_user_idx on public.roadmap_progress(user_id);

-- ══════════════════════════════════════
-- PROJECT SUBMISSIONS
-- ══════════════════════════════════════
create table public.project_submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id text not null,
  code text not null,
  language text not null,
  status text default 'submitted' not null check (status in ('submitted', 'running', 'passed', 'failed')),
  test_results jsonb,
  ai_review text,
  xp_earned integer default 0 not null,
  submitted_at timestamptz default now() not null,
  completed_at timestamptz
);

create index project_submissions_user_idx on public.project_submissions(user_id);
create index project_submissions_project_idx on public.project_submissions(project_id);

-- ══════════════════════════════════════
-- BADGES
-- ══════════════════════════════════════
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  icon text not null,
  category text not null check (category in ('roadmap', 'project', 'streak', 'community', 'special')),
  requirement jsonb not null,
  xp_reward integer default 0 not null,
  created_at timestamptz default now() not null
);

-- ══════════════════════════════════════
-- USER BADGES (junction table)
-- ══════════════════════════════════════
create table public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamptz default now() not null,
  
  unique(user_id, badge_id)
);

create index user_badges_user_idx on public.user_badges(user_id);

-- ══════════════════════════════════════
-- ACTIVITY LOG
-- ══════════════════════════════════════
create table public.activity_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null check (action in (
    'roadmap_started', 'node_completed', 'project_submitted',
    'project_passed', 'badge_earned', 'streak_updated', 'level_up'
  )),
  metadata jsonb default '{}'::jsonb not null,
  xp_gained integer default 0 not null,
  created_at timestamptz default now() not null
);

create index activity_log_user_idx on public.activity_log(user_id);
create index activity_log_created_idx on public.activity_log(created_at desc);

-- ══════════════════════════════════════
-- AI TUTOR CONVERSATIONS
-- ══════════════════════════════════════
create table public.ai_tutor_conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  messages jsonb default '[]'::jsonb not null,
  model text default 'claude-3.5-sonnet' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index conversations_user_idx on public.ai_tutor_conversations(user_id);

-- ══════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.roadmap_progress enable row level security;
alter table public.project_submissions enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.activity_log enable row level security;
alter table public.ai_tutor_conversations enable row level security;

-- Profile policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Roadmap progress policies
create policy "Users can view own roadmap progress"
  on public.roadmap_progress for select using (auth.uid() = user_id);

create policy "Users can insert own roadmap progress"
  on public.roadmap_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own roadmap progress"
  on public.roadmap_progress for update using (auth.uid() = user_id);

-- Project submissions policies
create policy "Users can view own submissions"
  on public.project_submissions for select using (auth.uid() = user_id);

create policy "Users can submit projects"
  on public.project_submissions for insert with check (auth.uid() = user_id);

create policy "Users can update own submissions"
  on public.project_submissions for update using (auth.uid() = user_id);

-- Badges are viewable by everyone
create policy "Badges are viewable by everyone"
  on public.badges for select using (true);

-- User badges policies
create policy "User badges are viewable by everyone"
  on public.user_badges for select using (true);

create policy "System can award badges"
  on public.user_badges for insert with check (auth.uid() = user_id);

-- Activity log policies
create policy "Users can view own activity"
  on public.activity_log for select using (auth.uid() = user_id);

create policy "Users can log own activity"
  on public.activity_log for insert with check (auth.uid() = user_id);

-- AI tutor conversation policies
create policy "Users can view own conversations"
  on public.ai_tutor_conversations for select using (auth.uid() = user_id);

create policy "Users can create conversations"
  on public.ai_tutor_conversations for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.ai_tutor_conversations for update using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.ai_tutor_conversations for delete using (auth.uid() = user_id);

-- ══════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ══════════════════════════════════════

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'gi'))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_conversations
  before update on public.ai_tutor_conversations
  for each row execute function public.handle_updated_at();

-- ══════════════════════════════════════
-- SEED: Default Badges
-- ══════════════════════════════════════
insert into public.badges (name, description, icon, category, requirement, xp_reward) values
  ('First Steps', 'Start your first roadmap', '🚀', 'roadmap', '{"type": "roadmap_started", "count": 1}', 50),
  ('Explorer', 'Start 3 different roadmaps', '🗺️', 'roadmap', '{"type": "roadmap_started", "count": 3}', 100),
  ('Pathfinder', 'Complete your first roadmap', '🏁', 'roadmap', '{"type": "roadmap_completed", "count": 1}', 500),
  ('First Build', 'Submit your first project', '🔨', 'project', '{"type": "project_submitted", "count": 1}', 50),
  ('Builder', 'Pass 5 project challenges', '🏗️', 'project', '{"type": "project_passed", "count": 5}', 200),
  ('Architect', 'Pass 20 project challenges', '🏛️', 'project', '{"type": "project_passed", "count": 20}', 500),
  ('On Fire', 'Maintain a 7-day streak', '🔥', 'streak', '{"type": "streak", "days": 7}', 100),
  ('Unstoppable', 'Maintain a 30-day streak', '💪', 'streak', '{"type": "streak", "days": 30}', 300),
  ('Century', 'Maintain a 100-day streak', '💯', 'streak', '{"type": "streak", "days": 100}', 1000),
  ('Rising Star', 'Reach Level 10', '⭐', 'community', '{"type": "level", "value": 10}', 200),
  ('Pro Developer', 'Reach Level 25', '💎', 'community', '{"type": "level", "value": 25}', 500),
  ('Legend', 'Reach Level 50', '👑', 'community', '{"type": "level", "value": 50}', 2000),
  ('Early Adopter', 'Join during beta', '🌱', 'special', '{"type": "special", "name": "early_adopter"}', 100),
  ('Bug Hunter', 'Report a verified bug', '🐛', 'special', '{"type": "special", "name": "bug_hunter"}', 150);
