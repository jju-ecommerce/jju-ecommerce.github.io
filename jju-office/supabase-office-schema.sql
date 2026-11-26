-- ============================================================
-- 쭈대표 AI 오피스 · Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 끝입니다.
-- 앱 우측 상단 [AI 서버] → Project URL + anon key 를 넣으면
-- 회의실(office_messages)과 메모(office_tasks)가 이 테이블과 동기화됩니다.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- 회의실 메시지 ----------
create table if not exists public.office_messages (
  id          uuid primary key default gen_random_uuid(),
  room        text not null default 'grand' check (room in ('grand', 'command', 'lounge')),
  author      text not null default 'director',   -- boss | director | jju1 | jju2 | jju3
  author_name text,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists office_messages_room_created_idx
  on public.office_messages (room, created_at desc);

-- ---------- 오늘 할 일 ----------
create table if not exists public.office_tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  owner      text default 'boss',
  done       boolean not null default false,
  due_date   date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists office_tasks_created_idx
  on public.office_tasks (created_at desc);

-- ---------- 접근 정책 ----------
-- 개인 오피스용입니다. anon key 를 가진 기기(대표님 폰·PC)만 접속하므로
-- anon 역할에 읽기·쓰기를 열어 둡니다. 키를 공유하지 마세요.
alter table public.office_messages enable row level security;
alter table public.office_tasks    enable row level security;

drop policy if exists "office messages anon all" on public.office_messages;
create policy "office messages anon all"
  on public.office_messages
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "office tasks anon all" on public.office_tasks;
create policy "office tasks anon all"
  on public.office_tasks
  for all
  to anon
  using (true)
  with check (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.office_messages to anon;
grant select, insert, update, delete on public.office_tasks    to anon;

-- ---------- Realtime (선택) ----------
-- 앱은 4.5초 주기로 동기화하므로 Realtime 은 없어도 동작합니다.
-- 바로 밀어주는 알림까지 쓰려면 아래 두 줄의 주석을 풀고 실행하세요.
-- (이미 등록된 경우 "already member of publication" 오류는 무시해도 됩니다.)
-- alter publication supabase_realtime add table public.office_messages;
-- alter publication supabase_realtime add table public.office_tasks;

-- ---------- 확인 ----------
select 'office_messages' as table_name, count(*) as rows from public.office_messages
union all
select 'office_tasks', count(*) from public.office_tasks;
