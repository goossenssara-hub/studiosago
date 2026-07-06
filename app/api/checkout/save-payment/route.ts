import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const body = await request.json();

    const checkoutId = String(body.checkoutId || "");
    const paymentId = String(body.paymentId || "");
    const product = String(body.product || "");
    const email = String(body.email || "");

    if (!checkoutId || !paymentId || !product || !email) {
      return NextResponse.json(
        { error: "Niet alle verplichte gegevens zijn ontvangen." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("webshop_payments")
      .insert({
        checkout_id: checkoutId,
        payment_id: paymentId,
        product,
        email,
        status: "created",
      });

    if (error) {
      console.error("WEBSHOP PAYMENT INSERT ERROR:", error);

      return NextResponse.json(
        { error: "Betaling kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("WEBSHOP PAYMENT SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij het opslaan van de betaling." },
      { status: 500 }
    );
  }
}