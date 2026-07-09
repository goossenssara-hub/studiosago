import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        created_at,
        customer_name,
        customer_email,
        notes,
        service,
        date,
        start_time,
        end_time,
        status,
        pass_id
      `)
      .or("status.eq.pending,status.is.null")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      requests: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Kon aanvragen niet ophalen.",
      },
      { status: 500 }
    );
  }
}