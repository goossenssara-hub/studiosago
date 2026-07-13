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
    const body = await request.json();
    const bookingId = clean(body?.bookingId);
    const message = clean(body?.message).slice(0, 2000);

    if (!bookingId || !message) {
      return NextResponse.json(
        { success: false, error: "Afspraak of bericht ontbreekt." },
        { status: 400 },
      );
    }

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

    const admin = getSupabaseAdmin();
    const customerEmail = clean(user.email).toLowerCase();

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, customer_email")
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
      .from("appointment_messages")
      .insert({
        booking_id: bookingId,
        sender_user_id: user.id,
        sender_role: "customer",
        message,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("APPOINTMENT MESSAGE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Je bericht kon niet worden verzonden.",
      },
      { status: 500 },
    );
  }
}
