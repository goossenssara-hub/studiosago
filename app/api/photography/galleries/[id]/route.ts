import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/admin-services";
import { createR2PresignedUrl, listR2Objects, r2IsConfigured } from "@/lib/fotografie/r2";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const MAX_PHOTOS_PER_GALLERY = 250;
const PHOTOGRAPHY_SOFT_BUDGET = 800 * 1024 * 1024;
const PROJECT_STORAGE_SAFETY_LIMIT = 800 * 1024 * 1024;

type GalleryImageUpdate = { id: string; sortOrder: number; isCover: boolean };
type DeletedImage = { id: string; storagePath: string };

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const candidate = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts = [candidate.message, candidate.details, candidate.hint, candidate.code]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
    if (parts.length) return parts.join(" · ");
  }
  return "Onbekende fout";
}

async function galleryMeta(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("photo_galleries")
    .select("id,slug,share_token")
    .eq("id", id)
    .single();
  if (error || !data) throw error ?? new Error("Galerij niet gevonden.");
  return data;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let stage = "voorbereiden";

  try {
    const body = await request.json() as {
      form?: Record<string, unknown>;
      images?: GalleryImageUpdate[];
      deletedImages?: DeletedImage[];
    };

    const form = body.form ?? {};
    const images = body.images ?? [];
    const deletedImages = body.deletedImages ?? [];
    const supabase = getSupabaseAdmin();

    stage = "galerijgegevens opslaan";
    const { error: galleryError } = await supabase.from("photo_galleries").update({
      title: form.title,
      client_name: form.clientName || null,
      shoot_date: form.shootDate || null,
      location: form.location || null,
      notes: form.notes || null,
      intro_title: form.introTitle || null,
      intro_text: form.introText || null,
      gallery_style: form.galleryStyle || "editorial",
      accent_color: form.accentColor || "#d97045",
      expiry_setting: form.expirySetting || "none",
      downloads: form.downloads || "none",
      favorites_enabled: form.favoritesEnabled !== false,
      watermark: form.watermark === true,
      status: form.status || "draft",
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (galleryError) throw galleryError;

    // Eerst alle blijvende foto's naar unieke tijdelijke posities verplaatsen.
    if (images.length) {
      stage = "fotovolgorde voorbereiden";
      const temporaryBase = 1_000_000 + Math.floor(Date.now() % 100_000);
      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        const { data: updated, error } = await supabase
          .from("photo_gallery_images")
          .update({ sort_order: temporaryBase + index, is_cover: false })
          .eq("gallery_id", id)
          .eq("id", image.id)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!updated) throw new Error(`Foto ${image.id} is niet gekoppeld aan deze galerij.`);
      }

      stage = "fotovolgorde opslaan";
      for (const image of images) {
        const { data: updated, error } = await supabase
          .from("photo_gallery_images")
          .update({ sort_order: image.sortOrder, is_cover: image.isCover })
          .eq("gallery_id", id)
          .eq("id", image.id)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!updated) throw new Error(`Foto ${image.id} kon niet in de definitieve volgorde worden geplaatst.`);
      }
    }

    if (deletedImages.length) {
      stage = "foto's verwijderen";
      const ids = deletedImages.map((image) => image.id);
      const paths = deletedImages.map((image) => image.storagePath).filter(Boolean);

      const { error: deleteRowsError } = await supabase
        .from("photo_gallery_images")
        .delete()
        .eq("gallery_id", id)
        .in("id", ids);
      if (deleteRowsError) throw deleteRowsError;

      if (paths.length) {
        const { error: storageError } = await supabase.storage.from("photo-galleries").remove(paths);
        if (storageError) console.warn("Storage cleanup warning:", storageError);
      }
    }

    stage = "galerij controleren";
    const { count, error: countError } = await supabase
      .from("photo_gallery_images")
      .select("id", { count: "exact", head: true })
      .eq("gallery_id", id);
    if (countError) throw countError;

    const meta = await galleryMeta(id);
    revalidatePath(`/fotografie/galerij/${meta.slug}`);
    revalidatePath(`/admin/fotografie/galerijen/${id}`);

    return NextResponse.json({ ok: true, imageCount: count ?? 0 });
  } catch (error) {
    console.error(`Gallery update error during ${stage}:`, error);
    return NextResponse.json({
      error: `Opslaan mislukte tijdens: ${stage}. ${errorMessage(error)}`,
    }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let storagePath = "";

  try {
    const data = await request.formData();
    const photo = data.get("photo");
    const sortOrder = Number(data.get("sortOrder") || 0);
    const isCover = String(data.get("isCover")) === "true";
    const r2OriginalKey = String(data.get("r2OriginalKey") || "").trim() || null;
    const r2OriginalName = String(data.get("r2OriginalName") || "").trim() || null;
    const r2OriginalSizeBytes = Number(data.get("r2OriginalSizeBytes") || 0);

    if (!(photo instanceof File)) {
      return NextResponse.json({ error: "Selecteer een geldige JPG-foto." }, { status: 400 });
    }
    if (!(photo.type === "image/jpeg" || /\.jpe?g$/i.test(photo.name))) {
      return NextResponse.json({ error: "Alleen JPG- en JPEG-bestanden zijn toegestaan." }, { status: 400 });
    }
    if (photo.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Deze foto is groter dan 2 MB na optimalisatie en wordt niet opgeslagen." }, { status: 413 });
    }

    const supabase = getSupabaseAdmin();
    const { count: currentCount, error: countLimitError } = await supabase
      .from("photo_gallery_images")
      .select("id", { count: "exact", head: true })
      .eq("gallery_id", id);
    if (countLimitError) throw countLimitError;
    if ((currentCount ?? 0) >= MAX_PHOTOS_PER_GALLERY) {
      return NextResponse.json({ error: `Maximaal ${MAX_PHOTOS_PER_GALLERY} foto’s per galerij.` }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Fotografie-opslag heeft het fotografiebudget van 500 MB bereikt. Verwijder eerst oude foto’s of verhoog bewust je opslagplan." }, { status: 507 });
    }

    const meta = await galleryMeta(id);
    const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    storagePath = `${id}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;
    const bytes = Buffer.from(await photo.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("photo-galleries")
      .upload(storagePath, bytes, {
        contentType: photo.type || "image/jpeg",
        upsert: false,
        cacheControl: "31536000",
      });
    if (uploadError) throw uploadError;

    if (isCover) {
      const { error: clearCoverError } = await supabase
        .from("photo_gallery_images")
        .update({ is_cover: false })
        .eq("gallery_id", id);
      if (clearCoverError) throw clearCoverError;
    }

    // De foto is pas succesvol geüpload wanneer ook de databaserij bestaat.
    let { data: inserted, error: insertError } = await supabase
      .from("photo_gallery_images")
      .insert({
        gallery_id: id,
        storage_path: storagePath,
        file_name: photo.name,
        sort_order: sortOrder,
        is_cover: isCover,
        file_size_bytes: photo.size,
        r2_original_key: r2OriginalKey,
        r2_original_name: r2OriginalName,
        r2_original_size_bytes: r2OriginalSizeBytes || 0,
        r2_original_updated_at: r2OriginalKey ? new Date().toISOString() : null,
      })
      .select("id,file_name,storage_path,sort_order,is_cover,r2_original_key,r2_original_name,r2_original_size_bytes")
      .single();

    if (insertError && /file_size_bytes/i.test(insertError.message || "")) {
      const fallback = await supabase
        .from("photo_gallery_images")
        .insert({
          gallery_id: id,
          storage_path: storagePath,
          file_name: photo.name,
          sort_order: sortOrder,
          is_cover: isCover,
        })
        .select("id,file_name,storage_path,sort_order,is_cover,r2_original_key,r2_original_name,r2_original_size_bytes")
        .single();
      inserted = fallback.data;
      insertError = fallback.error;
    }
    if (insertError || !inserted) throw insertError ?? new Error("De foto kon niet aan de galerij worden gekoppeld.");

    const { data: verified, error: verifyError } = await supabase
      .from("photo_gallery_images")
      .select("id,file_name,storage_path,sort_order,is_cover,r2_original_key,r2_original_name,r2_original_size_bytes")
      .eq("gallery_id", id)
      .eq("id", inserted.id)
      .single();
    if (verifyError || !verified) throw verifyError ?? new Error("De galerijkoppeling kon niet worden gecontroleerd.");

    const { data: signed, error: signedError } = await supabase.storage
      .from("photo-galleries")
      .createSignedUrl(storagePath, 60 * 60 * 6);
    if (signedError) throw signedError;

    revalidatePath(`/fotografie/galerij/${meta.slug}`);
    revalidatePath(`/admin/fotografie/galerijen/${id}`);

    return NextResponse.json({
      ok: true,
      image: {
        id: verified.id,
        file_name: verified.file_name,
        storage_path: verified.storage_path,
        sort_order: verified.sort_order,
        is_cover: verified.is_cover,
        url: signed.signedUrl,
        r2_original_key: verified.r2_original_key ?? null,
        r2_original_name: verified.r2_original_name ?? null,
        r2_original_size_bytes: Number(verified.r2_original_size_bytes || 0),
      },
    });
  } catch (error) {
    console.error("Gallery image upload error:", error);
    if (storagePath) {
      try {
        await getSupabaseAdmin().storage.from("photo-galleries").remove([storagePath]);
      } catch (cleanupError) {
        console.warn("Orphan upload cleanup failed:", cleanupError);
      }
    }
    return NextResponse.json({
      error: errorMessage(error) || "De nieuwe foto kon niet aan de galerij worden gekoppeld.",
    }, { status: 500 });
  }
}


export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  try {
    const { data: gallery, error: galleryError } = await supabase
      .from("photo_galleries")
      .select("id,slug,title")
      .eq("id", id)
      .single();

    if (galleryError || !gallery) {
      return NextResponse.json({ error: "Galerij niet gevonden." }, { status: 404 });
    }

    const { data: images, error: imagesError } = await supabase
      .from("photo_gallery_images")
      .select("id,storage_path,r2_original_key")
      .eq("gallery_id", id);

    if (imagesError) throw imagesError;

    // 1. Verwijder alle lichte webfoto's uit Supabase Storage.
    const storagePaths = (images ?? [])
      .map((image) => image.storage_path)
      .filter((value): value is string => Boolean(value));

    if (storagePaths.length) {
      const { error: storageError } = await supabase.storage
        .from("photo-galleries")
        .remove(storagePaths);

      if (storageError) {
        throw new Error(`Webfoto's konden niet uit Supabase Storage worden verwijderd: ${storageError.message}`);
      }
    }

    // 2. Verwijder de volledige R2-map van deze galerij.
    // Dit pakt zowel gekoppelde originelen als rechtstreeks in R2 geüploade
    // bestanden mee die nog geen kleine webversie hadden.
    if (r2IsConfigured()) {
      const prefix = `galleries/${id}/`;
      const objects = await listR2Objects(prefix);

      for (const object of objects) {
        const response = await fetch(
          createR2PresignedUrl({
            method: "DELETE",
            key: object.key,
            expiresSeconds: 300,
          }),
          { method: "DELETE" },
        );

        if (!response.ok && response.status !== 404) {
          throw new Error(`R2-bestand kon niet worden verwijderd: ${object.key} (HTTP ${response.status})`);
        }
      }
    }

    // 3. Database-items opruimen. Favorieten/selecties mogen via FK-cascade
    // verdwijnen; de galerijfoto's verwijderen we expliciet.
    const { error: deleteImagesError } = await supabase
      .from("photo_gallery_images")
      .delete()
      .eq("gallery_id", id);

    if (deleteImagesError) throw deleteImagesError;

    const { error: deleteGalleryError } = await supabase
      .from("photo_galleries")
      .delete()
      .eq("id", id);

    if (deleteGalleryError) throw deleteGalleryError;

    revalidatePath("/admin/fotografie");
    revalidatePath("/galerij");
    revalidatePath(`/fotografie/galerij/${gallery.slug}`);

    return NextResponse.json({
      ok: true,
      deletedGalleryId: id,
      deletedWebPhotos: storagePaths.length,
    });
  } catch (error) {
    console.error("Gallery delete error:", error);
    return NextResponse.json({
      error: errorMessage(error) || "De galerij kon niet worden verwijderd.",
    }, { status: 500 });
  }
}
