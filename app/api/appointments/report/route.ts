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
     * Voeg hier eventueel je bestaande admincontrole toe.
     * Bijvoorbeeld controle op profiles.role === "admin".
     */

    const body = await request.json();
    const bookingId = clean(body?.bookingId);

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "bookingId ontbreekt." },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdmin();

    const { error } = await admin
      .from("lesson_reports")
      .upsert(
        {
          booking_id: bookingId,
          created_by: user.id,
          report_date:
            clean(body?.reportDate) ||
            new Date().toISOString().slice(0, 10),
          completed_items: cleanList(body?.completedItems),
          next_steps: cleanList(body?.nextSteps),
          general_feedback: clean(body?.generalFeedback).slice(0, 5000) || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "booking_id" },
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LESSON REPORT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Het lesverslag kon niet worden opgeslagen.",
      },
      { status: 500 },
    );
  }
}
