import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveCurrentStudent } from "@/lib/students/resolveCurrentStudent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Niet ingelogd." },
        { status: 401 }
      );
    }

    const student = await resolveCurrentStudent(user);

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: "Geen leerling gevonden voor dit account.",
        },
        { status: 404 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("student_documents")
      .select(
        "id, title, description, category, mime_type, score, module_slug, created_at"
      )
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      documents: data ?? [],
    });
  } catch (error) {
    console.error("LOAD STUDENT DOCUMENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Documenten konden niet geladen worden.",
      },
      { status: 500 }
    );
  }
}
