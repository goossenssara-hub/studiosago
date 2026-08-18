import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TicketPayload = {
  v: 2;
  g: string;
  k: string[] | null; // exacte R2-objectkeys; null = volledige R2-map van deze galerij
  n: string;
  e: number;
};

function base64url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function safeFileName(value: string) {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}._ -]+/gu, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (cleaned || "SaGo-Photography").slice(0, 100);
}

export async function POST(request: Request) {
  try {
    const workerUrl = process.env.PHOTOGRAPHY_ZIP_WORKER_URL?.trim().replace(/\/+$/, "");
    const secret = process.env.PHOTOGRAPHY_ZIP_SIGNING_SECRET?.trim();

    if (!workerUrl || !secret) {
      return NextResponse.json(
        { error: "De automatische ZIP-download is nog niet gekoppeld aan Cloudflare." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const slug = String(body.slug || "").trim();
    const token = String(body.token || "").trim();
    const mode = body.mode === "selection" ? "selection" : "all";
    const preview = body.preview === true;
    const requestedIds = Array.isArray(body.imageIds)
      ? body.imageIds.map((id: unknown) => String(id)).filter(Boolean)
      : [];

    if (!slug || !token) {
      return NextResponse.json({ error: "Ongeldige galerijlink." }, { status: 400 });
    }

    if (mode === "selection" && !requestedIds.length) {
      return NextResponse.json({ error: "Selecteer eerst minstens één foto." }, { status: 400 });
    }

    if (requestedIds.length > 250) {
      return NextResponse.json(
        { error: "Een selectie kan maximaal 250 foto's bevatten." },
        { status: 400 },
      );
    }

    // Concept-preview is alleen toegestaan voor de ingelogde admin.
    if (preview) {
      const auth = await requireAdmin();
      if (!auth.ok) return auth.response;
    }

    const supabase = getSupabaseAdmin();

    let galleryQuery = supabase
      .from("photo_galleries")
      .select("id,title,downloads,download_mode,status")
      .eq("slug", slug)
      .eq("share_token", token);

    if (!preview) {
      galleryQuery = galleryQuery.eq("status", "active");
    }

    const { data: gallery, error: galleryError } = await galleryQuery.maybeSingle();

    if (galleryError || !gallery) {
      return NextResponse.json({ error: "Galerij niet gevonden." }, { status: 404 });
    }

    const downloadMode = gallery.downloads || gallery.download_mode || "individual";
    const allowAll = downloadMode === "all" || downloadMode === "individual_and_all";
    const allowSelection =
      downloadMode === "all" ||
      downloadMode === "favorites" ||
      downloadMode === "individual_and_all";

    if (mode === "all" && !allowAll) {
      return NextResponse.json(
        { error: "Download van de volledige galerij is niet ingeschakeld." },
        { status: 403 },
      );
    }

    if (mode === "selection" && !allowSelection) {
      return NextResponse.json(
        { error: "ZIP-download van een selectie is niet ingeschakeld." },
        { status: 403 },
      );
    }

    let query = supabase
      .from("photo_gallery_images")
      .select("id,r2_original_key,r2_original_name")
      .eq("gallery_id", gallery.id)
      .not("r2_original_key", "is", null);

    if (mode === "selection") {
      query = query.in("id", requestedIds);
    }

    const { data: images, error: imageError } = await query;
    if (imageError) throw imageError;

    const available = (images ?? []).filter(
      (image) => typeof image.r2_original_key === "string" && image.r2_original_key.length > 0,
    );

    if (!available.length) {
      return NextResponse.json(
        { error: "Voor deze download zijn nog geen hoge-resolutiefoto's beschikbaar." },
        { status: 404 },
      );
    }

    if (mode === "selection" && available.length !== new Set(requestedIds).size) {
      return NextResponse.json(
        { error: "Niet alle geselecteerde foto's hebben een hoge-resolutiebestand." },
        { status: 409 },
      );
    }

    const keys = available.map((image) => String(image.r2_original_key));

    const payload: TicketPayload = {
      v: 2,
      g: gallery.id,
      // Ook voor 'all' sturen we exact de DB-gekoppelde keys door.
      // Zo komen nooit toevallige/verdwaalde objecten uit de R2-map in het ZIP-bestand.
      k: keys,
      n: `${safeFileName(gallery.title)}-${mode === "selection" ? "selectie" : "volledige-galerij"}.zip`,
      e: Math.floor(Date.now() / 1000) + 15 * 60,
    };

    const encoded = base64url(JSON.stringify(payload));
    const signature = createHmac("sha256", secret)
      .update(encoded)
      .digest("base64url");

    const url = `${workerUrl}/download?ticket=${encodeURIComponent(`${encoded}.${signature}`)}`;

    return NextResponse.json({
      url,
      count: keys.length,
    });
  } catch (error) {
    console.error("ZIP ticket error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De ZIP-download kon niet worden voorbereid.",
      },
      { status: 500 },
    );
  }
}
