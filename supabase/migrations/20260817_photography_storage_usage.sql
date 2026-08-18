-- Alleen metadata; de foto's zelf blijven uitsluitend in Storage.
alter table if exists public.photo_gallery_images
  add column if not exists file_size_bytes bigint not null default 0;

create index if not exists photo_gallery_images_gallery_id_idx
  on public.photo_gallery_images (gallery_id);

-- Bestaande bestanden krijgen, waar mogelijk, hun werkelijke grootte uit storage.objects.
update public.photo_gallery_images as p
set file_size_bytes = coalesce((o.metadata ->> 'size')::bigint, 0)
from storage.objects as o
where o.bucket_id = 'photo-galleries'
  and o.name = p.storage_path
  and p.file_size_bytes = 0;
