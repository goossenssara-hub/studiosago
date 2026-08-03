import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const maxDuration = 300;

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publiceren mislukt." },
      { status: 500 },
    );
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

  const { data: gallery, error } = await supabase
    .from("photo_galleries")
    .insert({
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
    })
    .select("id")
    .single();

  if (error) throw error;
  const origin = new URL(request.url).origin;
  return NextResponse.json({
    galleryId: gallery.id,
    url: `${origin}/fotografie/galerij/${slug}?token=${shareToken}`,
  });
}

async function uploadPhoto(data: FormData) {
  const galleryId = String(data.get("galleryId") || "");
  const sortOrder = Number(data.get("sortOrder") || 0);
  const isCover = String(data.get("isCover")) === "true";
  const photo = data.get("photo");

  if (!galleryId || !(photo instanceof File)) {
    return NextResponse.json({ error: "Ongeldige foto-upload." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${galleryId}/${String(sortOrder + 1).padStart(4, "0")}-${safeName}`;
  const bytes = Buffer.from(await photo.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("photo-galleries")
    .upload(path, bytes, {
      contentType: photo.type || "image/jpeg",
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const { error: imageError } = await supabase.from("photo_gallery_images").insert({
    gallery_id: galleryId,
    storage_path: path,
    file_name: photo.name,
    sort_order: sortOrder,
    is_cover: isCover,
  });
  if (imageError) throw imageError;

  return NextResponse.json({ ok: true });
}

async function finalizeGallery(request: Request, galleryId: string) {
  if (!galleryId) return NextResponse.json({ error: "Galerij-id ontbreekt." }, { status: 400 });
  const supabase = getSupabaseAdmin();

  const { data: gallery, error: readError } = await supabase
    .from("photo_galleries")
    .select("slug,share_token")
    .eq("id", galleryId)
    .single();
  if (readError) throw readError;

  const { error: updateError } = await supabase
    .from("photo_galleries")
    .update({ status: "active" })
    .eq("id", galleryId);
  if (updateError) throw updateError;

  const origin = new URL(request.url).origin;
  return NextResponse.json({
    url: `${origin}/fotografie/galerij/${gallery.slug}?token=${gallery.share_token}`,
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "galerij";
}
