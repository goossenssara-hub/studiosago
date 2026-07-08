import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { bookingId } = await request.json();

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Afspraak niet gevonden." },
        { status: 404 }
      );
    }

    if (booking.deducted) {
      return NextResponse.json({ success: true });
    }

    if (!booking.pass_id) {
      return NextResponse.json(
        { error: "Er is geen beurtenkaart gekoppeld aan deze afspraak." },
        { status: 400 }
      );
    }

    const { data: pass, error: passError } = await supabaseAdmin
      .from("passes")
      .select("*")
      .eq("id", booking.pass_id)
      .maybeSingle();

    if (passError || !pass) {
      return NextResponse.json(
        { error: "Beurtenkaart niet gevonden." },
        { status: 404 }
      );
    }

    const remaining = pass.remaining_sessions ?? pass.remaining_credits ?? 0;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "Geen beurten meer beschikbaar." },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("passes")
      .update({
        remaining_sessions:
          pass.remaining_sessions !== null ? remaining - 1 : pass.remaining_sessions,
        remaining_credits:
          pass.remaining_credits !== null ? remaining - 1 : pass.remaining_credits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.pass_id);

    await supabaseAdmin
      .from("bookings")
      .update({
        deducted: true,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Beurt kon niet afgeschreven worden." },
      { status: 500 }
    );
  }
}