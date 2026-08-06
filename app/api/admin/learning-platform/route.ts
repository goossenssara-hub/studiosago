import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UpdateBody = {
  id?: string;
  action?: "mark_invited" | "toggle_activation" | "update_notes";
  activated?: boolean;
  notes?: string;
};

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("learning_platform_pioneers")
      .select("id,first_name,email,role,children_ages,updates_consent,privacy_consent,lifetime_access_eligible,source,invitation_sent_at,account_activated,account_activated_at,notes,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const pioneers = data ?? [];
    return NextResponse.json({
      pioneers,
      totals: {
        all: pioneers.length,
        lifetime: pioneers.filter((item) => item.lifetime_access_eligible).length,
        invited: pioneers.filter((item) => Boolean(item.invitation_sent_at)).length,
        activated: pioneers.filter((item) => item.account_activated).length,
        pending: pioneers.filter((item) => !item.account_activated).length,
      },
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("LEARNING PLATFORM ADMIN GET ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Aanmeldingen konden niet geladen worden." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UpdateBody;
    const id = String(body.id ?? "").trim();
    if (!id || !body.action) {
      return NextResponse.json({ error: "Ongeldige beheeractie." }, { status: 400 });
    }

    const now = new Date().toISOString();
    let payload: Record<string, unknown> = { updated_at: now };

    if (body.action === "mark_invited") {
      payload.invitation_sent_at = now;
    } else if (body.action === "toggle_activation") {
      const activated = body.activated === true;
      payload = {
        ...payload,
        account_activated: activated,
        account_activated_at: activated ? now : null,
      };
    } else if (body.action === "update_notes") {
      payload.notes = String(body.notes ?? "").trim().slice(0, 2000) || null;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("learning_platform_pioneers")
      .update(payload)
      .eq("id", id)
      .select("id,invitation_sent_at,account_activated,account_activated_at,notes,updated_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, pioneer: data });
  } catch (error) {
    console.error("LEARNING PLATFORM ADMIN PATCH ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "De status kon niet worden aangepast." },
      { status: 500 }
    );
  }
}
