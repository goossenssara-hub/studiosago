import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isWithin15KmOfPeer(address: string) {
  const normalized = address.toLowerCase();

  return (
    normalized.includes("peer") ||
    normalized.includes("3990") ||
    normalized.includes("wijchmaal") ||
    normalized.includes("grote-brogel") ||
    normalized.includes("kleine-brogel") ||
    normalized.includes("hechtel") ||
    normalized.includes("eksel") ||
    normalized.includes("bocholt") ||
    normalized.includes("meeuwen") ||
    normalized.includes("bree")
  );
}

export async function POST(request: Request) {
  try {
    const {
      passId,
      email,
      appointmentType,
      customerAddress,
      notes,
      cancellationPolicyAccepted,
    } = await request.json();

    if (!passId || !email || !appointmentType || !notes) {
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

    if (appointmentType === "home") {
      if (!customerAddress) {
        return NextResponse.json(
          { error: "Vul je adres in voor fysieke begeleiding." },
          { status: 400 }
        );
      }

      if (!isWithin15KmOfPeer(customerAddress)) {
        return NextResponse.json(
          {
            error:
              "Fysieke begeleiding is enkel mogelijk binnen een straal van 15 km rond Peer.",
          },
          { status: 400 }
        );
      }
    }

    const { data: pass, error: passError } = await supabaseAdmin
      .from("passes")
      .select("*")
      .eq("id", passId)
      .eq("customer_email", email)
      .eq("status", "active")
      .single();

    if (passError || !pass) {
      return NextResponse.json(
        { error: "Geen actieve beurtenkaart gevonden." },
        { status: 404 }
      );
    }

    const remaining = pass.remaining_credits ?? 0;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "Deze beurtenkaart heeft geen beurten meer." },
        { status: 400 }
      );
    }

    const newRemaining = remaining - 1;

    const { error: updateError } = await supabaseAdmin
      .from("passes")
      .update({
        remaining_credits: newRemaining,
        status: newRemaining === 0 ? "used" : "active",
      })
      .eq("id", passId);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json(
        { error: "De beurt kon niet afgeschreven worden." },
        { status: 500 }
      );
    }

    const { error: bookingError } = await supabaseAdmin.from("bookings").insert({
      title: "Afspraak Studio SaGo",
      pass_id: passId,
      customer_email: email,
      appointment_date: null,
      appointment_time: null,
      appointment_type: appointmentType,
      customer_address: appointmentType === "home" ? customerAddress : null,
      status: "confirmed",
      payment_status: "paid",
      amount: 0,
      location:
        appointmentType === "home"
          ? customerAddress
          : "Digitale afspraak via Google Calendar",
      cancellation_policy_accepted: true,
      notes: [
        "Afspraak geboekt via Google Calendar",
        `Beurtenkaart: ${pass.title}`,
        `Type afspraak: ${
          appointmentType === "home" ? "Fysiek aan huis" : "Digitaal"
        }`,
        appointmentType === "home" ? `Adres: ${customerAddress}` : "",
        `Inhoud bijles: ${notes}`,
        `Klant: ${email}`,
        `Resterende beurten: ${newRemaining}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (bookingError) {
      console.error(bookingError);
      return NextResponse.json(
        {
          error:
            "De beurt werd afgeschreven, maar de afspraak kon niet opgeslagen worden.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      remaining_credits: newRemaining,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Er ging iets mis bij het afschrijven van de beurt." },
      { status: 500 }
    );
  }
}