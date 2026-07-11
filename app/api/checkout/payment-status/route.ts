import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get("checkoutId");

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Geen checkoutId ontvangen." },
        { status: 400 }
      );
    }

    const { data: savedPayment, error: paymentError } =
      await supabaseAdmin
        .from("webshop_payments")
        .select("payment_id, product, status")
        .eq("checkout_id", checkoutId)
        .maybeSingle();

    if (paymentError) {
      console.error(
        "WEBSHOP STATUS PAYMENT FIND ERROR:",
        paymentError
      );

      return NextResponse.json(
        { error: "De betaling kon niet worden opgezocht." },
        { status: 500 }
      );
    }

    if (!savedPayment?.payment_id) {
      return NextResponse.json({
        status: "open",
        product: savedPayment?.product ?? "",
      });
    }

    const mollieApiKey = process.env.MOLLIE_API_KEY;

    if (!mollieApiKey) {
      console.error("MOLLIE_API_KEY ontbreekt.");

      return NextResponse.json(
        { error: "De betaalconfiguratie ontbreekt." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.mollie.com/v2/payments/${savedPayment.payment_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mollieApiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const payment = await response.json();

    if (!response.ok) {
      console.error("MOLLIE STATUS ERROR:", payment);

      return NextResponse.json(
        {
          status: savedPayment.status ?? "open",
          product: savedPayment.product ?? "",
        },
        { status: response.status }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("webshop_payments")
      .update({
        status: payment.status,
      })
      .eq("checkout_id", checkoutId);

    if (updateError) {
      console.error(
        "WEBSHOP STATUS UPDATE ERROR:",
        updateError
      );
    }

    return NextResponse.json({
      status: payment.status,
      product: savedPayment.product ?? "",
    });
  } catch (error) {
    console.error("WEBSHOP STATUS SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Status kon niet opgehaald worden." },
      { status: 500 }
    );
  }
}