import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ slots: [] });
    }

    if (!process.env.GOOGLE_APPS_SCRIPT_AVAILABILITY_URL) {
      return NextResponse.json(
        { error: "GOOGLE_APPS_SCRIPT_AVAILABILITY_URL ontbreekt." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${process.env.GOOGLE_APPS_SCRIPT_AVAILABILITY_URL}?date=${encodeURIComponent(
        date
      )}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return NextResponse.json(
        {
          error:
            data.error ||
            "Beschikbare momenten konden niet opgehaald worden.",
        },
        { status: 500 }
      );
    }

    const slots = Array.isArray(data.slots) ? data.slots : [];

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Google availability error:", error);

    return NextResponse.json(
      { error: "Beschikbare momenten konden niet geladen worden." },
      { status: 500 }
    );
  }
}