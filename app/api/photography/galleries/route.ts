import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const MAX_PHOTOS_PER_GALLERY = 250;
const PHOTOGRAPHY_SOFT_BUDGET = 800 * 1024 * 1024;
const PROJECT_STORAGE_SAFETY_LIMIT = 800 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body.action === "create") return createGallery(request, body.form);
      if (body.action === "finalize") return finalizeGallery(request, body.galleryId);
      return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
    }

    const data = await request.formData();
    if (String(data.get("action")) === "upload") return uploadPhoto(data);
    return NextResponse.json({ error: "Onbekende uploadactie." }, { status: 400 });
  } catch (error) {
    console.error("Photography gallery publish error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Publiceren mislukt." }, { status: 500 });
  }
}

async function createGallery(request: Request, form: Record<string, unknown>) {
  if (!form?.title || !form?.client || !form?.shootDate) {
    return NextResponse.json({ error: "Vul de verplichte gegevens in." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const shareToken = randomBytes(18).toString("hex");
  const slug = `${slugify(String(form.title))}-${shareToken.slice(0, 6)}`;
  const passwordHash = createHash("sha256").update(String(form.password || "")).digest("hex");

  const { data: gallery, error } = await supabase.from("photo_galleries").insert({
    title: form.title,
    client_name: form.client,
    shoot_date: form.shootDate,
    location: form.location || null,
    notes: form.notes || null,
    slug,
    share_token: shareToken,
    password_hash: passwordHash,
    status: "draft",
    gallery_style: form.galleryStyle,
    accent_color: form.accentColor,
    expiry_setting: form.expiry,
    watermark: form.watermark,
    intro_title: form.introTitle,
    intro_text: form.introText,
    downloads: form.downloads,
    favorites_enabled: form.favorites,
  }).select("id").single();

  if (error) throw error;
  const origin = new URL(request.url).origin;
  return NextResponse.json({ galleryId: gallery.id, url: `${origin}/fotografie/galerij/${slug}?token=${shareToken}` });
}

async function uploadPhoto(data: FormData) {
  const galleryId = String(data.get("galleryId") || "");
  const sortOrder = Number(data.get("sortOrder") || 0);
  const isCover = String(data.get("isCover")) === "true";
  const photo = data.get("photo");

  if (!galleryId || !(photo instanceof File)) return NextResponse.json({ error: "Ongeldige foto-upload." }, { status: 400 });
  if (!(photo.type === "image/jpeg" || /\.jpe?g$/i.test(photo.name))) return NextResponse.json({ error: "Alleen JPG/JPEG is toegestaan." }, { status: 400 });
  if (photo.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Deze foto is groter dan 2 MB na optimalisatie en wordt niet opgeslagen." }, { status: 413 });

  const supabase = getSupabaseAdmin();
  const { count, error: countError } = await supabase.from("photo_gallery_images").select("id", { count: "exact", head: true }).eq("gallery_id", galleryId);
  if (countError) throw countError;
  if ((count ?? 0) >= MAX_PHOTOS_PER_GALLERY) return NextResponse.json({ error: `Maximaal ${MAX_PHOTOS_PER_GALLERY} foto’s per galerij om Supabase Storage beheersbaar te houden.` }, { status: 400 });

  const totalUsage = await supabase.rpc("get_storage_usage_bytes");
  if (totalUsage.error) {
    return NextResponse.json({ error: "Totale Supabase-opslagbewaking is nog niet actief. Voer eerst 20260818_photography_r2_downloads.sql uit; de upload is niet gestart." }, { status: 503 });
  }
  if (Number(totalUsage.data || 0) + photo.size > PROJECT_STORAGE_SAFETY_LIMIT) {
    return NextResponse.json({ error: "Supabase Storage zit op of boven de veiligheidsgrens van 800 MB. Deze foto is NIET geüpload. Ruim eerst Storage op." }, { status: 507 });
  }

  const usage = await supabase.from("photo_gallery_images").select("file_size_bytes");
  if (usage.error) {
    return NextResponse.json({ error: "Opslagbewaking is nog niet actief. Voer eerst 20260817_photography_storage_usage.sql uit; de upload is niet gestart." }, { status: 503 });
  }
  const usedBytes = (usage.data ?? []).reduce((sum, row) => sum + Number(row.file_size_bytes || 0), 0);
  if (usedBytes + photo.size > PHOTOGRAPHY_SOFT_BUDGET) {
    return NextResponse.json({ error: "Fotografie-opslag heeft het fotografiebudget van 500 MB bereikt. Verwijder eerst oude galerijen/foto’s of verhoog bewust je opslagplan." }, { status: 507 });
  }

  const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${galleryId}/${String(sortOrder + 1).padStart(4, "0")}-${Date.now()}-${safeName}`;
  const bytes = Buffer.from(await photo.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("photo-galleries").upload(path, bytes, {
    contentType: "image/jpeg",
    upsert: false,
    cacheControl: "31536000",
  });
  if (uploadError) throw uploadError;

  let imageError: unknown = null;
  let inserted = false;
  const withSize = await supabase.from("photo_gallery_images").insert({
    gallery_id: galleryId,
    storage_path: path,
    file_name: photo.name,
    sort_order: sortOrder,
    is_cover: isCover,
    file_size_bytes: photo.size,
  });
  imageError = withSize.error;

  if (withSize.error && /file_size_bytes/i.test(withSize.error.message || "")) {
    const fallback = await supabase.from("photo_gallery_images").insert({
      gallery_id: galleryId,
      storage_path: path,
      file_name: photo.name,
      sort_order: sortOrder,
      is_cover: isCover,
    });
    imageError = fallback.error;
    inserted = !fallback.error;
  } else {
    inserted = !withSize.error;
  }

  if (!inserted) {
    await supabase.storage.from("photo-galleries").remove([path]);
    throw imageError;
  }

  const { data: savedImage, error: savedImageError } = await supabase
    .from("photo_gallery_images")
    .select("id")
    .eq("gallery_id", galleryId)
    .eq("storage_path", path)
    .single();
  if (savedImageError || !savedImage) {
    await supabase.storage.from("photo-galleries").remove([path]);
    await supabase.from("photo_gallery_images").delete().eq("gallery_id", galleryId).eq("storage_path", path);
    throw savedImageError ?? new Error("De galerijfoto kon niet worden gecontroleerd.");
  }

  return NextResponse.json({ ok: true, bytes: photo.size, imageId: savedImage.id });
}

async function finalizeGallery(request: Request, galleryId: string) {
  if (!galleryId) return NextResponse.json({ error: "Galerij-id ontbreekt." }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data: gallery, error: readError } = await supabase.from("photo_galleries").select("slug,share_token").eq("id", galleryId).single();
  if (readError) throw readError;
  const { error: updateError } = await supabase.from("photo_galleries").update({ status: "active" }).eq("id", galleryId);
  if (updateError) throw updateError;
  const origin = new URL(request.url).origin;
  return NextResponse.json({ url: `${origin}/fotografie/galerij/${gallery.slug}?token=${gallery.share_token}` });
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "galerij";
}
