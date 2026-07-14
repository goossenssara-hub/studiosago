import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UnknownRow = Record<string, unknown>;

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getBrusselsDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    date: `${values.year}-${values.month}-${values.day}`,
  };
}

function monthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function isWorkshop(row: UnknownRow) {
  const text = `${clean(row.title)} ${clean(row.service_type)} ${clean(
    row.notes
  )}`.toLowerCase();

  return (
    text.includes("workshop") ||
    text.includes("kamp") ||
    text.includes("klaar voor de sprong")
  );
}

function isLesson(row: UnknownRow) {
  if (isWorkshop(row)) return false;

  const text = `${clean(row.title)} ${clean(row.service_type)} ${clean(
    row.notes
  )}`.toLowerCase();

  return (
    text.includes("begeleiding") ||
    text.includes("huiswerk") ||
    text.includes("coaching") ||
    text.includes("bijles") ||
    text.includes("studie")
  );
}

function getPaymentAmount(row: UnknownRow) {
  return Math.max(
    numberValue(
      row.amount ??
        row.total_amount ??
        row.final_amount ??
        row.original_amount
    ),
    0
  );
}

async function paidRevenue({
  supabaseAdmin,
  start,
  end,
}: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
  start: string;
  end: string;
}) {
  const [webshopResult, appointmentResult] = await Promise.all([
    supabaseAdmin
      .from("webshop_payments")
      .select("*")
      .eq("status", "paid")
      .gte("created_at", start)
      .lt("created_at", end),

    supabaseAdmin
      .from("appointment_orders")
      .select("*")
      .eq("payment_status", "paid")
      .gte("created_at", start)
      .lt("created_at", end),
  ]);

  if (webshopResult.error) {
    console.error(
      "DASHBOARD WEBSHOP REVENUE ERROR:",
      webshopResult.error
    );
  }

  if (appointmentResult.error) {
    console.error(
      "DASHBOARD APPOINTMENT REVENUE ERROR:",
      appointmentResult.error
    );
  }

  const webshopTotal = (webshopResult.data ?? []).reduce(
    (sum: number, row: UnknownRow) => sum + getPaymentAmount(row),
    0
  );

  const appointmentTotal = (appointmentResult.data ?? []).reduce(
    (sum: number, row: UnknownRow) => sum + getPaymentAmount(row),
    0
  );

  return Math.round((webshopTotal + appointmentTotal) * 100) / 100;
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const now = new Date();
    const brussels = getBrusselsDateParts(now);

    const currentMonth = monthRange(brussels.year, brussels.month);

    const previousMonthDate = new Date(
      Date.UTC(brussels.year, brussels.month - 2, 1)
    );

    const previousMonth = monthRange(
      previousMonthDate.getUTCFullYear(),
      previousMonthDate.getUTCMonth() + 1
    );

    const startOfToday = new Date(`${brussels.date}T00:00:00+02:00`);
    const endOfToday = new Date(`${brussels.date}T23:59:59+02:00`);

    const [
      contactsResult,
      pendingResult,
      passesResult,
      todayBookingsResult,
      upcomingResult,
      revenueThisMonth,
      revenuePreviousMonth,
    ] = await Promise.all([
      supabaseAdmin
        .from("contacts")
        .select("*", { count: "exact", head: true }),

      supabaseAdmin
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .or("status.eq.pending,status.is.null"),

      supabaseAdmin
        .from("passes")
        .select("*")
        .eq("status", "active"),

      supabaseAdmin
        .from("bookings")
        .select("*")
        .neq("status", "cancelled")
        .gte("start_time", startOfToday.toISOString())
        .lte("start_time", endOfToday.toISOString()),

      supabaseAdmin
        .from("bookings")
        .select(
          "id, title, customer_name, customer_email, start_time, location, service_type, status, google_event_id, google_event_url, internal_notes"
        )
        .neq("status", "cancelled")
        .gte("start_time", now.toISOString())
        .order("start_time", { ascending: true })
        .limit(5),

      paidRevenue({
        supabaseAdmin,
        start: currentMonth.start,
        end: currentMonth.end,
      }),

      paidRevenue({
        supabaseAdmin,
        start: previousMonth.start,
        end: previousMonth.end,
      }),
    ]);

    const activePasses = (passesResult.data ?? []) as UnknownRow[];

    const emptyPasses = activePasses.filter((row) => {
      const remainingSessions = row.remaining_sessions;
      const remainingCredits = row.remaining_credits;

      if (
        remainingSessions !== null &&
        remainingSessions !== undefined
      ) {
        return numberValue(remainingSessions) <= 0;
      }

      return numberValue(remainingCredits) <= 0;
    }).length;

    const todayBookings = (todayBookingsResult.data ?? []) as UnknownRow[];

    const todayWorkshops = todayBookings.filter(isWorkshop).length;
    const todayLessons = todayBookings.filter(isLesson).length;

    const upcomingRows = (upcomingResult.data ?? []) as UnknownRow[];

    const syncIssues = upcomingRows.filter((row) => {
      const notes = `${clean(row.internal_notes)} ${clean(
        row.notes
      )}`.toLowerCase();

      const hasGoogleLink =
        Boolean(clean(row.google_event_id)) ||
        Boolean(clean(row.google_event_url));

      return (
        !hasGoogleLink &&
        (notes.includes("google") ||
          notes.includes("sync") ||
          notes.includes("synchron"))
      );
    }).length;

    const difference =
      revenuePreviousMonth > 0
        ? ((revenueThisMonth - revenuePreviousMonth) /
            revenuePreviousMonth) *
          100
        : revenueThisMonth > 0
        ? 100
        : null;

    const todayLabel = new Intl.DateTimeFormat("nl-BE", {
      timeZone: "Europe/Brussels",
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(now);

    return NextResponse.json({
      todayLabel,
      stats: {
        requests: pendingResult.count ?? 0,
        contacts: contactsResult.count ?? 0,
        passes: activePasses.length,
        todayAppointments: todayBookings.length,
        todayWorkshops,
        todayLessons,
        syncIssues,
        emptyPasses,
        revenueThisMonth,
        revenuePreviousMonth,
        revenueDifferencePercentage:
          difference === null
            ? null
            : Math.round(difference * 10) / 10,
      },
      upcoming: upcomingRows.map((row) => ({
        id: clean(row.id),
        title: clean(row.title) || "Afspraak Studio SaGo",
        customer:
          clean(row.customer_name) ||
          clean(row.customer_email) ||
          "Geen klantnaam",
        startTime: clean(row.start_time) || null,
        location: clean(row.location),
        serviceType: clean(row.service_type),
      })),
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD API ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Het dashboard kon niet geladen worden.",
      },
      { status: 500 }
    );
  }
}
