-- =========================================================
-- Studio SaGo premium afspraakfuncties
-- Voer dit één keer uit in Supabase SQL Editor.
-- =========================================================

alter table public.bookings
  add column if not exists instructor_photo_url text,
  add column if not exists payment_id text,
  add column if not exists invoice_url text,
  add column if not exists payment_status text default 'unknown';

create table if not exists public.appointment_homework (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  items text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointment_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  sender_role text not null check (sender_role in ('customer', 'admin')),
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists appointment_messages_booking_id_idx
  on public.appointment_messages(booking_id, created_at);

alter table public.appointment_homework enable row level security;
alter table public.appointment_messages enable row level security;
