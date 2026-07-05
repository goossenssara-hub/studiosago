import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const date = searchParams.get("date");
  const duration = searchParams.get("duration") || "60";

  if (!date) {
    return NextResponse.json({ slots: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("availability")
    .select("*")
    .eq("date", date)
    .eq("duration", Number(duration))
    .eq("is_booked", false)
    .order("time", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Beschikbare momenten konden niet geladen worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    slots: data?.map((slot) => slot.time) ?? [],
  });
}