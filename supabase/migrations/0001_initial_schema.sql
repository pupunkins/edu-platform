-- profiles: extends auth.users
create table public.profiles (
  id uuid references auth.users primary key,
  name text,
  tariff text check (tariff in ('basic', 'all_inclusive')) default 'basic',
  status text check (status in ('active', 'blocked')) default 'active',
  created_at timestamptz default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  order_index int not null default 0,
  is_published boolean default false
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_id text,
  duration_seconds int default 0,  -- was: "duratil default 0" (typo + missing type)
  is_published boolean default false,
  created_at timestamptz default now()
);

create table public.lesson_links (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  label text not null,
  url text not null
);

create table public.lesson_attachments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  file_url text not null,
  file_name text not null
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  granted_at timestamptz default now(),
  access_until timestamptz  -- NULL = бессрочный доступ
);

create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,  -- was: "ode" (truncated)
  watched_percent int default 0,
  watched_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_links enable row level security;
alter table public.lesson_attachments enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;

-- ученик видит только свой профиль
create policy "own profile" on public.profiles
  for select using (auth.uid() = id);

-- ученик видит только свой прогресс
create policy "own progress" on public.progress
  for select using (auth.uid() = user_id);

-- TODO (Часть 6): политика видимости курсов/модулей/уроков —
-- только опубликованные И только при наличии активного enrollment.
-- Учесть access_until: null = бессрочно, иначе проверять now() < access_until.
