-- Droppi Schema
-- Supabase PostgreSQL

-- 1. users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  telegram_uid text unique,
  web_session_id text unique,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table users enable row level security;
create policy "allow_all_users" on users for all using (true) with check (true);

-- 2. essence_profiles
create table if not exists essence_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  headline text not null,
  dimensions jsonb not null,
  palette text[] not null,
  observation text,
  first_question text,
  raw_images jsonb,
  created_at timestamptz default now()
);
alter table essence_profiles enable row level security;
create policy "allow_all_essence" on essence_profiles for all using (true) with check (true);

-- 3. sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  input_type text not null check (input_type in ('image', 'text', 'link', 'memo')),
  input_preview text,
  confirmed_patterns text[],
  created_at timestamptz default now()
);
alter table sessions enable row level security;
create policy "allow_all_sessions" on sessions for all using (true) with check (true);

-- 4. messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  type text check (type in ('question', 'insight')),
  input_type text check (input_type in ('image', 'text', 'link', 'memo')),
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "allow_all_messages" on messages for all using (true) with check (true);

-- 5. insights
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  text text not null,
  tags text[],
  connected_essence text,
  created_at timestamptz default now()
);
alter table insights enable row level security;
create policy "allow_all_insights" on insights for all using (true) with check (true);

-- 6. topography_clusters
create table if not exists topography_clusters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  label text not null,
  height integer default 0,
  insights text[],
  keywords text[],
  updated_at timestamptz default now()
);
alter table topography_clusters enable row level security;
create policy "allow_all_clusters" on topography_clusters for all using (true) with check (true);
