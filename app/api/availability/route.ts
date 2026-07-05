import { NextResponse } from "next/server";

const GOOGLE_APPS_SCRIPT_AVAILABILITY_URL =
  process.env.GOOGLE_APPS_SCRIPT_AVAILABILITY_URL;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const duration = searchParams.get("duration");

    if (!date || !duration) {
      return NextResponse.json({ slots: [] });
    }

    if (!GOOGLE_APPS_SCRIPT_AVAILABILITY_URL) {
      return NextResponse.json(
        { error: "GOOGLE_APPS_SCRIPT_AVAILABILITY_URL ontbreekt." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${GOOGLE_APPS_SCRIPT_AVAILABILITY_URL}?date=${encodeURIComponent(
        date
      )}&duration=${encodeURIComponent(duration)}`,
      { cache: "no-store" }
    );

    const data = await response.json();

    return NextResponse.json({
      slots: data.slots || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Beschikbare momenten konden niet geladen worden." },
      { status: 500 }
    );
  }
}