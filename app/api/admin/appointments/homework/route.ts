import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(clean)
    .filter(Boolean)
    .slice(0, 30);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Je bent niet aangemeld." },
        { status: 401 },
      );
    }

    /*
     * Voeg hier dezelfde admincontrole toe als in je andere adminroutes.
     */

    const body = await request.json();
    const bookingId = clean(body?.bookingId);
    const items = cleanList(body?.items);

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "bookingId ontbreekt." },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdmin();

    const { error } = await admin
      .from("appointment_homework")
      .upsert(
        {
          booking_id: bookingId,
          items,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "booking_id" },
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("APPOINTMENT HOMEWORK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Het huiswerk kon niet worden opgeslagen.",
      },
      { status: 500 },
    );
  }
}
