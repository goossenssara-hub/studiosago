import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import PublicGalleryClient from "@/components/photography/PublicGalleryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 6;

type GalleryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const { slug } = await params;
  const { token } = await searchParams;
  if (!token) notFound();

  const supabase = getSupabaseAdmin();
  const { data: gallery, error: galleryError } = await supabase
    .from("photo_galleries")
    .select("*")
    .eq("slug", slug)
    .eq("share_token", token)
    .eq("status", "active")
    .single();

  if (galleryError || !gallery) notFound();

  const { data: images, error: imageError } = await supabase
    .from("photo_gallery_images")
    .select("id,storage_path,file_name,sort_order,is_cover,r2_original_key")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: true });

  if (imageError) throw imageError;

  const paths = (images ?? []).map((image) => image.storage_path);
  const { data: signedUrls } = paths.length
    ? await supabase.storage
        .from("photo-galleries")
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS)
    : { data: [] };

  const urlByPath = new Map(
    (signedUrls ?? []).map((item) => [item.path, item.signedUrl ?? ""]),
  );

  // Het Free-plan ondersteunt geen Image Transformations. Daarom gebruiken we
  // één gebundelde signed-URL-aanvraag en laden we de foto’s progressief in de browser.
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
      token={token}
      gallery={{
        title: gallery.title,
        clientName: gallery.client_name,
        shootDate: gallery.shoot_date,
        location: gallery.location,
        introTitle: gallery.intro_title || gallery.title,
        introText: gallery.intro_text || gallery.welcome_message || "",
        galleryStyle: gallery.gallery_style || "editorial",
        accentColor: gallery.accent_color || "#d97045",
        downloads: gallery.download_zip_key ? "all" : "none",
        favoritesEnabled: gallery.favorites_enabled !== false,
      }}
      images={signedImages.filter((image) => image.url)}
    />
  );
}
