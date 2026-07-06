import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("passes")
    .select("*")
    .order("customer_email", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Beurtenkaarten konden niet geladen worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    passes: data ?? [],
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const id = String(body.id || "");
    const title = String(body.title || "");
    const totalCredits = Number(body.totalCredits || 0);
    const remainingCredits = Number(body.remainingCredits || 0);
    const status = String(body.status || "active");

    if (!id || !title || totalCredits < 1 || remainingCredits < 0) {
      return NextResponse.json(
        { error: "Niet alle velden zijn correct ingevuld." },
        { status: 400 }
      );
    }

    if (remainingCredits > totalCredits) {
      return NextResponse.json(
        { error: "Resterende beurten mogen niet hoger zijn dan totaal." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("passes")
      .update({
        title,
        total_credits: totalCredits,
        remaining_credits: remainingCredits,
        total_sessions: totalCredits,
        remaining_sessions: remainingCredits,
        status,
      })
      .eq("id", id);

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Beurtenkaart kon niet aangepast worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Er ging iets mis bij het aanpassen." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Geen id ontvangen." },
      { status: 400 }
    );
  }

  // verwijder eerst alle gekoppelde afspraken
  const { error: bookingError } = await supabaseAdmin
    .from("bookings")
    .delete()
    .eq("pass_id", id);

  if (bookingError) {
    console.error(bookingError);

    return NextResponse.json(
      { error: bookingError.message },
      { status: 500 }
    );
  }

  // verwijder daarna de beurtenkaart
  const { error } = await supabaseAdmin
    .from("passes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}