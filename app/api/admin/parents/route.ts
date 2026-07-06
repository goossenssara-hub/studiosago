import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("students")
    .select("id, name, parent_email")
    .eq("active", true)
    .order("parent_email", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
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
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Geen ouder e-mailadres ontvangen." },
      { status: 400 }
    );
  }

  await supabaseAdmin
    .from("students")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("parent_email", email);

  const { error } = await supabaseAdmin
    .from("customer_profiles")
    .delete()
    .eq("email", email);

  if (error) {
    return NextResponse.json(
      { error: "Oudergegevens konden niet verwijderd worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}