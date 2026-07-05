import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const duration = searchParams.get("duration");

    if (!date || !duration) {
      return NextResponse.json({ slots: [] });
    }

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_AVAILABILITY_URL;

    if (!scriptUrl) {
      return NextResponse.json(
        {
          error: "GOOGLE_APPS_SCRIPT_AVAILABILITY_URL ontbreekt.",
        },
        {
          status: 500,
        }
      );
    }

    const response = await fetch(
      `${scriptUrl}?date=${encodeURIComponent(
        date
      )}&duration=${encodeURIComponent(duration)}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json({
      slots: data.slots ?? [],
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Beschikbare momenten konden niet geladen worden.",
      },
      {
        status: 500,
      }
    );
  }
}