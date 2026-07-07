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

    const mayRestoreLesson = hoursBefore >= 72;

    let lessonRestored = false;

    if (
      mayRestoreLesson &&
      booking.pass_id &&
      booking.deducted === true &&
      booking.restored_lesson !== true
    ) {
      const { data: pass, error: passError } = await supabaseAdmin
        .from("passes")
        .select("*")
        .eq("id", booking.pass_id)
        .single();

      if (passError || !pass) {
        return NextResponse.json(
          { error: "Beurtenkaart niet gevonden." },
          { status: 404 }
        );
      }

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
        return NextResponse.json(
          { error: "Beurt kon niet teruggezet worden." },
          { status: 500 }
        );
      }

      lessonRestored = true;
    }

    if (booking.appointment_date && booking.appointment_time) {
      const cleanTime = String(booking.appointment_time).slice(0, 5);

      const { data: availability } = await supabaseAdmin
        .from("availability")
        .select("id, booked_places")
        .eq("date", booking.appointment_date)
        .eq("start_time", cleanTime)
        .maybeSingle();

      if (availability) {
        const newBookedPlaces = Math.max(
          0,
          (availability.booked_places ?? 0) - 1
        );

        await supabaseAdmin
          .from("availability")
          .update({
            booked_places: newBookedPlaces,
            active: true,
          })
          .eq("id", availability.id);
      }
    }

    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),

        restored_lesson: lessonRestored,
        credit_refunded: lessonRestored,

        internal_notes: [
          booking.internal_notes || "",
          lessonRestored
            ? "Annulatie minstens 72u op voorhand: beurt terug toegevoegd."
            : "Annulatie minder dan 72u op voorhand: beurt blijft aangerekend.",
        ]
          .filter(Boolean)
          .join("\n"),
      })
      .eq("id", bookingId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      lessonRestored,
      message: lessonRestored
        ? "Afspraak geannuleerd. De beurt werd terug toegevoegd aan de beurtenkaart."
        : "Afspraak geannuleerd. De beurt blijft aangerekend omdat de annulatie minder dan 72 uur op voorhand gebeurde.",
    });
  } catch (error) {
    console.error("CANCEL BOOKING SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij annuleren." },
      { status: 500 }
    );
  }
}