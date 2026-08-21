-- Resumora Supabase Database Migration
-- Creates the public.resumes table, RLS policies, and performance indexes for cloud synchronization.

-- 1. Create public.resumes table
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  resume_data jsonb not null,
  template_id text not null default 'modern',
  version integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone default null
);

-- 2. Indexes for user queries and timestamp sorting
create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_resumes_updated_at on public.resumes(updated_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.resumes enable row level security;

-- 4. Row Level Security Policies
-- SELECT: Authenticated user can read only their own resumes
create policy "Users can read own resumes" on public.resumes
  for select
  using ((select auth.uid()) = user_id);

-- INSERT: Authenticated user can insert only resumes owned by their user_id
create policy "Users can insert own resumes" on public.resumes
  for insert
  with check ((select auth.uid()) = user_id);

-- UPDATE: Authenticated user can update only their own resumes, maintaining ownership
create policy "Users can update own resumes" on public.resumes
  for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- DELETE: Authenticated user can delete only their own resumes
create policy "Users can delete own resumes" on public.resumes
  for delete
  using ((select auth.uid()) = user_id);
