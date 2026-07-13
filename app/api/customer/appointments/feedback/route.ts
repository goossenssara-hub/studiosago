import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json(
        { success: false, error: "Je bent niet aangemeld." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const bookingId = clean(body?.bookingId);
    const rating = Number(body?.rating);
    const comment = clean(body?.comment).slice(0, 1000) || null;

    if (!bookingId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "De beoordeling is ongeldig." },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdmin();
    const customerEmail = clean(user.email).toLowerCase();

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, customer_email, end_time, appointment_date, appointment_time")
      .eq("id", bookingId)
      .ilike("customer_email", customerEmail)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: "De afspraak werd niet gevonden." },
        { status: 404 },
      );
    }

    const { error } = await admin
      .from("appointment_feedback")
      .upsert(
        {
          booking_id: bookingId,
          customer_user_id: user.id,
          rating,
          comment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "booking_id" },
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("APPOINTMENT FEEDBACK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Je feedback kon niet worden opgeslagen.",
      },
      { status: 500 },
    );
  }
}
