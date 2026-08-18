import { createHash, createHmac } from "crypto";

const SERVICE = "s3";
const REGION = "auto";

function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Ontbrekende R2-instelling: ${name}`);
  return value;
}

function awsEncode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodePath(key: string) {
  return key.split("/").map((part) => awsEncode(part)).join("/");
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function signingKey(secret: string, date: string) {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

function isoBasic(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

export function r2Config() {
  const accountId = env("R2_ACCOUNT_ID");
  const accessKeyId = env("R2_ACCESS_KEY_ID");
  const secretAccessKey = env("R2_SECRET_ACCESS_KEY");
  const bucket = process.env.R2_BUCKET_NAME?.trim() || "sago-photography-downloads";
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export function r2IsConfigured() {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
}

type PresignOptions = {
  method: "GET" | "PUT" | "DELETE";
  key: string;
  expiresSeconds?: number;
  responseDownloadName?: string;
};

export function createR2PresignedUrl({ method, key, expiresSeconds = 900, responseDownloadName }: PresignOptions) {
  const { accountId, accessKeyId, secretAccessKey, bucket } = r2Config();
  const now = new Date();
  const amzDate = isoBasic(now);
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${awsEncode(bucket)}/${encodePath(key)}`;

  const query = new URLSearchParams();
  query.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  query.set("X-Amz-Credential", `${accessKeyId}/${scope}`);
  query.set("X-Amz-Date", amzDate);
  query.set("X-Amz-Expires", String(Math.min(Math.max(expiresSeconds, 60), 604800)));
  query.set("X-Amz-SignedHeaders", "host");
  if (responseDownloadName && method === "GET") {
    const safe = responseDownloadName.replace(/[\r\n\"]/g, "-");
    query.set("response-content-disposition", `attachment; filename=\"${safe}\"`);
    query.set("response-content-type", safe.toLowerCase().endsWith(".zip") ? "application/zip" : "image/jpeg");
  }

  const canonicalQuery = [...query.entries()]
    .map(([k, v]) => [awsEncode(k), awsEncode(v)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const canonicalHeaders = `host:${host}\n`;
  const canonicalRequest = [method, canonicalUri, canonicalQuery, canonicalHeaders, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, hash(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(secretAccessKey, dateStamp)).update(stringToSign).digest("hex");

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}


type R2ListedObject = {
  key: string;
  size: number;
  lastModified: string | null;
};

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function xmlValue(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1]) : "";
}

function createR2ListPresignedUrl(prefix: string, continuationToken?: string) {
  const { accountId, accessKeyId, secretAccessKey, bucket } = r2Config();
  const now = new Date();
  const amzDate = isoBasic(now);
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${awsEncode(bucket)}`;

  const query = new URLSearchParams();
  query.set("list-type", "2");
  query.set("prefix", prefix);
  query.set("max-keys", "1000");
  if (continuationToken) query.set("continuation-token", continuationToken);
  query.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  query.set("X-Amz-Credential", `${accessKeyId}/${scope}`);
  query.set("X-Amz-Date", amzDate);
  query.set("X-Amz-Expires", "300");
  query.set("X-Amz-SignedHeaders", "host");

  const canonicalQuery = [...query.entries()]
    .map(([k, v]) => [awsEncode(k), awsEncode(v)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const canonicalHeaders = `host:${host}\n`;
  const canonicalRequest = ["GET", canonicalUri, canonicalQuery, canonicalHeaders, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, hash(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(secretAccessKey, dateStamp)).update(stringToSign).digest("hex");

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

export async function listR2Objects(prefix: string): Promise<R2ListedObject[]> {
  const objects: R2ListedObject[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await fetch(createR2ListPresignedUrl(prefix, continuationToken), {
      cache: "no-store",
    });
    const xml = await response.text();
    if (!response.ok) {
      throw new Error(`R2 kon niet worden uitgelezen (HTTP ${response.status}). ${xml.slice(0, 180)}`);
    }

    const blocks = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map((match) => match[1]);
    for (const block of blocks) {
      const key = xmlValue(block, "Key");
      if (!key || key.endsWith("/")) continue;
      objects.push({
        key,
        size: Number(xmlValue(block, "Size") || 0),
        lastModified: xmlValue(block, "LastModified") || null,
      });
    }

    const truncated = xmlValue(xml, "IsTruncated") === "true";
    const next = xmlValue(xml, "NextContinuationToken");
    continuationToken = truncated && next ? next : undefined;
  } while (continuationToken);

  return objects;
}
