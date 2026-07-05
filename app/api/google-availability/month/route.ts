import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json({ days: [] });
    }

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_AVAILABILITY_URL;

    if (!scriptUrl) {
      return NextResponse.json(
        { error: "GOOGLE_APPS_SCRIPT_AVAILABILITY_URL ontbreekt." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${scriptUrl}?year=${year}&month=${month}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json({
      days: data.days ?? [],
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Beschikbare dagen konden niet geladen worden." },
      { status: 500 }
    );
  }
}