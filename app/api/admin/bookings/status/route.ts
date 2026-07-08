import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Booking of status ontbreekt." },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "contacted",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Ongeldige status." },
        { status: 400 }
      );
    }

    const updateData: Record<string, string | boolean> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "confirmed") {
      updateData.confirmed_at = new Date().toISOString();
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    if (status === "cancelled") {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Status kon niet aangepast worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BOOKING STATUS UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij status aanpassen." },
      { status: 500 }
    );
  }
}