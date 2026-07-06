import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hoursUntilAppointment(startTime: string) {
  const appointmentDate = new Date(startTime);
  const now = new Date();

  return (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId ontbreekt." },
        { status: 400 }
      );
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("CANCEL BOOKING FIND ERROR:", bookingError);

      return NextResponse.json(
        { error: "Geen afspraak gevonden." },
        { status: 404 }
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Deze afspraak is al geannuleerd." },
        { status: 400 }
      );
    }

    const appointmentStart =
      booking.start_time ||
      (booking.appointment_date && booking.appointment_time
        ? `${booking.appointment_date}T${String(booking.appointment_time).slice(
            0,
            5
          )}:00`
        : null);

    if (!appointmentStart) {
      return NextResponse.json(
        { error: "Geen geldig afspraakmoment gevonden." },
        { status: 400 }
      );
    }

    const hoursBefore = hoursUntilAppointment(appointmentStart);
    const mayRefundCredit = hoursBefore >= 72;

    let creditRefunded = false;

    if (mayRefundCredit && booking.pass_id && !booking.credit_refunded) {
      const { data: pass, error: passError } = await supabaseAdmin
        .from("passes")
        .select("*")
        .eq("id", booking.pass_id)
        .single();

      if (passError) {
        console.error("CANCEL BOOKING PASS FIND ERROR:", passError);
      }

      if (pass) {
        const currentRemaining =
          pass.remaining_credits ?? pass.remaining_sessions ?? 0;

        const total = pass.total_credits ?? pass.total_sessions ?? 10;
        const newRemaining = Math.min(currentRemaining + 1, total);

        const { error: passUpdateError } = await supabaseAdmin
          .from("passes")
          .update({
            remaining_credits: newRemaining,
            remaining_sessions: newRemaining,
            status: "active",
          })
          .eq("id", pass.id);

        if (passUpdateError) {
          console.error("CANCEL BOOKING PASS UPDATE ERROR:", passUpdateError);

          return NextResponse.json(
            { error: "Beurt kon niet teruggezet worden." },
            { status: 500 }
          );
        }

        creditRefunded = true;
      }
    }

    if (booking.appointment_date && booking.appointment_time) {
      const cleanTime = String(booking.appointment_time).slice(0, 5);

      const { data: availability, error: availabilityError } =
        await supabaseAdmin
          .from("availability")
          .select("id, booked_places, max_places")
          .eq("date", booking.appointment_date)
          .eq("start_time", cleanTime)
          .maybeSingle();

      if (availabilityError) {
        console.error(
          "CANCEL BOOKING AVAILABILITY FIND ERROR:",
          availabilityError
        );
      }

      if (availability) {
        const newBookedPlaces = Math.max(
          0,
          (availability.booked_places ?? 0) - 1
        );

        const { error: availabilityUpdateError } = await supabaseAdmin
          .from("availability")
          .update({
            booked_places: newBookedPlaces,
            active: true,
          })
          .eq("id", availability.id);

        if (availabilityUpdateError) {
          console.error(
            "CANCEL BOOKING AVAILABILITY UPDATE ERROR:",
            availabilityUpdateError
          );

          return NextResponse.json(
            { error: "Beschikbaarheid kon niet terug vrijgezet worden." },
            { status: 500 }
          );
        }
      }
    }

    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        credit_refunded: creditRefunded,
        internal_notes: [
          booking.internal_notes || "",
          mayRefundCredit
            ? "Annulatie minstens 72u op voorhand: beurt teruggegeven."
            : "Annulatie minder dan 72u op voorhand: beurt niet teruggegeven.",
        ]
          .filter(Boolean)
          .join("\n"),
      })
      .eq("id", bookingId)
      .select("*")
      .single();

    if (updateError) {
      console.error("CANCEL BOOKING UPDATE ERROR:", updateError);

      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      creditRefunded,
      message: creditRefunded
        ? "Afspraak geannuleerd. De beurt werd terug toegevoegd aan de beurtenkaart."
        : "Afspraak geannuleerd. De beurt werd niet terug toegevoegd omdat de annulatie minder dan 72 uur op voorhand gebeurde.",
    });
  } catch (error) {
    console.error("CANCEL BOOKING SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij annuleren." },
      { status: 500 }
    );
  }
}