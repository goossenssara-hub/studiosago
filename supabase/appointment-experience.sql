-- =========================================================
-- Studio SaGo: uitgebreide afspraakervaring
-- Voer dit één keer uit in Supabase SQL Editor.
-- =========================================================

alter table public.bookings
  add column if not exists instructor_name text default 'Sara Goossens',
  add column if not exists reminder_24h_sent_at timestamptz,
  add column if not exists reminder_1h_sent_at timestamptz;

create table if not exists public.appointment_files (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists appointment_files_booking_id_idx
  on public.appointment_files(booking_id);

create table if not exists public.lesson_reports (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  report_date date,
  completed_items text[] not null default '{}',
  next_steps text[] not null default '{}',
  general_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointment_feedback (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_user_id uuid references auth.users(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointment_files enable row level security;
alter table public.lesson_reports enable row level security;
alter table public.appointment_feedback enable row level security;

-- De serverroutes gebruiken de service role en controleren de ingelogde gebruiker.
-- Daarom zijn rechtstreekse clientacties standaard geblokkeerd.

insert into storage.buckets (id, name, public, file_size_limit)
values ('appointment-files', 'appointment-files', false, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;
