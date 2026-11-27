-- ============================================================
-- 쭈대표 AI 오피스 · Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 끝입니다.
-- 앱 우측 상단 [AI 서버] → Project URL + anon key 를 넣으면
-- 회의실(office_messages) · 할 일(office_tasks) · AI 한도(office_ai_quotas) · 읽음 현황(office_reads)가
-- 이 테이블과 동기화됩니다.
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

-- ---------- 📷 사진 첨부 컬럼 (v38) ----------
-- 대회의실·자유대화에서 보낸 사진의 공개 주소(Storage)가 들어갑니다.
-- 이 줄만 따로 실행해도 됩니다(이미 있으면 그냥 넘어갑니다).
alter table public.office_messages add column if not exists image_url text;

-- 사진은 Storage 공개 버킷(office-attachments)에 올리고 주소만 이 컴럼에 남깁니다.
-- (메일에 base64를 통째로 넣는 방식은 행 크기·속도에서 불리해 쓰지 않습니다.)

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

-- ---------- 📂 자료실(작업물) — 선택 ----------
-- 앱의 자료실 탭은 이 테이블이 없어도 app.js의 정적 목록으로 그대로 동작합니다.
-- 서버에서 자료를 더하거나 바꾸고 싶을 때만 이 블록을 함께 실행하세요.
create table if not exists public.office_deliverables (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  category    text not null default 'util',   -- ebook | video | image | doc | util
  kind        text not null default 'web',    -- pdf | md | csv | xlsx | image | video | web | sheet | doc | app | sql
  url         text,                           -- 바깥 링크(드라이브·시트·문서·웹)
  file_path   text,                           -- 이 저장소 안 경로(assets/...) — 있으면 앱에서 미리보기
  tags        text[],
  size_label  text,
  locked      boolean not null default false,  -- 로그인해야 열리는 자료 표시
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists office_deliverables_updated_idx
  on public.office_deliverables (updated_at desc);

-- ---------- 🔋 AI 한도(4인방) — 선택 ----------
-- 앱의 AI 한도 탭은 이 테이블이 없어도(404) 기기 저장(localStorage)으로 그대로 동작합니다.
-- 4기기에서 같은 값을 보려면 이 블록을 실행하세요.
create table if not exists public.office_ai_quotas (
  id          text primary key,                       -- director | jju1 | jju2 | jju3
  plan        text not null default 'Free plan',       -- 플랜명(자유 문장)
  status      text not null default 'free',            -- free(여유) | watch(주의) | near(임박) | out(소진)
  percent     integer not null default 100
              check (percent >= 0 and percent <= 100), -- 잔여 한도 %
  reset_note  text,                                    -- 다음 리셋 예정(예: 보통 매일 자정~새벽 사이 초기화)
  memo        text,
  updated_by  text default 'jju1',
  updated_at  timestamptz not null default now()
);

create index if not exists office_ai_quotas_updated_idx
  on public.office_ai_quotas (updated_at desc);

-- ---------- 💬 읽음 현황 (v41) ----------
-- 방마다 '누가 언제까지 읽었는지' 한 줄씩 남깁니다. 앱(회의실)은 말풍선 옆에
-- 그 글을 아직 읽지 않은 인원수를 카카오톡처럼 작은 노란 숫자로 보여 줍니다.
--   room   : 'grand' | 'command' | 'lounge' | 'dm:jju1' …
--   member : 'boss' | 'director' | 'jju1' | 'jju2' | 'jju3'
create table if not exists public.office_reads (
  room         text not null,
  member       text not null,
  last_read_at timestamptz not null default now(),   -- 이 사람이 마지막으로 읽은 시각
  updated_at   timestamptz not null default now(),
  primary key (room, member)
);

create index if not exists idx_office_reads_room
  on public.office_reads (room);

-- updated_at 자동 갱신 — 앱은 upsert(room,member) 한 줄만 올립니다.
create or replace function public.office_reads_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_office_reads_touch on public.office_reads;
create trigger trg_office_reads_touch
  before update on public.office_reads
  for each row execute function public.office_reads_touch();

-- ---------- 접근 정책 ----------
-- 개인 오피스용입니다. anon key 를 가진 기기(대표님 폰·PC)만 접속하므로
-- anon 역할에 읽기·쓰기를 열어 둡니다. 키를 공유하지 마세요.
alter table public.office_messages enable row level security;
alter table public.office_tasks    enable row level security;
alter table public.office_deliverables enable row level security;
alter table public.office_ai_quotas enable row level security;
alter table public.office_reads  enable row level security;

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

drop policy if exists "office deliverables anon all" on public.office_deliverables;
create policy "office deliverables anon all"
  on public.office_deliverables
  for all
  to anon
  using (true)
  with check (true);

-- office_tasks와 같은 패턴: select · insert · update · delete 모두 anon 허용
-- (개인 오피스 기준 · anon key를 가진 대표님 기기만 접속 · 키를 공유하지 마세요)
drop policy if exists "office ai quotas anon all" on public.office_ai_quotas;
create policy "office ai quotas anon all"
  on public.office_ai_quotas
  for all
  to anon
  using (true)
  with check (true);

-- 읽음 현황은 select(현황 조회) · insert · update(upsert) 세 가지 동작만 씁니다.
drop policy if exists "office reads anon select" on public.office_reads;
create policy "office reads anon select"
  on public.office_reads
  for select
  to anon
  using (true);

drop policy if exists "office reads anon insert" on public.office_reads;
create policy "office reads anon insert"
  on public.office_reads
  for insert
  to anon
  with check (true);

drop policy if exists "office reads anon update" on public.office_reads;
create policy "office reads anon update"
  on public.office_reads
  for update
  to anon
  using (true)
  with check (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.office_messages to anon;
grant select, insert, update, delete on public.office_tasks    to anon;
grant select, insert, update, delete on public.office_deliverables to anon;
grant select, insert, update, delete on public.office_ai_quotas to anon;
grant select, insert, update on public.office_reads to anon;

-- ---------- 📷 사진 저장소 — Storage 공개 버킷 (v38) ----------
-- 앱은 사진을 긴 변 1280px · JPEG 0.82로 줄여 이 버킷에 올리고(office/YYYY-MM-DD/...) 공개 주소를 메시지에 남깁니다.
-- 버킷이 없어도 앱은 그래도 동작합니다(사진은 기기에만, 글은 정상 전송).
insert into storage.buckets (id, name, public)
values ('office-attachments', 'office-attachments', true)
on conflict (id) do update set public = true;

drop policy if exists "office attachments anon insert" on storage.objects;
create policy "office attachments anon insert"
  on storage.objects for insert to anon
  with check (bucket_id = 'office-attachments');

drop policy if exists "office attachments anon read" on storage.objects;
create policy "office attachments anon read"
  on storage.objects for select to anon
  using (bucket_id = 'office-attachments');

drop policy if exists "office attachments anon update" on storage.objects;
create policy "office attachments anon update"
  on storage.objects for update to anon
  using (bucket_id = 'office-attachments')
  with check (bucket_id = 'office-attachments');

-- ---------- Realtime (선택) ----------
-- 앱은 4.5초 주기로 동기화하므로 Realtime 은 없어도 동작합니다.
-- 바로 밀어주는 알림까지 쓰려면 아래 두 줄의 주석을 풀고 실행하세요.
-- (이미 등록된 경우 "already member of publication" 오류는 무시해도 됩니다.)
-- alter publication supabase_realtime add table public.office_messages;
-- alter publication supabase_realtime add table public.office_tasks;

-- ---------- 확인 ----------
select 'office_messages' as table_name, count(*) as rows from public.office_messages
union all
select 'office_tasks', count(*) from public.office_tasks
union all
select 'office_ai_quotas', count(*) from public.office_ai_quotas
union all
select 'office_reads', count(*) from public.office_reads;

-- 사진 컬럼·버킷 확인 (v38)
select column_name, data_type
  from information_schema.columns
 where table_schema = 'public' and table_name = 'office_messages' and column_name = 'image_url';
select id, public from storage.buckets where id = 'office-attachments';
