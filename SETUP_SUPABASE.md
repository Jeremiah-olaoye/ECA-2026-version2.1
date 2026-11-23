# Supabase Setup Guide — Emirate Classic Academy EduTrack Pro

## STEP 1 — Create Free Supabase Account
1. Go to **https://supabase.com**
2. Click **Start your project** → Sign in with GitHub
3. Click **New Project**
4. Fill in:
   - **Name**: ECA-EduTrack
   - **Database Password**: pick a strong password (save it!)
   - **Region**: West EU (closest to Nigeria)
5. Click **Create new project** — wait 2 minutes

---

## STEP 2 — Run This SQL (Creates All Tables)
1. In Supabase left sidebar → click **SQL Editor**
2. Click **New query**
3. **Copy and paste ALL of this** then click **Run**:

```sql
-- Teachers table
create table if not exists eca_teachers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text not null,
  role text default 'Teacher',
  class_assigned text default '',
  session text default '2026/2027',
  term text default '1st Term',
  created_at timestamptz default now()
);

-- Students table (max 16 per teacher per term)
create table if not exists eca_students (
  id uuid default gen_random_uuid() primary key,
  teacher_email text not null,
  class text not null,
  session text default '2026/2027',
  term text default '1st Term',
  adm_no text default '',
  full_name text not null,
  gender text default '',
  dob text default '',
  position integer,
  total_students integer,
  created_at timestamptz default now()
);

-- Results table (scores per subject per student)
create table if not exists eca_results (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references eca_students(id) on delete cascade,
  teacher_email text not null,
  session text default '2026/2027',
  term text default '1st Term',
  subject text not null,
  cw numeric default 0,
  asst numeric default 0,
  mid numeric default 0,
  exam numeric default 0,
  total numeric default 0,
  grade text default '',
  remark text default '',
  created_at timestamptz default now()
);

-- Allow all access (app handles who can see what)
alter table eca_teachers enable row level security;
alter table eca_students enable row level security;
alter table eca_results  enable row level security;

create policy "public_access_teachers" on eca_teachers for all using (true) with check (true);
create policy "public_access_students" on eca_students for all using (true) with check (true);
create policy "public_access_results"  on eca_results  for all using (true) with check (true);
```

You should see **"Success. No rows returned"** — that means it worked.

---

## STEP 3 — Get Your API Keys
1. In Supabase → **Project Settings** (gear icon, bottom left)
2. Click **API**
3. Copy these **two values**:
   - **Project URL** → looks like `https://abcdefgh.supabase.co`
   - **anon public** key → long string starting with `eyJ...`

---

## STEP 4 — Paste Keys Into The App
Open **supabase-config.js** and replace:

```javascript
var SUPABASE_URL = 'https://ydbydulsfdsfazqycmpu.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYnlkdWxzZmRzZmF6cXljbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDIxMzgsImV4cCI6MjEwNzM3ODEzOH0.YOikRlQ6_enUJdhnFYYngPe-J-e2euFhQoJyguLyLWw';
```

With your real values:

```javascript
var SUPABASE_URL = 'https://ydbydulsfdsfazqycmpu.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYnlkdWxzZmRzZmF6cXljbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDIxMzgsImV4cCI6MjEwNzM3ODEzOH0.YOikRlQ6_enUJdhnFYYngPe-J-e2euFhQoJyguLyLWw';
```

Save the file and push to GitHub. **Done!**

---

## What Gets Stored in the Database

| Table | What it stores |
|---|---|
| `eca_teachers` | Teacher profiles — name, email, class assigned |
| `eca_students` | Students — name, admission no, class, position |
| `eca_results` | Scores — CW, Assignment, Mid-Term, Exam per subject |

Data is **shared across all devices** — a teacher enters scores on phone, 
another teacher (or you as admin) can see it on desktop.
