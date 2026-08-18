import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Compatibiliteitsroute voor oude links. Alle galerijen gebruiken voortaan
// hetzelfde nieuwe systeem: photo_galleries + photo_gallery_images + photo-galleries.
export default async function LegacyGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: gallery } = await getSupabaseAdmin()
    .from("photo_galleries")
    .select("slug,share_token,status")
    .eq("slug", slug)
    .maybeSingle();

  if (!gallery || gallery.status !== "active" || !gallery.share_token) notFound();
  redirect(`/fotografie/galerij/${gallery.slug}?token=${encodeURIComponent(gallery.share_token)}`);
}
