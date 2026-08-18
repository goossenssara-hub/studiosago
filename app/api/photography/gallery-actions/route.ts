import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GalleryRecord = {
  id: string;
  title: string;
  downloads: string | null;
  favorites_enabled: boolean | null;
};

type ZipEntry = {
  name: string;
  data: Buffer;
};

async function getGallery(slug: string, token: string): Promise<GalleryRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("photo_galleries")
    .select("id,title,downloads,favorites_enabled")
    .eq("slug", slug)
    .eq("share_token", token)
    .eq("status", "active")
    .single();

  if (error || !data) return null;
  return data as GalleryRecord;
}

function sanitizeName(value: string, fallback: string) {
  const sanitized = value
    .normalize("NFKD")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "");

  return sanitized || fallback;
}

function makeUniqueFileNames(names: string[]) {
  const used = new Map<string, number>();
  return names.map((name, index) => {
    const safe = sanitizeName(name, `foto-${index + 1}.jpg`);
    const dot = safe.lastIndexOf(".");
    const base = dot > 0 ? safe.slice(0, dot) : safe;
    const extension = dot > 0 ? safe.slice(dot) : "";
    const count = used.get(safe.toLowerCase()) ?? 0;
    used.set(safe.toLowerCase(), count + 1);
    return count === 0 ? safe : `${base}-${count + 1}${extension}`;
  });
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2) & 0x1f) << 0);
  const dosDate =
    (((year - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { dosDate, dosTime };
}

function createStoredZip(entries: ZipEntry[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const { dosDate, dosTime } = dosDateTime();

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name.replace(/\\/g, "/"), "utf8");
    const checksum = crc32(entry.data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(entry.data.length, 18);
    localHeader.writeUInt32LE(entry.data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuffer, entry.data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(entry.data.length, 20);
    centralHeader.writeUInt32LE(entry.data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuffer);
    offset += localHeader.length + nameBuffer.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  const token = url.searchParams.get("token") || "";
  const visitorKey = url.searchParams.get("visitorKey") || "";
  if (!slug || !token || !visitorKey) return NextResponse.json({ favoriteIds: [] });

  const gallery = await getGallery(slug, token);
  if (!gallery || gallery.favorites_enabled === false) return NextResponse.json({ favoriteIds: [] });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("photo_gallery_favorites")
    .select("image_id")
    .eq("gallery_id", gallery.id)
    .eq("visitor_key", visitorKey);

  if (error) {
    console.error("Gallery favorites read error:", error);
    return NextResponse.json({ favoriteIds: [] });
  }
  return NextResponse.json({ favoriteIds: (data ?? []).map((item) => item.image_id) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = String(body.slug || "");
    const token = String(body.token || "");
    const gallery = await getGallery(slug, token);
    if (!gallery) return NextResponse.json({ error: "Galerij niet gevonden." }, { status: 404 });

    const supabase = getSupabaseAdmin();

    if (body.action === "favorite") {
      if (gallery.favorites_enabled === false) {
        return NextResponse.json({ error: "Selecties zijn uitgeschakeld." }, { status: 403 });
      }
      const visitorKey = String(body.visitorKey || "");
      const imageId = String(body.imageId || "");
      if (!visitorKey || !imageId) {
        return NextResponse.json({ error: "Ongeldige selectie." }, { status: 400 });
      }

      const { data: image } = await supabase
        .from("photo_gallery_images")
        .select("id")
        .eq("id", imageId)
        .eq("gallery_id", gallery.id)
        .single();
      if (!image) return NextResponse.json({ error: "Foto niet gevonden." }, { status: 404 });

      if (body.value) {
        const { error } = await supabase.from("photo_gallery_favorites").upsert(
          {
            gallery_id: gallery.id,
            image_id: imageId,
            visitor_key: visitorKey,
          },
          { onConflict: "gallery_id,image_id,visitor_key" },
        );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("photo_gallery_favorites")
          .delete()
          .eq("gallery_id", gallery.id)
          .eq("image_id", imageId)
          .eq("visitor_key", visitorKey);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }

    if (body.action === "downloadImage") {
      return NextResponse.json({ error: "Losse webfoto-downloads zijn uitgeschakeld. Gebruik de hoge-resolutie ZIP vanuit Cloudflare R2." }, { status: 410 });
      /* legacy web-download intentionally disabled
      const mode = String(gallery.downloads || "individual");
      if (mode === "none" || mode === "disabled") {
        return NextResponse.json({ error: "Downloads zijn uitgeschakeld." }, { status: 403 });
      }

      const imageId = String(body.imageId || "");
      if (!imageId) {
        return NextResponse.json({ error: "Geen foto geselecteerd." }, { status: 400 });
      }

      const { data: image, error } = await supabase
        .from("photo_gallery_images")
        .select("id,storage_path,file_name")
        .eq("id", imageId)
        .eq("gallery_id", gallery.id)
        .single();

      if (error || !image) {
        return NextResponse.json({ error: "Foto niet gevonden." }, { status: 404 });
      }

      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from("photo-galleries")
        .download(image.storage_path);
      if (downloadError || !fileBlob) throw downloadError || new Error("De foto kon niet worden opgehaald.");

      const fileName = sanitizeName(image.file_name || "SaGo-foto.jpg", "SaGo-foto.jpg");
      return new NextResponse(fileBlob.stream(), {
        status: 200,
        headers: {
          "Content-Type": fileBlob.type || "image/jpeg",
          "Content-Length": String(fileBlob.size),
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
          "Cache-Control": "private, max-age=0, no-store",
        },
      });
    }
      */
    }

    if (body.action === "downloadZip") {
      return NextResponse.json({ error: "Webfoto-ZIP is uitgeschakeld. Gebruik de hoge-resolutie ZIP vanuit Cloudflare R2." }, { status: 410 });
      /* legacy web-zip intentionally disabled
      const mode = String(gallery.downloads || "individual");
      if (mode === "none" || mode === "disabled") {
        return NextResponse.json({ error: "Downloads zijn uitgeschakeld." }, { status: 403 });
      }

      const requestedIds = Array.isArray(body.imageIds)
        ? body.imageIds.map((id: unknown) => String(id)).filter(Boolean)
        : [];
      if (!requestedIds.length) {
        return NextResponse.json({ error: "Selecteer minstens één foto." }, { status: 400 });
      }
      if (requestedIds.length > 500) {
        return NextResponse.json({ error: "Selecteer maximaal 500 foto’s per download." }, { status: 400 });
      }

      const { data: images, error } = await supabase
        .from("photo_gallery_images")
        .select("id,storage_path,file_name,sort_order")
        .eq("gallery_id", gallery.id)
        .in("id", requestedIds)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (!images?.length) {
        return NextResponse.json({ error: "De geselecteerde foto’s werden niet gevonden." }, { status: 404 });
      }

      const uniqueFileNames = makeUniqueFileNames(images.map((image) => image.file_name || "foto.jpg"));
      const folderName = sanitizeName(gallery.title, "SaGo Photography");
      const zipEntries: ZipEntry[] = [];

      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from("photo-galleries")
          .download(image.storage_path);
        if (downloadError || !fileBlob) {
          throw downloadError || new Error(`Foto ${index + 1} kon niet worden opgehaald.`);
        }
        const fileBuffer = Buffer.from(await fileBlob.arrayBuffer());
        zipEntries.push({
          name: `${folderName}/${uniqueFileNames[index]}`,
          data: fileBuffer,
        });
      }

      const zipBuffer = createStoredZip(zipEntries);
      const zipName = `${folderName}.zip`;
      return new NextResponse(new Uint8Array(zipBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(zipName)}`,
          "Content-Length": String(zipBuffer.length),
          "Cache-Control": "private, no-store",
        },
      });
    }
      */
    }

    return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
  } catch (error) {
    console.error("Gallery action error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Actie mislukt." },
      { status: 500 },
    );
  }
}
