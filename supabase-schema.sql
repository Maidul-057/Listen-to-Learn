-- =============================================
-- Run this ENTIRE file in Supabase SQL Editor
-- =============================================

-- 1. Create words table
create table if not exists words (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  word text not null,
  phonetic text,
  en_meaning text not null,
  bn_meaning text not null,
  en_example text,
  bn_example text,
  mnemonic text,
  tag text default 'General',
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table words enable row level security;

-- 3. RLS Policies — each user sees ONLY their own words
create policy "Users can read own words"
  on words for select
  using (auth.uid() = user_id);

create policy "Users can insert own words"
  on words for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own words"
  on words for delete
  using (auth.uid() = user_id);

create policy "Users can update own words"
  on words for update
  using (auth.uid() = user_id);