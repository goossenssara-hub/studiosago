alter table if exists public.photo_gallery_images
  add column if not exists r2_original_key text,
  add column if not exists r2_original_name text,
  add column if not exists r2_original_size_bytes bigint not null default 0,
  add column if not exists r2_original_updated_at timestamptz;
create index if not exists photo_gallery_images_r2_original_key_idx
  on public.photo_gallery_images (r2_original_key) where r2_original_key is not null;
