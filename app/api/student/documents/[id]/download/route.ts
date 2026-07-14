import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveCurrentStudent } from "@/lib/students/resolveCurrentStudent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function safeFilename(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  return normalized || "document";
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Niet ingelogd." },
        { status: 401 }
      );
    }

    const student = await resolveCurrentStudent(user);

    if (!student) {
      return NextResponse.json(
        { error: "Geen leerling gevonden." },
        { status: 404 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: document, error } = await supabaseAdmin
      .from("student_documents")
      .select("id, student_id, title, file_path, mime_type")
      .eq("id", id)
      .eq("student_id", student.id)
      .maybeSingle();

    if (error || !document) {
      return NextResponse.json(
        { error: "Document niet gevonden." },
        { status: 404 }
      );
    }

    const { data: file, error: downloadError } =
      await supabaseAdmin.storage
        .from("student-documents")
        .download(document.file_path);

    if (downloadError || !file) {
      throw new Error(
        downloadError?.message ||
          "Het document kon niet gedownload worden."
      );
    }

    const bytes = await file.arrayBuffer();
    const extension =
      document.mime_type === "application/pdf"
        ? "pdf"
        : "bin";

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type":
          document.mime_type || "application/octet-stream",
        "Content-Disposition":
          `inline; filename="${safeFilename(document.title)}.${extension}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("DOWNLOAD STUDENT DOCUMENT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Downloaden is mislukt.",
      },
      { status: 500 }
    );
  }
}
