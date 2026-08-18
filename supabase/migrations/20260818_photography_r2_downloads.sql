-- Alleen verwijzingen naar Cloudflare R2 worden in Supabase bewaard.
-- De grote ZIP-bestanden zelf staan NOOIT in Supabase Storage.
alter table if exists public.photo_galleries
  add column if not exists download_zip_key text,
  add column if not exists download_zip_name text,
  add column if not exists download_zip_size_bytes bigint not null default 0,
  add column if not exists download_zip_updated_at timestamptz;

-- Tweede veiligheidslaag voor de webgalerij: nooit grote bestanden in Supabase.
update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg']::text[]
where id = 'photo-galleries';

-- Geeft uitsluitend het totale aantal bytes terug dat momenteel in alle Storage-buckets staat.
-- De functie is alleen voor de server/service_role bedoeld en voorkomt dat fotografie
-- de resterende Supabase-opslag ongemerkt opsoupeert.
create or replace function public.get_storage_usage_bytes()
returns bigint
language sql
security definer
set search_path = public, storage
as $$
  select coalesce(sum(coalesce((metadata ->> 'size')::bigint, 0)), 0)::bigint
  from storage.objects;
$$;

revoke all on function public.get_storage_usage_bytes() from public;
grant execute on function public.get_storage_usage_bytes() to service_role;
