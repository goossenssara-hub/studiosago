import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { appointmentId, status } = await request.json();

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: "Afspraak of status ontbreekt." },
        { status: 400 }
      );
    }

    const allowedStatuses = ["approved", "completed", "cancelled", "contacted"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Ongeldige status." },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    if (status === "cancelled") {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId);

    if (error) {
      return NextResponse.json(
        { error: "Status kon niet aangepast worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij status aanpassen." },
      { status: 500 }
    );
  }
}