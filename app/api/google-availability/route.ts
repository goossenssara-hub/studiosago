import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const duration = searchParams.get("duration") || "60";
    const type = searchParams.get("type") || "begeleiding";

    if (!date) {
      return NextResponse.json({ slots: [] });
    }

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_AVAILABILITY_URL;

    if (!scriptUrl) {
      return NextResponse.json(
        { error: "GOOGLE_APPS_SCRIPT_AVAILABILITY_URL ontbreekt." },
        { status: 500 }
      );
    }

    const url = `${scriptUrl}?date=${encodeURIComponent(
      date
    )}&duration=${encodeURIComponent(duration)}&type=${encodeURIComponent(
      type
    )}`;

    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();

    return NextResponse.json({
      slots: data.slots ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Beschikbare momenten konden niet geladen worden." },
      { status: 500 }
    );
  }
}