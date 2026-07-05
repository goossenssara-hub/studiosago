import { NextResponse } from "next/server";

export const runtime = "nodejs";

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