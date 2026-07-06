import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("STUDENTS GET ERROR:", error);

      return NextResponse.json(
        { error: "Leerlingen konden niet geladen worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ students: data ?? [] });
  } catch (error) {
    console.error("STUDENTS GET SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij laden van leerlingen." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Geen leerling-id ontvangen." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("students")
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("STUDENTS DELETE ERROR:", error);

      return NextResponse.json(
        { error: "Leerling kon niet verwijderd worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("STUDENTS DELETE SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij verwijderen van leerling." },
      { status: 500 }
    );
  }
}