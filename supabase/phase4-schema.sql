-- ═══════════════════════════════════════
-- SkillRoute — Phase 4: Gamification & Social
-- Run this after schema.sql, phase2-schema.sql,
-- and phase3-schema.sql in Supabase SQL Editor
-- ═══════════════════════════════════════

-- ══════════════════════════════════════
-- PROFILES EXTENSION
-- ══════════════════════════════════════

-- Add new profile fields for social features
alter table public.profiles
  add column if not exists title text default 'Beginner' not null,
  add column if not exists is_mentor boolean default false not null,
  add column if not exists mentor_topics text[] default '{}',
  add column if not exists last_active_at timestamptz default now() not null,
  add column if not exists total_challenges_completed integer default 0 not null,
  add column if not exists total_battles_won integer default 0 not null,
  add column if not exists total_battles_played integer default 0 not null;

-- ══════════════════════════════════════
-- FOLLOWS (Social graph)
-- ══════════════════════════════════════
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,

  unique(follower_id, following_id),
  check (follower_id != following_id)
);

create index follows_follower_idx on public.follows(follower_id);
create index follows_following_idx on public.follows(following_id);

-- ══════════════════════════════════════
-- DAILY CHALLENGES
-- ══════════════════════════════════════
create table public.daily_challenges (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  category text not null,
  starter_code text not null default '',
  language text not null default 'javascript',
  test_cases jsonb not null default '[]'::jsonb,
  hints jsonb not null default '[]'::jsonb,
  xp_reward integer not null default 50,
  active_date date not null,
  created_at timestamptz default now() not null,

  unique(active_date)
);

create index daily_challenges_date_idx on public.daily_challenges(active_date desc);

-- ══════════════════════════════════════
-- DAILY CHALLENGE SUBMISSIONS
-- ══════════════════════════════════════
create table public.challenge_submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  challenge_id uuid references public.daily_challenges(id) on delete cascade not null,
  code text not null,
  language text not null default 'javascript',
  passed boolean default false not null,
  execution_time_ms integer,
  submitted_at timestamptz default now() not null,

  unique(user_id, challenge_id)
);

create index challenge_submissions_user_idx on public.challenge_submissions(user_id);
create index challenge_submissions_challenge_idx on public.challenge_submissions(challenge_id);

-- ══════════════════════════════════════
-- CODE BATTLES
-- ══════════════════════════════════════
create table public.code_battles (
  id uuid default uuid_generate_v4() primary key,
  challenger_id uuid references public.profiles(id) on delete cascade not null,
  opponent_id uuid references public.profiles(id) on delete cascade,
  challenge_title text not null,
  challenge_description text not null,
  starter_code text not null default '',
  language text not null default 'javascript',
  test_cases jsonb not null default '[]'::jsonb,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  time_limit_seconds integer not null default 900, -- 15 min default
  status text not null default 'waiting' check (status in ('waiting', 'active', 'completed', 'cancelled')),
  winner_id uuid references public.profiles(id),
  xp_reward integer not null default 100,
  created_at timestamptz default now() not null,
  started_at timestamptz,
  completed_at timestamptz
);

create index code_battles_status_idx on public.code_battles(status);
create index code_battles_challenger_idx on public.code_battles(challenger_id);
create index code_battles_opponent_idx on public.code_battles(opponent_id);

-- ══════════════════════════════════════
-- BATTLE SUBMISSIONS
-- ══════════════════════════════════════
create table public.battle_submissions (
  id uuid default uuid_generate_v4() primary key,
  battle_id uuid references public.code_battles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  code text not null,
  passed boolean default false not null,
  tests_passed integer default 0 not null,
  tests_total integer default 0 not null,
  execution_time_ms integer,
  submitted_at timestamptz default now() not null,

  unique(battle_id, user_id)
);

create index battle_submissions_battle_idx on public.battle_submissions(battle_id);

-- ══════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in (
    'badge_earned', 'level_up', 'streak_milestone',
    'battle_invite', 'battle_result', 'new_follower',
    'challenge_reminder', 'mentor_request', 'system'
  )),
  title text not null,
  message text not null,
  metadata jsonb default '{}'::jsonb not null,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

create index notifications_user_idx on public.notifications(user_id);
create index notifications_unread_idx on public.notifications(user_id, read) where read = false;

-- ══════════════════════════════════════
-- STREAKS TABLE (daily tracking)
-- ══════════════════════════════════════
create table public.user_streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_date date not null,
  activities_count integer default 1 not null,
  xp_earned integer default 0 not null,

  unique(user_id, activity_date)
);

create index user_streaks_user_date_idx on public.user_streaks(user_id, activity_date desc);

-- ══════════════════════════════════════
-- UPDATE ACTIVITY LOG ACTIONS
-- ══════════════════════════════════════
-- Drop existing constraint and recreate with new actions
alter table public.activity_log drop constraint if exists activity_log_action_check;
alter table public.activity_log add constraint activity_log_action_check
  check (action in (
    'node_completed', 'badge_earned', 'project_submission', 'streak_milestone',
    'level_up', 'roadmap_started', 'roadmap_completed', 'quiz_completed',
    'review_session', 'learning_plan_created', 'code_executed', 'tests_passed',
    'ai_review_received', 'code_snapshot',
    -- Phase 4 additions
    'daily_challenge_completed', 'battle_won', 'battle_lost', 'battle_created',
    'followed_user', 'earned_title', 'became_mentor'
  ));

-- ══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════

alter table public.follows enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.challenge_submissions enable row level security;
alter table public.code_battles enable row level security;
alter table public.battle_submissions enable row level security;
alter table public.notifications enable row level security;
alter table public.user_streaks enable row level security;

-- Follows policies
create policy "Anyone can view follows" on public.follows for select using (true);
create policy "Users can follow others" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Daily challenges are viewable by everyone
create policy "Challenges are public" on public.daily_challenges for select using (true);

-- Challenge submissions
create policy "Users can view own challenge submissions" on public.challenge_submissions for select using (auth.uid() = user_id);
create policy "Users can submit challenges" on public.challenge_submissions for insert with check (auth.uid() = user_id);
create policy "Users can update own challenge submissions" on public.challenge_submissions for update using (auth.uid() = user_id);

-- Code battles
create policy "Active battles are public" on public.code_battles for select using (true);
create policy "Users can create battles" on public.code_battles for insert with check (auth.uid() = challenger_id);
create policy "Participants can update battles" on public.code_battles for update
  using (auth.uid() = challenger_id or auth.uid() = opponent_id);

-- Battle submissions
create policy "Battle submissions are viewable by participants" on public.battle_submissions
  for select using (
    exists (select 1 from public.code_battles
            where id = battle_id
            and (challenger_id = auth.uid() or opponent_id = auth.uid()))
  );
create policy "Users can submit to battles" on public.battle_submissions
  for insert with check (auth.uid() = user_id);

-- Notifications
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "System can create notifications" on public.notifications for insert with check (auth.uid() = user_id);

-- Streaks
create policy "Users can view own streaks" on public.user_streaks for select using (auth.uid() = user_id);
create policy "Users can insert own streaks" on public.user_streaks for insert with check (auth.uid() = user_id);
create policy "Users can update own streaks" on public.user_streaks for update using (auth.uid() = user_id);

-- ══════════════════════════════════════
-- SEED: Additional Badges (Phase 4)
-- ══════════════════════════════════════
insert into public.badges (name, description, icon, category, requirement, xp_reward) values
  -- Challenge badges
  ('Challenge Taker', 'Complete your first daily challenge', '⚡', 'special', '{"type": "challenge_completed", "count": 1}', 50),
  ('Challenge Streak', 'Complete 7 daily challenges in a row', '🎯', 'streak', '{"type": "challenge_streak", "days": 7}', 200),
  ('Challenge Master', 'Complete 30 daily challenges', '🏆', 'special', '{"type": "challenge_completed", "count": 30}', 500),
  ('Hard Mode', 'Complete a hard daily challenge', '💀', 'special', '{"type": "challenge_hard_completed", "count": 1}', 150),

  -- Battle badges
  ('First Blood', 'Win your first code battle', '⚔️', 'special', '{"type": "battle_won", "count": 1}', 100),
  ('Gladiator', 'Win 10 code battles', '🗡️', 'special', '{"type": "battle_won", "count": 10}', 300),
  ('Champion', 'Win 5 battles in a row', '🥊', 'special', '{"type": "battle_win_streak", "count": 5}', 500),
  ('Speed Demon', 'Win a battle in under 5 minutes', '⏱️', 'special', '{"type": "battle_speed_win", "seconds": 300}', 200),

  -- Social badges
  ('Social Butterfly', 'Follow 10 developers', '🦋', 'community', '{"type": "following_count", "count": 10}', 50),
  ('Influencer', 'Get 25 followers', '📣', 'community', '{"type": "followers_count", "count": 25}', 200),
  ('Community Hero', 'Get 100 followers', '🦸', 'community', '{"type": "followers_count", "count": 100}', 500),

  -- Milestone badges
  ('Code Machine', 'Execute 100 code runs', '⚙️', 'special', '{"type": "code_executed", "count": 100}', 100),
  ('Reviewer', 'Get 10 AI code reviews', '📝', 'special', '{"type": "ai_review_received", "count": 10}', 100),
  ('Polyglot', 'Submit projects in 3+ languages', '🌐', 'project', '{"type": "unique_languages", "count": 3}', 150),
  ('Night Owl', 'Code between midnight and 5am', '🦉', 'special', '{"type": "special", "name": "night_owl"}', 50),
  ('Weekend Warrior', 'Complete a challenge on both Saturday and Sunday', '🛡️', 'special', '{"type": "special", "name": "weekend_warrior"}', 75),
  ('Perfect Score', 'Get 10/10 on an AI code review', '💯', 'project', '{"type": "perfect_review", "count": 1}', 200),
  ('Mentor', 'Become a community mentor', '🎓', 'community', '{"type": "special", "name": "became_mentor"}', 300);

-- ══════════════════════════════════════
-- SEED: Sample Daily Challenges
-- ══════════════════════════════════════
insert into public.daily_challenges (title, description, difficulty, category, starter_code, language, test_cases, hints, xp_reward, active_date) values
  (
    'FizzBuzz',
    'Write a function that returns "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for both, or the number as a string.',
    'easy', 'algorithms',
    'function fizzBuzz(n) {\n  // Your code here\n}',
    'javascript',
    '[{"input": "3", "expected": "Fizz"}, {"input": "5", "expected": "Buzz"}, {"input": "15", "expected": "FizzBuzz"}, {"input": "7", "expected": "7"}]',
    '["Check divisibility with modulo (%)", "Check 15 first (divisible by both 3 and 5)"]',
    50, CURRENT_DATE
  ),
  (
    'Palindrome Check',
    'Write a function that checks if a string is a palindrome (reads the same forwards and backwards). Ignore case and non-alphanumeric characters.',
    'easy', 'strings',
    'function isPalindrome(str) {\n  // Your code here\n}',
    'javascript',
    '[{"input": "\"racecar\"", "expected": "true"}, {"input": "\"hello\"", "expected": "false"}, {"input": "\"A man a plan a canal Panama\"", "expected": "true"}]',
    '["Convert to lowercase first", "Remove non-alphanumeric characters with regex", "Compare string to its reverse"]',
    50, CURRENT_DATE + interval '1 day'
  ),
  (
    'Two Sum',
    'Given an array of numbers and a target, return the indices of two numbers that add up to the target.',
    'medium', 'algorithms',
    'function twoSum(nums, target) {\n  // Your code here\n}',
    'javascript',
    '[{"input": "[2,7,11,15], 9", "expected": "[0,1]"}, {"input": "[3,2,4], 6", "expected": "[1,2]"}]',
    '["Use a hash map for O(n) time", "Store complement = target - current as you iterate"]',
    75, CURRENT_DATE + interval '2 days'
  ),
  (
    'Flatten Array',
    'Write a function that deeply flattens a nested array. Do not use Array.flat().',
    'medium', 'algorithms',
    'function flatten(arr) {\n  // Your code here\n}',
    'javascript',
    '[{"input": "[[1,2],[3,[4,5]]]", "expected": "[1,2,3,4,5]"}, {"input": "[1,[2,[3,[4]]]]", "expected": "[1,2,3,4]"}]',
    '["Use recursion", "Check Array.isArray() for each element", "Spread into a new array"]',
    75, CURRENT_DATE + interval '3 days'
  ),
  (
    'Debounce Function',
    'Implement a debounce function that delays invoking a callback until after a specified wait time has elapsed since the last call.',
    'hard', 'javascript',
    'function debounce(fn, delay) {\n  // Your code here\n}',
    'javascript',
    '[{"input": "debounce test", "expected": "function returned"}]',
    '["Use setTimeout and clearTimeout", "Return a new function", "Store the timer ID in a closure"]',
    100, CURRENT_DATE + interval '4 days'
  ),
  (
    'Binary Search',
    'Implement binary search on a sorted array. Return the index of the target or -1 if not found.',
    'easy', 'algorithms',
    'function binarySearch(arr, target) {\n  // Your code here\n}',
    'javascript',
    '[{"input": "[1,3,5,7,9], 5", "expected": "2"}, {"input": "[1,3,5,7,9], 4", "expected": "-1"}, {"input": "[2,4,6,8], 8", "expected": "3"}]',
    '["Use low and high pointers", "Calculate mid = Math.floor((low + high) / 2)", "Narrow the search range each iteration"]',
    50, CURRENT_DATE + interval '5 days'
  ),
  (
    'Event Emitter',
    'Create a simple event emitter class with on(), off(), and emit() methods.',
    'hard', 'javascript',
    'class EventEmitter {\n  constructor() {\n    // Your code here\n  }\n\n  on(event, callback) {\n    // Your code here\n  }\n\n  off(event, callback) {\n    // Your code here\n  }\n\n  emit(event, ...args) {\n    // Your code here\n  }\n}',
    'javascript',
    '[{"input": "EventEmitter test", "expected": "class with on/off/emit"}]',
    '["Store listeners in a Map or object", "on() adds to the listener array", "emit() calls all listeners for that event"]',
    100, CURRENT_DATE + interval '6 days'
  );
