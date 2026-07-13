import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

export async function GET(): Promise<NextResponse> {
  try {
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

    const customerEmail = clean(user.email).toLowerCase();
    const admin = getSupabaseAdmin();

    const { data: bookings, error: bookingError } = await admin
      .from("bookings")
      .select(`
        id,
        title,
        customer_name,
        customer_email,
        start_time,
        end_time,
        appointment_date,
        appointment_time,
        appointment_type,
        customer_address,
        location,
        notes,
        status,
        google_event_id,
        google_event_url,
        google_event_link,
        google_meet_url,
        instructor_name
      `)
      .ilike("customer_email", customerEmail)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (bookingError) {
      throw bookingError;
    }

    const bookingRows = bookings ?? [];
    const bookingIds = bookingRows.map((booking) => booking.id);

    if (bookingIds.length === 0) {
      return NextResponse.json({ success: true, bookings: [] });
    }

    const [
      { data: files, error: filesError },
      { data: reports, error: reportsError },
      { data: feedback, error: feedbackError },
    ] = await Promise.all([
      admin
        .from("appointment_files")
        .select("*")
        .in("booking_id", bookingIds)
        .order("created_at", { ascending: false }),
      admin
        .from("lesson_reports")
        .select("*")
        .in("booking_id", bookingIds)
        .order("created_at", { ascending: false }),
      admin
        .from("appointment_feedback")
        .select("*")
        .in("booking_id", bookingIds),
    ]);

    if (filesError) throw filesError;
    if (reportsError) throw reportsError;
    if (feedbackError) throw feedbackError;

    const filesByBooking = new Map<string, Array<Record<string, unknown>>>();

    for (const file of files ?? []) {
      const path = clean(file.storage_path);
      const { data: signed } = await admin.storage
        .from("appointment-files")
        .createSignedUrl(path, 60 * 60);

      const list = filesByBooking.get(file.booking_id) ?? [];

      list.push({
        ...file,
        file_url: signed?.signedUrl ?? "",
      });

      filesByBooking.set(file.booking_id, list);
    }

    const reportByBooking = new Map<string, Record<string, unknown>>();
    for (const report of reports ?? []) {
      if (!reportByBooking.has(report.booking_id)) {
        reportByBooking.set(report.booking_id, report);
      }
    }

    const feedbackByBooking = new Map<string, Record<string, unknown>>();
    for (const item of feedback ?? []) {
      feedbackByBooking.set(item.booking_id, item);
    }

    const enrichedBookings = bookingRows.map((booking) => ({
      ...booking,
      appointment_files: filesByBooking.get(booking.id) ?? [],
      lesson_report: reportByBooking.get(booking.id) ?? null,
      feedback: feedbackByBooking.get(booking.id) ?? null,
    }));

    return NextResponse.json({
      success: true,
      bookings: enrichedBookings,
    });
  } catch (error) {
    console.error("CUSTOMER APPOINTMENTS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "De afspraken konden niet geladen worden.",
        details: error instanceof Error ? error.message : "Onbekende fout.",
      },
      { status: 500 },
    );
  }
}
