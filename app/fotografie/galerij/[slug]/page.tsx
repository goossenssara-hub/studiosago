import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import PublicGalleryClient from "@/components/photography/PublicGalleryClient";

export const dynamic = "force-dynamic";

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
    .select("id,storage_path,file_name,sort_order,is_cover")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: true });

  if (imageError) throw imageError;

  const paths = (images ?? []).map((image) => image.storage_path);
  const { data: originalSignedUrls } = paths.length
    ? await supabase.storage
        .from("photo-galleries")
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS)
    : { data: [] };

  const originalUrlByPath = new Map(
    (originalSignedUrls ?? []).map((item) => [item.path, item.signedUrl ?? ""]),
  );

  // De galerij gebruikt geoptimaliseerde webversies. Daardoor hoeft de browser
  // niet voor elke tegel het volledige JPG-origineel te downloaden.
  const signedImages = await Promise.all(
    (images ?? []).map(async (image, index) => {
      const fallbackUrl = originalUrlByPath.get(image.storage_path) ?? "";
      const { data: webData } = await supabase.storage
        .from("photo-galleries")
        .createSignedUrl(image.storage_path, SIGNED_URL_TTL_SECONDS, {
          transform: {
            width: index === 0 || image.is_cover ? 2000 : 1400,
            quality: 78,
            resize: "contain",
          },
        });

      return {
        id: image.id,
        fileName: image.file_name,
        sortOrder: image.sort_order,
        isCover: image.is_cover,
        url: webData?.signedUrl || fallbackUrl,
        originalUrl: fallbackUrl || webData?.signedUrl || "",
      };
    }),
  );

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
        downloads: gallery.downloads || gallery.download_mode || "individual",
        favoritesEnabled: gallery.favorites_enabled !== false,
      }}
      images={signedImages.filter((image) => image.url)}
    />
  );
}
