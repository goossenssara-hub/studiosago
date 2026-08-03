create table if not exists public.photo_gallery_favorites (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.photo_galleries(id) on delete cascade,
  image_id uuid not null references public.photo_gallery_images(id) on delete cascade,
  visitor_key text not null,
  created_at timestamptz not null default now(),
  unique (gallery_id, image_id, visitor_key)
);

create index if not exists photo_gallery_favorites_gallery_idx
  on public.photo_gallery_favorites (gallery_id);
create index if not exists photo_gallery_favorites_visitor_idx
  on public.photo_gallery_favorites (visitor_key);

alter table public.photo_gallery_favorites enable row level security;

-- De publieke galerij gebruikt uitsluitend serverroutes met de service-role-key.
-- Daarom zijn geen publieke RLS-policies nodig.

notify pgrst, 'reload schema';
