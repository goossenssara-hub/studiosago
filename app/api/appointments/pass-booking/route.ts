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
      date,
      time,
      notes,
      appointmentType,
      customerAddress,
      cancellationPolicyAccepted,
    } = await request.json();

    const cleanNotes = String(notes || "").trim();

    if (!passId || !email || !date || !time || !cleanNotes) {
      return NextResponse.json(
        { error: "Niet alle verplichte velden zijn ingevuld." },
        { status: 400 }
      );
    }

    if (!appointmentType) {
      return NextResponse.json(
        { error: "Kies of je een digitale of fysieke afspraak wilt." },
        { status: 400 }
      );
    }

    if (!cancellationPolicyAccepted) {
      return NextResponse.json(
        { error: "Je moet akkoord gaan met de annulatievoorwaarden." },
        { status: 400 }
      );
    }

    if (appointmentType === "home") {
      if (!customerAddress) {
        return NextResponse.json(
          { error: "Vul je adres in voor een afspraak aan huis." },
          { status: 400 }
        );
      }

      if (!isWithin15KmOfPeer(customerAddress)) {
        return NextResponse.json(
          {
            error:
              "Een afspraak aan huis kan enkel binnen een straal van 15 km rond Peer.",
          },
          { status: 400 }
        );
      }
    }

    const { data: availability, error: availabilityError } =
      await supabaseAdmin
        .from("availability")
        .select(
          "id, date, start_time, end_time, max_places, booked_places, active"
        )
        .eq("date", date)
        .eq("start_time", time)
        .eq("active", true)
        .single();

    if (availabilityError || !availability) {
      return NextResponse.json(
        { error: "Dit tijdstip is niet beschikbaar." },
        { status: 400 }
      );
    }

    const maxPlaces = availability.max_places ?? 1;
    const bookedPlaces = availability.booked_places ?? 0;

    if (bookedPlaces >= maxPlaces) {
      return NextResponse.json(
        { error: "Dit tijdstip is ondertussen volzet." },
        { status: 400 }
      );
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
        { error: "Geen geldige actieve beurtenkaart gevonden." },
        { status: 400 }
      );
    }

    const remaining = pass.remaining_credits ?? pass.remaining_sessions ?? 0;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "Deze beurtenkaart heeft geen beschikbare beurten meer." },
        { status: 400 }
      );
    }

    const appointmentTitle =
      pass.title ?? pass.product ?? "Afspraak Studio SaGo";

    const newRemaining = remaining - 1;
    const newBookedPlaces = bookedPlaces + 1;

    const location =
      appointmentType === "home" ? customerAddress : "Digitale afspraak";

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        title: "Afspraak Studio SaGo",
        pass_id: pass.id,
        customer_email: email,
        appointment_date: date,
        appointment_time: time,
        appointment_type: appointmentType,
        customer_address: appointmentType === "home" ? customerAddress : null,
        location,
        cancellation_policy_accepted: cancellationPolicyAccepted,
        status: "confirmed",
        payment_status: "paid",
        amount: 0,
        notes: [
          "Afspraak ingepland via beurtenkaart",
          `Beurtenkaart: ${appointmentTitle}`,
          `Type afspraak: ${
            appointmentType === "home" ? "Fysiek aan huis" : "Digitaal"
          }`,
          appointmentType === "home" && customerAddress
            ? `Adres: ${customerAddress}`
            : "",
          `Datum: ${date}`,
          `Tijdstip: ${time}`,
          `Inhoud bijles: ${cleanNotes}`,
          `Resterende beurten na boeking: ${newRemaining}`,
        ]
          .filter(Boolean)
          .join("\n"),
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      console.error(bookingError);
      return NextResponse.json(
        { error: "Afspraak kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    const { error: availabilityUpdateError } = await supabaseAdmin
      .from("availability")
      .update({
        booked_places: newBookedPlaces,
        active: newBookedPlaces < maxPlaces,
      })
      .eq("id", availability.id);

    if (availabilityUpdateError) {
      console.error(availabilityUpdateError);
      return NextResponse.json(
        {
          error:
            "Afspraak opgeslagen, maar beschikbaarheid kon niet aangepast worden.",
        },
        { status: 500 }
      );
    }

    const { error: passUpdateError } = await supabaseAdmin
      .from("passes")
      .update({
        remaining_credits: newRemaining,
        remaining_sessions: newRemaining,
        status: newRemaining === 0 ? "used" : "active",
      })
      .eq("id", pass.id);

    if (passUpdateError) {
      console.error(passUpdateError);
      return NextResponse.json(
        { error: "Beurtenkaart kon niet aangepast worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      remaining_credits: newRemaining,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Er ging iets mis bij het inplannen van de afspraak." },
      { status: 500 }
    );
  }
}