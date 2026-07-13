import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function bookingStart(booking: {
  start_time: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
}): Date | null {
  const raw =
    clean(booking.start_time) ||
    (booking.appointment_date && booking.appointment_time
      ? `${booking.appointment_date}T${clean(booking.appointment_time).slice(0, 5)}:00+02:00`
      : "");

  const parsed = raw ? new Date(raw) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = clean(process.env.RESEND_API_KEY);
  const from = clean(process.env.REMINDER_FROM_EMAIL);

  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY of REMINDER_FROM_EMAIL ontbreekt.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const secret = clean(process.env.CRON_SECRET);
  const authorization = clean(request.headers.get("authorization"));

  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json(
      { success: false, error: "Niet toegestaan." },
      { status: 401 },
    );
  }

  try {
    const admin = getSupabaseAdmin();
    const now = new Date();
    const from = new Date(now.getTime() + 45 * 60_000);
    const until = new Date(now.getTime() + 25 * 60 * 60_000);

    const { data: bookings, error } = await admin
      .from("bookings")
      .select(`
        id,
        title,
        customer_name,
        customer_email,
        start_time,
        appointment_date,
        appointment_time,
        appointment_type,
        google_meet_url,
        google_event_link,
        reminder_24h_sent_at,
        reminder_1h_sent_at,
        status
      `)
      .not("customer_email", "is", null)
      .in("status", ["confirmed", "approved"])
      .gte("appointment_date", from.toISOString().slice(0, 10))
      .lte("appointment_date", until.toISOString().slice(0, 10));

    if (error) throw error;

    let sent24h = 0;
    let sent1h = 0;

    for (const booking of bookings ?? []) {
      const start = bookingStart(booking);
      if (!start || !booking.customer_email) continue;

      const minutesUntil = Math.round(
        (start.getTime() - now.getTime()) / 60_000,
      );

      const time = start.toLocaleTimeString("nl-BE", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Brussels",
      });

      if (
        minutesUntil >= 23 * 60 &&
        minutesUntil <= 25 * 60 &&
        !booking.reminder_24h_sent_at
      ) {
        await sendEmail({
          to: booking.customer_email,
          subject: `Herinnering: morgen studiebegeleiding om ${time}`,
          html: `
            <h2>Morgen heb je studiebegeleiding</h2>
            <p>Hallo ${booking.customer_name || ""},</p>
            <p>Je afspraak bij Studio SaGo start morgen om <strong>${time}</strong>.</p>
            <p>Tot dan!</p>
          `,
        });

        await admin
          .from("bookings")
          .update({ reminder_24h_sent_at: new Date().toISOString() })
          .eq("id", booking.id);

        sent24h += 1;
      }

      if (
        minutesUntil >= 45 &&
        minutesUntil <= 75 &&
        !booking.reminder_1h_sent_at
      ) {
        const meetUrl =
          clean(booking.google_meet_url) ||
          clean(booking.google_event_link);

        await sendEmail({
          to: booking.customer_email,
          subject: `Je afspraak start om ${time}`,
          html: `
            <h2>Je afspraak start over ongeveer één uur</h2>
            <p>Hallo ${booking.customer_name || ""},</p>
            <p>Je studiebegeleiding start om <strong>${time}</strong>.</p>
            ${
              meetUrl
                ? `<p><a href="${meetUrl}">Deelnemen via Google Meet</a></p>`
                : ""
            }
          `,
        });

        await admin
          .from("bookings")
          .update({ reminder_1h_sent_at: new Date().toISOString() })
          .eq("id", booking.id);

        sent1h += 1;
      }
    }

    return NextResponse.json({
      success: true,
      sent24h,
      sent1h,
    });
  } catch (error) {
    console.error("APPOINTMENT REMINDER CRON ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "De herinneringen konden niet worden verwerkt.",
      },
      { status: 500 },
    );
  }
}
