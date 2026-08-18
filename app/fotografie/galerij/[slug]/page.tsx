import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-services";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import PublicGalleryClient from "@/components/photography/PublicGalleryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 6;

type GalleryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    token?: string | string[];
    preview?: string | string[];
  }>;
};

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const { slug } = await params;
  const raw = await searchParams;

  const token = Array.isArray(raw.token) ? raw.token[0] : raw.token;
  const previewValue = Array.isArray(raw.preview) ? raw.preview[0] : raw.preview;
  const isPreview = previewValue === "1";

  if (!token) notFound();

  // Preview mag ook voor conceptgalerijen, maar uitsluitend voor een ingelogde admin.
  if (isPreview) {
    const auth = await requireAdmin();
    if (!auth.ok) notFound();
  }

  const supabase = getSupabaseAdmin();

  let galleryQuery = supabase
    .from("photo_galleries")
    .select("*")
    .eq("slug", slug)
    .eq("share_token", token.trim());

  if (!isPreview) {
    galleryQuery = galleryQuery.eq("status", "active");
  }

  const { data: gallery, error: galleryError } = await galleryQuery.maybeSingle();

  if (galleryError || !gallery) notFound();

  const { data: images, error: imageError } = await supabase
    .from("photo_gallery_images")
    .select("id,storage_path,file_name,sort_order,is_cover,r2_original_key")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: true });

  if (imageError) throw imageError;

  const paths = (images ?? []).map((image) => image.storage_path);

  const { data: signedUrls, error: signedUrlError } = paths.length
    ? await supabase.storage
        .from("photo-galleries")
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS)
    : { data: [], error: null };

  if (signedUrlError) {
    console.error("Signed gallery URLs konden niet worden gemaakt:", signedUrlError);
  }

  const urlByPath = new Map(
    (signedUrls ?? []).map((item) => [item.path, item.signedUrl ?? ""]),
  );

  const signedImages = (images ?? []).map((image) => {
    const url = urlByPath.get(image.storage_path) ?? "";

    return {
      id: image.id,
      fileName: image.file_name,
      sortOrder: image.sort_order,
      isCover: image.is_cover,
      url,
      originalUrl: url,
      highResAvailable: Boolean(image.r2_original_key),
    };
  });

  return (
    <PublicGalleryClient
      slug={slug}
      token={token.trim()}
      gallery={{
        title: gallery.title,
        clientName: gallery.client_name,
        shootDate: gallery.shoot_date,
        location: gallery.location,
        introTitle: gallery.intro_title || gallery.title,
        introText: gallery.intro_text || gallery.welcome_message || "",
        galleryStyle: gallery.gallery_style || "editorial",
        accentColor: gallery.accent_color || "#d97045",
        downloads: gallery.downloads || gallery.download_mode || "individual",
        favoritesEnabled: gallery.favorites_enabled !== false,
      }}
      images={signedImages.filter((image) => image.url)}
    />
  );
}
