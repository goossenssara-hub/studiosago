import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Geen afspraak ontvangen." },
        { status: 400 }
      );
    }

    const { data: appointment, error: appointmentError } =
      await supabaseAdmin
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .maybeSingle();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Afspraak niet gevonden." },
        { status: 404 }
      );
    }

    if (appointment.status === "approved") {
      return NextResponse.json({ success: true });
    }

    if (appointment.pass_id && !appointment.credit_deducted) {
      const { data: pass, error: passError } = await supabaseAdmin
        .from("passes")
        .select("*")
        .eq("id", appointment.pass_id)
        .maybeSingle();

      if (passError || !pass) {
        return NextResponse.json(
          { error: "Beurtenkaart niet gevonden." },
          { status: 404 }
        );
      }

      const currentRemaining =
        pass.remaining_sessions ?? pass.remaining_credits ?? 0;

      if (currentRemaining <= 0) {
        return NextResponse.json(
          { error: "Geen beurten meer beschikbaar." },
          { status: 400 }
        );
      }

      await supabaseAdmin
        .from("passes")
        .update({
          remaining_sessions:
            pass.remaining_sessions !== null
              ? currentRemaining - 1
              : pass.remaining_sessions,
          remaining_credits:
            pass.remaining_credits !== null
              ? currentRemaining - 1
              : pass.remaining_credits,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment.pass_id);
    }

    const { error: updateError } = await supabaseAdmin
      .from("appointments")
      .update({
        status: "approved",
        credit_deducted: true,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    if (updateError) {
      return NextResponse.json(
        { error: "Afspraak kon niet goedgekeurd worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("APPROVE APPOINTMENT ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij goedkeuren." },
      { status: 500 }
    );
  }
}