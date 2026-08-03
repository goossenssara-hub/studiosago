create extension if not exists pgcrypto;
create table if not exists public.photo_galleries (
 id uuid primary key default gen_random_uuid(), title text not null, client_name text not null, shoot_date date not null, location text, notes text, slug text unique not null, share_token text unique not null, password_hash text not null, status text not null default 'active', gallery_style text not null default 'editorial', accent_color text not null default '#d97045', expiry_setting text, watermark boolean not null default false, intro_title text, intro_text text, downloads text not null default 'all', favorites_enabled boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.photo_gallery_images (
 id uuid primary key default gen_random_uuid(), gallery_id uuid not null references public.photo_galleries(id) on delete cascade, storage_path text not null, file_name text not null, sort_order integer not null default 0, is_cover boolean not null default false, created_at timestamptz not null default now()
);
insert into storage.buckets (id,name,public) values ('photo-galleries','photo-galleries',false) on conflict (id) do nothing;
alter table public.photo_galleries enable row level security;
alter table public.photo_gallery_images enable row level security;
