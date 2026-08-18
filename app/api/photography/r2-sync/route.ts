import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { listR2Objects, r2IsConfigured } from "@/lib/fotografie/r2";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  if (!r2IsConfigured()) {
    return NextResponse.json({ error: "Cloudflare R2 is nog niet gekoppeld." }, { status: 503 });
  }

  try {
    const url = new URL(request.url);
    const galleryId = url.searchParams.get("galleryId") || "";
    if (!galleryId) return NextResponse.json({ error: "Galerij-id ontbreekt." }, { status: 400 });

    const folder = `galleries/${galleryId}/originals/`;
    const originals = (await listR2Objects(folder))
      .filter((item) => /\.(jpe?g)$/i.test(item.key))
      .map((item) => ({
        ...item,
        name: fileNameFromKey(item.key),
        stem: stem(item.key),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "nl", { numeric: true }));

    const supabase = getSupabaseAdmin();
    const { data: images, error } = await supabase
      .from("photo_gallery_images")
      .select("id,file_name,r2_original_key,r2_original_name,r2_original_size_bytes")
      .eq("gallery_id", galleryId);
    if (error) throw error;

    const byStem = new Map<string, typeof originals[number]>();
    for (const original of originals) {
      if (!byStem.has(original.stem)) byStem.set(original.stem, original);
    }

    let linked = 0;
    const matchedKeys = new Set<string>();

    for (const image of images ?? []) {
      const original = byStem.get(stem(image.file_name || ""));
      if (!original) continue;
      matchedKeys.add(original.key);

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

      linked += 1;
    }

    return NextResponse.json({
      ok: true,
      folder,
      originalCount: originals.length,
      linkedCount: linked,
      awaitingWebCount: originals.filter((item) => !matchedKeys.has(item.key)).length,
      originals: originals.map((item) => ({
        key: item.key,
        name: item.name,
        size: item.size,
        lastModified: item.lastModified,
        linked: matchedKeys.has(item.key),
      })),
    });
  } catch (error) {
    console.error("R2 sync error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Synchroniseren met R2 is mislukt.",
    }, { status: 500 });
  }
}
