import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  ALLOWED_TEXT_FILE_EXTENSIONS,
  MAX_TEXT_FILE_SIZE_BYTES,
  calculateTextCorrectionPrice,
  countWords,
  createTextCorrectionToken,
} from "@/lib/textCorrection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFileName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function extensionOf(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

async function extractText(file: File, buffer: Buffer): Promise<string> {
  const extension = extensionOf(file.name);

  if (extension === "txt") {
    return buffer.toString("utf8");
  }

  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (extension === "pdf") {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default;
    const result = await pdfParse(buffer);
    return result.text;
  }

  throw new Error("Dit bestandstype wordt niet ondersteund.");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileValue = formData.get("file");

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        { error: "Selecteer eerst een bestand." },
        { status: 400 }
      );
    }

    const extension = extensionOf(fileValue.name);
    if (
      !ALLOWED_TEXT_FILE_EXTENSIONS.includes(
        extension as (typeof ALLOWED_TEXT_FILE_EXTENSIONS)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Gebruik een .docx-, .pdf- of .txt-bestand. Oude .doc-bestanden worden niet ondersteund.",
        },
        { status: 400 }
      );
    }

    if (fileValue.size <= 0) {
      return NextResponse.json(
        { error: "Het gekozen bestand is leeg." },
        { status: 400 }
      );
    }

    if (fileValue.size > MAX_TEXT_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Het bestand mag maximaal 15 MB groot zijn." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await fileValue.arrayBuffer());
    const text = await extractText(fileValue, buffer);
    const wordCount = countWords(text);

    if (wordCount <= 0) {
      return NextResponse.json(
        {
          error:
            "Er konden geen woorden in het bestand worden gevonden. Bij een gescande PDF is tekstherkenning nodig.",
        },
        { status: 400 }
      );
    }

    const price = calculateTextCorrectionPrice(wordCount);
    const storagePath = `${new Date().getFullYear()}/${randomUUID()}-${safeFileName(
      fileValue.name
    )}`;

    const supabaseAdmin = getSupabaseAdmin();
    const { error: uploadError } = await supabaseAdmin.storage
      .from("webshop-text-uploads")
      .upload(storagePath, buffer, {
        contentType: fileValue.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("TEXT FILE UPLOAD ERROR:", uploadError);
      throw new Error(
        "Het bestand kon niet veilig worden opgeslagen. Controleer of de storagebucket bestaat."
      );
    }

    const analysis = {
      storagePath,
      originalFileName: fileValue.name,
      mimeType: fileValue.type || "application/octet-stream",
      wordCount,
      price,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      fileName: analysis.originalFileName,
      wordCount,
      price,
      analysisToken: createTextCorrectionToken(analysis),
    });
  } catch (error) {
    console.error("TEXT FILE ANALYSIS ERROR:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Het bestand kon niet worden geanalyseerd.",
      },
      { status: 500 }
    );
  }
}
