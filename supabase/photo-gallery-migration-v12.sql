-- SaGo Photography Gallery migration V12
-- Run this entire file once in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.photo_galleries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text not null,
  shoot_date date not null,
  location text,
  notes text,
  slug text unique not null,
  share_token text unique not null,
  password_hash text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

-- Existing installations may have an older version of photo_galleries.
-- ADD COLUMN IF NOT EXISTS safely upgrades that table without deleting data.
alter table public.photo_galleries
  add column if not exists gallery_style text not null default 'editorial',
  add column if not exists accent_color text not null default '#d97045',
  add column if not exists expiry_setting text,
  add column if not exists watermark boolean not null default false,
  add column if not exists intro_title text,
  add column if not exists intro_text text,
  add column if not exists downloads text not null default 'all',
  add column if not exists favorites_enabled boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.photo_gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.photo_galleries(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.photo_gallery_images
  add column if not exists storage_path text,
  add column if not exists file_name text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_cover boolean not null default false;

insert into storage.buckets (id, name, public)
values ('photo-galleries', 'photo-galleries', false)
on conflict (id) do update set public = excluded.public;

alter table public.photo_galleries enable row level security;
alter table public.photo_gallery_images enable row level security;

-- Ask PostgREST to refresh its schema cache immediately.
notify pgrst, 'reload schema';

-- Optional verification output
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'photo_galleries'
order by ordinal_position;
