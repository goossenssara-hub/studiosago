import { createHmac, timingSafeEqual } from "crypto";

export const MAX_TEXT_FILE_SIZE_BYTES = 15 * 1024 * 1024;
export const ALLOWED_TEXT_FILE_EXTENSIONS = ["txt", "docx", "pdf"] as const;

export type TextCorrectionAnalysis = {
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  wordCount: number;
  price: number;
  createdAt: string;
};

export function calculateTextCorrectionPrice(wordCount: number): number {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 20;
  if (wordCount <= 2000) return 20;
  return 20 + Math.ceil((wordCount - 2000) / 1000) * 8;
}

export function countWords(text: string): number {
  return text
    .replace(/\u00ad/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

function analysisSecret(): string {
  const secret =
    process.env.TEXT_CORRECTION_TOKEN_SECRET?.trim() ||
    process.env.MOLLIE_API_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!secret) {
    throw new Error(
      "TEXT_CORRECTION_TOKEN_SECRET, MOLLIE_API_KEY of SUPABASE_SERVICE_ROLE_KEY ontbreekt."
    );
  }

  return secret;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createTextCorrectionToken(
  analysis: TextCorrectionAnalysis
): string {
  const payload = base64UrlEncode(JSON.stringify(analysis));
  const signature = createHmac("sha256", analysisSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyTextCorrectionToken(
  token: string
): TextCorrectionAnalysis {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    throw new Error("De bestandsanalyse is ongeldig. Upload het bestand opnieuw.");
  }

  const expected = createHmac("sha256", analysisSecret())
    .update(payload)
    .digest("base64url");

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error("De bestandsanalyse kon niet worden geverifieerd.");
  }

  const analysis = JSON.parse(
    base64UrlDecode(payload)
  ) as TextCorrectionAnalysis;

  if (
    !analysis.storagePath ||
    !analysis.originalFileName ||
    !Number.isFinite(analysis.wordCount) ||
    analysis.wordCount <= 0 ||
    calculateTextCorrectionPrice(analysis.wordCount) !== analysis.price
  ) {
    throw new Error("De bestandsanalyse bevat ongeldige gegevens.");
  }

  const ageMs = Date.now() - new Date(analysis.createdAt).getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > 24 * 60 * 60 * 1000) {
    throw new Error("De bestandsanalyse is verlopen. Upload het bestand opnieuw.");
  }

  return analysis;
}
