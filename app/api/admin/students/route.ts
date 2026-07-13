import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();

  try {
    const { data: students, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ students: students ?? [] });
  } catch (error) {
    console.error("Load students error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Leerlingen konden niet geladen worden.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const studentId = request.nextUrl.searchParams.get("id");

    if (!studentId) {
      return NextResponse.json(
        { error: "Leerling-ID ontbreekt." },
        { status: 400 }
      );
    }

    const { data: student, error: findError } = await supabase
      .from("students")
      .select("id, auth_user_id")
      .eq("id", studentId)
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: findError.message },
        { status: 400 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: "De leerling werd niet gevonden." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }

    if (student.auth_user_id) {
      const { error: authError } =
        await supabase.auth.admin.deleteUser(
          student.auth_user_id
        );

      if (authError) {
        console.error(
          "Auth-account kon niet verwijderd worden:",
          authError
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete student error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De leerling kon niet verwijderd worden.",
      },
      { status: 500 }
    );
  }
}
