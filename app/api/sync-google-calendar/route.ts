import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const syncSecret = process.env.GOOGLE_CALENDAR_SYNC_SECRET;

function detectServiceType(title?: string | null, notes?: string | null) {
  const text = `${title || ""} ${notes || ""}`.toLowerCase();

  if (text.includes("kennismaking")) return "kennismaking";

  if (
    text.includes("huiswerk") ||
    text.includes("studiecoaching") ||
    text.includes("coaching") ||
    text.includes("bijles") ||
    text.includes("begeleiding")
  ) {
    return "begeleiding";
  }

  return "andere";
}

export async function POST(request: Request) {
  try {
    if (!syncSecret) {
      return NextResponse.json(
        { error: "GOOGLE_CALENDAR_SYNC_SECRET ontbreekt." },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${syncSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();

    const {
      google_event_id,
      title,
      start_time,
      end_time,
      customer_email,
      customer_name,
      location,
      notes,
      status,
    } = body;

    if (!google_event_id || !start_time) {
      return NextResponse.json(
        { error: "google_event_id en start_time zijn verplicht." },
        { status: 400 }
      );
    }

    const startDate = new Date(start_time);

    const appointmentDate = startDate.toLocaleDateString("sv-SE", {
      timeZone: "Europe/Brussels",
    });

    const appointmentTime = startDate.toLocaleTimeString("nl-BE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Brussels",
    });

    const serviceType = detectServiceType(title, notes);

    const { error } = await supabaseAdmin.from("bookings").upsert(
      {
        google_event_id,
        title: title || "Afspraak Studio SaGo",
        start_time,
        end_time,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        customer_email: customer_email || null,
        customer_name: customer_name || null,
        location: location || null,
        notes: notes || null,
        service_type: serviceType,
        status: status ?? "confirmed",
        payment_status: "unpaid",
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "google_event_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      service_type: serviceType,
    });
  } catch (error) {
    console.error("GOOGLE CALENDAR SYNC SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Synchronisatie mislukt." },
      { status: 500 }
    );
  }
}