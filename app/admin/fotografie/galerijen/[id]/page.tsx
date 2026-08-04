import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import EditGalleryClient from "@/components/photography/EditGalleryClient";

export const dynamic = "force-dynamic";
const TTL = 60 * 60 * 6;

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const [{ data: gallery }, { data: images }] = await Promise.all([
    supabase.from("photo_galleries").select("*").eq("id", id).maybeSingle(),
    supabase.from("photo_gallery_images").select("id,file_name,storage_path,sort_order,is_cover").eq("gallery_id", id).order("sort_order"),
  ]);
  if (!gallery) notFound();

  const paths = (images ?? []).map((image) => image.storage_path);
  const { data: signed } = paths.length
    ? await supabase.storage.from("photo-galleries").createSignedUrls(paths, TTL)
    : { data: [] };
  const urlMap = new Map((signed ?? []).map((item) => [item.path, item.signedUrl ?? ""]));

  return <EditGalleryClient gallery={gallery} initialImages={(images ?? []).map((image) => ({
    id: image.id,
    file_name: image.file_name,
    sort_order: image.sort_order,
    is_cover: image.is_cover,
    url: urlMap.get(image.storage_path) ?? "",
    storage_path: image.storage_path,
  }))} />;
}
