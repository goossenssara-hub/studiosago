import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatIcsDate(value: Date): string {
  return value
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const bookingId = clean(url.searchParams.get("bookingId"));

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "bookingId ontbreekt." },
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

    const { data: booking, error } = await admin
      .from("bookings")
      .select(`
        id,
        title,
        customer_email,
        start_time,
        end_time,
        appointment_date,
        appointment_time,
        appointment_type,
        customer_address,
        location,
        notes,
        google_meet_url
      `)
      .eq("id", bookingId)
      .ilike("customer_email", customerEmail)
      .maybeSingle();

    if (error || !booking) {
      return NextResponse.json(
        { success: false, error: "De afspraak werd niet gevonden." },
        { status: 404 },
      );
    }

    const startRaw =
      clean(booking.start_time) ||
      (
        booking.appointment_date && booking.appointment_time
          ? `${booking.appointment_date}T${booking.appointment_time}`
          : ""
      );

    if (!startRaw) {
      return NextResponse.json(
        { success: false, error: "Geen geldig afspraakmoment gevonden." },
        { status: 400 },
      );
    }

    const start = new Date(startRaw);
    const end = booking.end_time
      ? new Date(booking.end_time)
      : new Date(start.getTime() + 60 * 60 * 1000);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        { success: false, error: "Geen geldig afspraakmoment gevonden." },
        { status: 400 },
      );
    }

    const title =
      clean(booking.title) || "Studiebegeleiding Studio SaGo";

    const location =
      clean(booking.google_meet_url) ||
      clean(booking.customer_address) ||
      clean(booking.location);

    const description =
      clean(booking.notes) ||
      clean(booking.appointment_type);

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Studio SaGo//Afspraken//NL",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${booking.id}@studiosago.be`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `LOCATION:${escapeIcs(location)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition":
          `attachment; filename="studio-sago-afspraak.ics"`,
      },
    });
  } catch (error) {
    console.error("CALENDAR DOWNLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "De agenda-afspraak kon niet worden aangemaakt.",
      },
      { status: 500 },
    );
  }
}
