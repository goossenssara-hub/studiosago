create table if not exists public.learning_platform_pioneers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null unique,
  role text,
  children_ages text,
  updates_consent boolean not null default false,
  privacy_consent boolean not null default false,
  lifetime_access_eligible boolean not null default true,
  source text not null default 'leerplatform-aanmeldpagina',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learning_platform_pioneers enable row level security;

-- Inschrijvingen verlopen via de server met de service-role key.
-- Daardoor is geen publieke insert- of select-policy nodig.

create index if not exists learning_platform_pioneers_created_at_idx
  on public.learning_platform_pioneers (created_at desc);
