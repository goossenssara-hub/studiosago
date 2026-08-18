import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin-services";
import {
  createR2PresignedUrl,
  listR2Objects,
  r2IsConfigured,
} from "@/lib/fotografie/r2";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const STORAGE_BUCKET = "photo-galleries";
const WEB_LONG_EDGE = 2200;
const WEB_JPEG_QUALITY = 78;
const CONCURRENCY = 3;

function stem(value: string) {
  const name = value.split("/").pop() || value;
  return name
    .toLowerCase()
    .replace(/\.(jpe?g|webp)$/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function fileNameFromKey(key: string) {
  return key.split("/").pop() || key;
}

function safeWebName(name: string) {
  const base = name.replace(/\.(jpe?g)$/i, "") || "foto";
  return `${base}.jpg`;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function runner() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runner()),
  );

  return results;
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  if (!r2IsConfigured()) {
    return NextResponse.json(
      { error: "Cloudflare R2 is nog niet gekoppeld." },
      { status: 503 },
    );
  }

  try {
    const url = new URL(request.url);
    const galleryId = url.searchParams.get("galleryId") || "";

    if (!galleryId) {
      return NextResponse.json(
        { error: "Galerij-id ontbreekt." },
        { status: 400 },
      );
    }

    const folder = `galleries/${galleryId}/originals/`;

    const originals = (await listR2Objects(folder))
      .filter((item) => /\.(jpe?g)$/i.test(item.key))
      .map((item) => ({
        ...item,
        name: fileNameFromKey(item.key),
        stem: stem(item.key),
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, "nl", { numeric: true }),
      );

    const supabase = getSupabaseAdmin();

    const { data: existingImages, error: imageError } = await supabase
      .from("photo_gallery_images")
      .select(
        "id,file_name,storage_path,sort_order,is_cover,r2_original_key,r2_original_name,r2_original_size_bytes",
      )
      .eq("gallery_id", galleryId)
      .order("sort_order", { ascending: true });

    if (imageError) throw imageError;

    const images = existingImages ?? [];
    const byStem = new Map(images.map((image) => [stem(image.file_name || ""), image]));

    // Eerst bestaande webfoto's koppelen aan hun grote R2-origineel.
    let linkedExisting = 0;

    for (const original of originals) {
      const image = byStem.get(original.stem);
      if (!image) continue;

      if (
        image.r2_original_key !== original.key ||
        image.r2_original_name !== original.name ||
        Number(image.r2_original_size_bytes || 0) !== original.size
      ) {
        const { error: updateError } = await supabase
          .from("photo_gallery_images")
          .update({
            r2_original_key: original.key,
            r2_original_name: original.name,
            r2_original_size_bytes: original.size,
            r2_original_updated_at: new Date().toISOString(),
          })
          .eq("gallery_id", galleryId)
          .eq("id", image.id);

        if (updateError) throw updateError;
      }

      linkedExisting += 1;
    }

    // Originelen zonder webfoto worden automatisch vanuit R2 opgehaald,
    // verkleind met Sharp en als lichte galerijversie in Supabase Storage gezet.
    const missing = originals.filter((original) => !byStem.has(original.stem));
    const startingSortOrder =
      images.reduce(
        (max, image) => Math.max(max, Number(image.sort_order || 0)),
        -1,
      ) + 1;

    let created = 0;
    const failures: Array<{ name: string; error: string }> = [];

    await mapWithConcurrency(missing, CONCURRENCY, async (original, index) => {
      try {
        const originalUrl = createR2PresignedUrl({
          method: "GET",
          key: original.key,
          expiresSeconds: 900,
        });

        const response = await fetch(originalUrl, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(
            `R2-download gaf HTTP ${response.status}.`,
          );
        }

        const source = Buffer.from(await response.arrayBuffer());

        const webBuffer = await sharp(source, {
          failOn: "warning",
          limitInputPixels: false,
        })
          .rotate()
          .resize({
            width: WEB_LONG_EDGE,
            height: WEB_LONG_EDGE,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({
            quality: WEB_JPEG_QUALITY,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer();

        const webName = safeWebName(original.name);
        const storagePath = `${galleryId}/web/${webName}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, webBuffer, {
            contentType: "image/jpeg",
            cacheControl: "31536000",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase
          .from("photo_gallery_images")
          .insert({
            gallery_id: galleryId,
            storage_path: storagePath,
            file_name: original.name,
            sort_order: startingSortOrder + index,
            is_cover: images.length === 0 && index === 0,
            r2_original_key: original.key,
            r2_original_name: original.name,
            r2_original_size_bytes: original.size,
            r2_original_updated_at: new Date().toISOString(),
          });

        if (insertError) {
          // Geen verweesd Storage-bestand achterlaten als de DB-write faalt.
          await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
          throw insertError;
        }

        created += 1;
      } catch (error) {
        console.error(`Webversie maken mislukt voor ${original.name}:`, error);
        failures.push({
          name: original.name,
          error:
            error instanceof Error
              ? error.message
              : "Onbekende fout bij het maken van de webversie.",
        });
      }
    });

    // Definitieve status opnieuw uit de database bepalen.
    const { data: finalImages, error: finalError } = await supabase
      .from("photo_gallery_images")
      .select("file_name,r2_original_key")
      .eq("gallery_id", galleryId);

    if (finalError) throw finalError;

    const finalByStem = new Map(
      (finalImages ?? []).map((image) => [stem(image.file_name || ""), image]),
    );

    const linkedCount = originals.filter((original) => {
      const image = finalByStem.get(original.stem);
      return Boolean(image?.r2_original_key);
    }).length;

    const awaitingWebCount = Math.max(0, originals.length - linkedCount);

    return NextResponse.json({
      ok: failures.length === 0,
      folder,
      originalCount: originals.length,
      linkedCount,
      createdWebCount: created,
      linkedExistingCount: linkedExisting,
      awaitingWebCount,
      failedCount: failures.length,
      failures: failures.slice(0, 20),
      originals: originals.map((item) => ({
        key: item.key,
        name: item.name,
        size: item.size,
        lastModified: item.lastModified,
        linked: Boolean(finalByStem.get(item.stem)?.r2_original_key),
      })),
    });
  } catch (error) {
    console.error("R2 sync error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Synchroniseren met R2 is mislukt.",
      },
      { status: 500 },
    );
  }
}
