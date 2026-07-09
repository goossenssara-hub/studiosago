import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeDateTime(date: string, time: string) {
  return `${date}T${String(time).slice(0, 5)}:00`;
}

function addMinutes(dateTime: string, minutes: number) {
  const date = new Date(dateTime);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const {
      passId,
      email,
      customerName,
      date,
      time,
      appointmentType,
      customerAddress,
      notes,
      cancellationPolicyAccepted,
    } = await request.json();

    if (!passId || !email || !date || !time || !appointmentType || !notes) {
      return NextResponse.json(
        { error: "Niet alle verplichte velden zijn ingevuld." },
        { status: 400 }
      );
    }

    if (!cancellationPolicyAccepted) {
      return NextResponse.json(
        { error: "Je moet akkoord gaan met de annuleringsvoorwaarden." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const { data: pass, error: passError } = await supabaseAdmin
      .from("passes")
      .select("*")
      .eq("id", passId)
      .eq("customer_email", cleanEmail)
      .eq("status", "active")
      .maybeSingle();

    if (passError || !pass) {
      return NextResponse.json(
        { error: "Geen geldige beurtenkaart gevonden." },
        { status: 404 }
      );
    }

    const remaining =
      pass.remaining_sessions ?? pass.remaining_credits ?? 0;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "Er zijn geen beurten meer beschikbaar." },
        { status: 400 }
      );
    }

    const appointmentStart = makeDateTime(date, time);
    const appointmentEnd = addMinutes(appointmentStart, 60);

    const title =
      appointmentType === "home"
        ? "Studiebegeleiding aan huis"
        : "Digitale studiebegeleiding";

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        pass_id: pass.id,
        title,
        customer_email: cleanEmail,
        customer_name: customerName || null,
        appointment_date: date,
        appointment_time: String(time).slice(0, 5),
        start_time: appointmentStart,
        end_time: appointmentEnd,
        location: appointmentType === "home" ? customerAddress : "Digitaal",
        notes,
        service_type: "begeleiding",
        appointment_type: appointmentType,
        status: "confirmed",
        payment_status: "paid_with_pass",
        deducted: true,
        restored_lesson: false,
        credit_refunded: false,
        confirmed_at: new Date().toISOString(),
        cancellation_policy_accepted: true,
      })
      .select("*")
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: bookingError?.message || "Afspraak kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    const newRemaining = remaining - 1;

    await supabaseAdmin
      .from("passes")
      .update({
        remaining_sessions:
          pass.remaining_sessions !== null && pass.remaining_sessions !== undefined
            ? newRemaining
            : pass.remaining_sessions,
        remaining_credits:
          pass.remaining_credits !== null && pass.remaining_credits !== undefined
            ? newRemaining
            : pass.remaining_credits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pass.id);

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("PASS GOOGLE BOOKING ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij afspraak maken." },
      { status: 500 }
    );
  }
}