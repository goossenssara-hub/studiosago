import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("students")
      .select("id, name, parent_email")
      .eq("active", true)
      .order("parent_email", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("PARENTS GET ERROR:", error);

      return NextResponse.json(
        { error: "Ouders konden niet geladen worden." },
        { status: 500 }
      );
    }

    const grouped = (data ?? []).reduce<Record<string, any>>((acc, student) => {
      const email = student.parent_email || "Onbekende ouder";

      if (!acc[email]) {
        acc[email] = {
          email,
          students: [],
        };
      }

      acc[email].students.push(student);

      return acc;
    }, {});

    return NextResponse.json({
      parents: Object.values(grouped),
    });
  } catch (error) {
    console.error("PARENTS GET SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij laden van ouders." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Geen ouder e-mailadres ontvangen." },
        { status: 400 }
      );
    }

    const { error: studentsError } = await supabaseAdmin
      .from("students")
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("parent_email", email);

    if (studentsError) {
      console.error("PARENTS DELETE STUDENTS ERROR:", studentsError);

      return NextResponse.json(
        { error: "Leerlingen konden niet gedeactiveerd worden." },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin
      .from("customer_profiles")
      .delete()
      .eq("email", email);

    if (error) {
      console.error("PARENTS DELETE PROFILE ERROR:", error);

      return NextResponse.json(
        { error: "Oudergegevens konden niet verwijderd worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PARENTS DELETE SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij verwijderen van ouder." },
      { status: 500 }
    );
  }
}