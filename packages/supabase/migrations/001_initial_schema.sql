-- ============================================================================
-- ProcrastinAct Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wulcoeqlhgaptbhxfzoe/sql
-- ============================================================================

-- Enable UUID extension (should already be enabled)
create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type subscription_tier as enum ('free', 'premium');
create type task_status as enum ('active', 'completed', 'abandoned');

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamp with time zone default now() not null,
  subscription_tier subscription_tier default 'free' not null,
  subscription_expires_at timestamp with time zone,
  settings jsonb default '{}'::jsonb not null,
  streak_count integer default 0 not null,
  streak_last_date date,
  streak_freezes integer default 2 not null,
  total_tasks_completed integer default 0 not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  original_content text,
  shrink_level integer default 0 not null,
  category text,
  status task_status default 'active' not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  completed_at timestamp with time zone,
  notes text,
  is_template boolean default false not null,
  position integer default 0 not null,
  parent_task_id uuid references public.tasks(id) on delete set null
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Tasks policies
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index tasks_user_status_idx on public.tasks(user_id, status);
create index tasks_user_created_idx on public.tasks(user_id, created_at desc);

-- ============================================================================
-- SHRINK HISTORY TABLE
-- ============================================================================

create table public.shrink_history (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  content text not null,
  shrink_level integer not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.shrink_history enable row level security;

-- Shrink history policies (access through task ownership)
create policy "Users can view shrink history of own tasks"
  on public.shrink_history for select
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = shrink_history.task_id
      and tasks.user_id = auth.uid()
    )
  );

create policy "Users can create shrink history for own tasks"
  on public.shrink_history for insert
  with check (
    exists (
      select 1 from public.tasks
      where tasks.id = shrink_history.task_id
      and tasks.user_id = auth.uid()
    )
  );

-- Index
create index shrink_history_task_idx on public.shrink_history(task_id);

-- ============================================================================
-- TIMER SESSIONS TABLE
-- ============================================================================

create table public.timer_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete set null,
  duration_seconds integer not null,
  started_at timestamp with time zone default now() not null,
  ended_at timestamp with time zone,
  completed boolean default false not null
);

-- Enable RLS
alter table public.timer_sessions enable row level security;

-- Timer sessions policies
create policy "Users can view own timer sessions"
  on public.timer_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create own timer sessions"
  on public.timer_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own timer sessions"
  on public.timer_sessions for update
  using (auth.uid() = user_id);

-- Index
create index timer_sessions_user_idx on public.timer_sessions(user_id, started_at desc);

-- ============================================================================
-- AI USAGE TABLE (for free tier limits)
-- ============================================================================

create table public.ai_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date default current_date not null,
  shrink_count integer default 0 not null,
  unique(user_id, date)
);

-- Enable RLS
alter table public.ai_usage enable row level security;

-- AI usage policies
create policy "Users can view own ai usage"
  on public.ai_usage for select
  using (auth.uid() = user_id);

create policy "Users can create own ai usage"
  on public.ai_usage for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ai usage"
  on public.ai_usage for update
  using (auth.uid() = user_id);

-- Index
create index ai_usage_user_date_idx on public.ai_usage(user_id, date);

-- ============================================================================
-- ACHIEVEMENTS TABLE
-- ============================================================================

create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_key text not null,
  earned_at timestamp with time zone default now() not null,
  unique(user_id, achievement_key)
);

-- Enable RLS
alter table public.achievements enable row level security;

-- Achievements policies
create policy "Users can view own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "Users can create own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);

-- Index
create index achievements_user_idx on public.achievements(user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to increment tasks completed count
create or replace function public.increment_tasks_completed(user_uuid uuid)
returns void as $$
begin
  update public.profiles
  set total_tasks_completed = total_tasks_completed + 1
  where id = user_uuid;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- DONE!
-- ============================================================================

-- Run this to verify tables were created:
-- select table_name from information_schema.tables where table_schema = 'public';
