import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toBrusselsDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+02:00`).toISOString();
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const {
      passId,
      email,
      date,
      time,
      appointmentType,
      customerAddress,
      notes,
      cancellationPolicyAccepted,
    } = await request.json();

    if (!passId || !email || !date || !time || !appointmentType || !notes) {
      return NextResponse.json(
        { error: "Niet alle verplichte gegevens zijn ingevuld." },
        { status: 400 }
      );
    }

    if (!cancellationPolicyAccepted) {
      return NextResponse.json(
        { error: "Je moet akkoord gaan met de annuleringsvoorwaarden." },
        { status: 400 }
      );
    }

    const { data: pass, error: passError } = await supabaseAdmin
      .from("passes")
      .select("*")
      .eq("id", passId)
      .eq("customer_email", email)
      .eq("status", "active")
      .maybeSingle();

    if (passError || !pass) {
      return NextResponse.json(
        { error: "Geen geldige beurtenkaart gevonden." },
        { status: 404 }
      );
    }

    const remaining = pass.remaining_sessions ?? pass.remaining_credits ?? 0;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "Er zijn geen beurten meer beschikbaar." },
        { status: 400 }
      );
    }

    const startTime = toBrusselsDateTime(date, time);
    const endDate = new Date(startTime);
    endDate.setMinutes(endDate.getMinutes() + 60);

    const appointmentTypeLabel =
      appointmentType === "home" ? "Fysiek aan huis" : "Digitaal";

    const { error: bookingError } = await supabaseAdmin.from("bookings").insert({
      pass_id: passId,
      customer_email: email,
      customer_name: null,

      title: "Afspraak Studio SaGo",
      service_type: "begeleiding",

      appointment_date: date,
      appointment_time: time,
      start_time: startTime,
      end_time: endDate.toISOString(),

      appointment_type: appointmentTypeLabel,
      customer_address: customerAddress || null,

      notes: `Type afspraak: ${appointmentTypeLabel}
Adres: ${customerAddress || "-"}
Inhoud bijles: ${notes}
Annuleringsvoorwaarden geaccepteerd: ja`,

      status: "confirmed",
      payment_status: "paid",
      amount: 0,
      cancellation_policy_accepted: true,
      deducted: false,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (bookingError) {
      console.error("PASS BOOKING ERROR:", bookingError);

      return NextResponse.json(
        { error: bookingError.message || "Afspraak kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PASS BOOKING SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij afspraak boeken." },
      { status: 500 }
    );
  }
}