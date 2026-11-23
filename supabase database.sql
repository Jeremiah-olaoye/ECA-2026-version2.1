-- EduTrack Pro | Emirate Classic Academy
-- Run this ONCE in Supabase > SQL Editor > New query > Run
-- WARNING: the DROP lines delete any older test tables/data.

drop table if exists eca_results cascade;
drop table if exists eca_students cascade;
drop table if exists eca_term_settings cascade;
drop table if exists eca_teachers cascade;

create table eca_teachers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text not null,
  role text default 'Teacher',
  class_assigned text default '',
  session text default '2026/2027',
  term text default '1st Term',
  phone text default '',
  created_at timestamptz default now()
);

create table eca_students (
  id uuid default gen_random_uuid() primary key,
  teacher_email text not null,
  class text not null,
  session text default '2026/2027',
  term text default '1st Term',
  adm_no text default '',
  full_name text not null,
  gender text default 'Male',
  dob text default '',
  position integer,
  total_students integer,
  days_opened integer default 0,
  days_present integer default 0,
  days_absent integer default 0,
  next_term_date text default '',
  created_at timestamptz default now()
);

create table eca_results (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references eca_students(id) on delete cascade,
  teacher_email text not null,
  session text default '2026/2027',
  term text default '1st Term',
  subject text not null,
  cw numeric default 0,
  asst numeric default 0,
  mid_term numeric default 0,
  exam numeric default 0,
  total numeric generated always as (cw + asst + mid_term + exam) stored,
  grade text default '',
  remark text default '',
  created_at timestamptz default now()
);

create table eca_term_settings (
  id uuid default gen_random_uuid() primary key,
  teacher_email text unique not null,
  school_name text default 'EMIRATE CLASSIC ACADEMY LTD',
  school_addr text default 'Gbaganu off Bida Road',
  motto text default 'Knowledge is power action and light',
  phone text default '',
  session text default '2026/2027',
  term text default '1st Term',
  next_term_date text default '',
  updated_at timestamptz default now()
);

alter table eca_teachers enable row level security;
alter table eca_students enable row level security;
alter table eca_results enable row level security;
alter table eca_term_settings enable row level security;

create policy "open_access" on eca_teachers for all using (true) with check (true);
create policy "open_access" on eca_students for all using (true) with check (true);
create policy "open_access" on eca_results for all using (true) with check (true);
create policy "open_access" on eca_term_settings for all using (true) with check (true);