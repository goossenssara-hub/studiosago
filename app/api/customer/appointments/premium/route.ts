import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return String(value ?? "").trim();
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

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select(`
        id,
        customer_email,
        customer_name,
        pass_id,
        start_time,
        appointment_date,
        appointment_time,
        appointment_type,
        instructor_name,
        instructor_photo_url,
        payment_id,
        invoice_url,
        payment_status
      `)
      .eq("id", bookingId)
      .ilike("customer_email", customerEmail)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: "De afspraak werd niet gevonden." },
        { status: 404 },
      );
    }

    let pass: Record<string, unknown> | null = null;

    if (booking.pass_id) {
      const { data } = await admin
        .from("passes")
        .select(`
          id,
          total_credits,
          total_sessions,
          remaining_credits,
          remaining_sessions
        `)
        .eq("id", booking.pass_id)
        .maybeSingle();

      pass = data;
    }

    const totalCredits = Number(
      pass?.total_credits ??
        pass?.total_sessions ??
        0,
    );

    const remainingCredits = Number(
      pass?.remaining_credits ??
        pass?.remaining_sessions ??
        0,
    );

    const usedCredits =
      totalCredits > 0
        ? Math.max(0, totalCredits - remainingCredits)
        : null;

    const [{ data: homework }, { data: messages }, { data: nextAppointments }] =
      await Promise.all([
        admin
          .from("appointment_homework")
          .select("items")
          .eq("booking_id", bookingId)
          .maybeSingle(),
        admin
          .from("appointment_messages")
          .select("id, sender_role, message, created_at")
          .eq("booking_id", bookingId)
          .order("created_at", { ascending: true }),
        admin
          .from("bookings")
          .select(`
            id,
            start_time,
            appointment_date,
            appointment_time,
            appointment_type
          `)
          .ilike("customer_email", customerEmail)
          .neq("id", bookingId)
          .in("status", ["confirmed", "approved"])
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true })
          .limit(10),
      ]);

    const currentDate = new Date();

    const nextAppointment =
      (nextAppointments ?? []).find((item) => {
        const raw =
          clean(item.start_time) ||
          (
            item.appointment_date && item.appointment_time
              ? `${item.appointment_date}T${item.appointment_time}`
              : ""
          );

        if (!raw) return false;

        const parsed = new Date(raw);
        return (
          !Number.isNaN(parsed.getTime()) &&
          parsed.getTime() > currentDate.getTime()
        );
      }) ?? null;

    return NextResponse.json({
      success: true,
      premium: {
        bookingId,
        instructorName:
          clean(booking.instructor_name) || "Sara Goossens",
        instructorPhotoUrl:
          clean(booking.instructor_photo_url) || null,
        usedCredits,
        totalCredits: totalCredits || null,
        remainingCredits:
          totalCredits > 0 ? remainingCredits : null,
        homework: homework?.items ?? [],
        nextAppointment,
        paymentStatus:
          clean(booking.payment_status).toLowerCase() ||
          "unknown",
        invoiceUrl:
          clean(booking.invoice_url) || null,
        molliePaymentId:
          clean(booking.payment_id) || null,
        messages: messages ?? [],
      },
    });
  } catch (error) {
    console.error("PREMIUM APPOINTMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "De extra afspraakgegevens konden niet geladen worden.",
      },
      { status: 500 },
    );
  }
}
