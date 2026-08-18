import { ZipWriter } from "@zip.js/zip.js/lib/zip-core.js";

interface Env {
  PHOTOS: R2Bucket;
  ZIP_SIGNING_SECRET: string;
}

type TicketPayload = {
  v: 1;
  g: string;
  k: string[] | null;
  n: string;
  e: number;
};

const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToText(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

function safeZipName(value: string) {
  return value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/\s+/g, " ").trim().slice(0, 120) || "SaGo-Photography.zip";
}

function originalNameFromKey(key: string) {
  const file = key.split("/").pop() || "foto.jpg";

  // Ondersteun zowel oude site-uploads:
  // <uuid>-<8random>-<bestandsnaam>.jpg
  // als rechtstreeks in R2 geüploade bestanden:
  // IMG_1234.jpg
  const oldPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{8}-(.+)$/i;
  const match = file.match(oldPattern);
  return match?.[1] || file;
}

function uniqueName(name: string, used: Map<string, number>) {
  const current = used.get(name) ?? 0;
  used.set(name, current + 1);
  if (current === 0) return name;

  const dot = name.lastIndexOf(".");
  if (dot > 0) return `${name.slice(0, dot)}-${current + 1}${name.slice(dot)}`;
  return `${name}-${current + 1}`;
}

async function listObjects(bucket: R2Bucket, prefix: string) {
  const objects: R2Object[] = [];
  let cursor: string | undefined;

  do {
    const page = await bucket.list({ prefix, cursor, limit: 1000 });
    objects.push(...page.objects);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return objects;
}

async function verifyTicket(ticket: string, env: Env): Promise<TicketPayload> {
  const dot = ticket.lastIndexOf(".");
  if (dot <= 0) throw new Error("Ongeldig ticket.");

  const encoded = ticket.slice(0, dot);
  const suppliedSignature = ticket.slice(dot + 1);
  const expectedSignature = await hmac(encoded, env.ZIP_SIGNING_SECRET);

  if (!timingSafeEqual(suppliedSignature, expectedSignature)) {
    throw new Error("Ongeldige handtekening.");
  }

  const payload = JSON.parse(base64UrlToText(encoded)) as TicketPayload;
  if (payload.v !== 1 || !payload.g || !payload.e) throw new Error("Ongeldig ticket.");
  if (payload.e < Math.floor(Date.now() / 1000)) throw new Error("Dit downloadticket is verlopen.");
  if (payload.k && payload.k.length > 250) throw new Error("Te veel foto's in één selectie.");

  return payload;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/download") {
      return new Response("SaGo Photography ZIP service", { status: 200 });
    }

    try {
      const ticket = url.searchParams.get("ticket");
      if (!ticket || !env.ZIP_SIGNING_SECRET) {
        return new Response("Download niet toegestaan.", { status: 403 });
      }

      const payload = await verifyTicket(ticket, env);
      const prefix = `galleries/${payload.g}/originals/`;
      let files: R2Object[];

      if (payload.k) {
        const requestedKeys = [...new Set(payload.k)].filter((key) => key.startsWith(prefix));
        if (!requestedKeys.length) return new Response("Geen geldige foto's geselecteerd.", { status: 400 });

        const heads = await Promise.all(requestedKeys.map((key) => env.PHOTOS.head(key)));
        if (heads.some((item) => !item)) {
          return new Response("Niet alle geselecteerde foto's zijn beschikbaar.", { status: 409 });
        }
        files = heads.filter((item): item is R2Object => Boolean(item));
      } else {
        files = await listObjects(env.PHOTOS, prefix);
      }

      if (!files.length) return new Response("Geen hoge-resolutiefoto's gevonden.", { status: 404 });

      const { readable, writable } = new TransformStream();
      const zipWriter = new ZipWriter(writable, {
        zip64: true,
        level: 0
      });
      const usedNames = new Map<string, number>();

      const producer = (async () => {
        try {
          for (const file of files) {
            const object = await env.PHOTOS.get(file.key);
            if (!object?.body) throw new Error(`R2-object ontbreekt: ${file.key}`);

            const entryName = uniqueName(originalNameFromKey(file.key), usedNames);
            await zipWriter.add(entryName, object.body, {
              level: 0,
              zip64: true,
              lastModDate: file.uploaded
            });
          }
          await zipWriter.close();
        } catch (error) {
          console.error("ZIP stream error", error);
          try { await zipWriter.close(); } catch {}
        }
      })();

      ctx.waitUntil(producer);

      return new Response(readable, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${safeZipName(payload.n)}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff"
        }
      });
    } catch (error) {
      console.error("ZIP request error", error);
      return new Response(error instanceof Error ? error.message : "Download mislukt.", { status: 403 });
    }
  }
};
