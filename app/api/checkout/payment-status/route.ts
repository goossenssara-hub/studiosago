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
        { error: "Geen checkoutId." },
        { status: 400 }
      );
    }

    const { data: savedPayment, error } = await supabaseAdmin
      .from("webshop_payments")
      .select("*")
      .eq("checkout_id", checkoutId)
      .single();

    if (error || !savedPayment) {
      console.error("WEBSHOP STATUS PAYMENT FIND ERROR:", error);

      return NextResponse.json({
        status: "open",
        product: "",
      });
    }

    const mollieApiKey = process.env.MOLLIE_API_KEY;

if (!mollieApiKey) {
  return NextResponse.json(
    {
      error: "MOLLIE_API_KEY ontbreekt.",
      env: process.env.VERCEL_ENV,
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      allEnvKeys: Object.keys(process.env).filter((k) =>
        k.includes("MOLLIE")
      ),
    },
    { status: 500 }
  );
}
    const response = await fetch(
      `https://api.mollie.com/v2/payments/${savedPayment.payment_id}`,
      {
        headers: {
          Authorization: `Bearer ${mollieApiKey}`,
        },
      }
    );

    const payment = await response.json();

    if (!response.ok) {
      console.error("MOLLIE STATUS ERROR:", payment);

      return NextResponse.json({
        status: "open",
        product: savedPayment.product,
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("webshop_payments")
      .update({ status: payment.status })
      .eq("checkout_id", checkoutId);

    if (updateError) {
      console.error("WEBSHOP STATUS UPDATE ERROR:", updateError);
    }

    return NextResponse.json({
      status: payment.status,
      product: savedPayment.product,
    });
  } catch (error) {
    console.error("WEBSHOP STATUS SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Status kon niet opgehaald worden." },
      { status: 500 }
    );
  }
}