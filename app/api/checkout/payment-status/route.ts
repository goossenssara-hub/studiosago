import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkoutId = searchParams.get("checkoutId");

  if (!checkoutId) {
    return NextResponse.json({ error: "Geen checkoutId." }, { status: 400 });
  }

  const { data: savedPayment, error } = await supabaseAdmin
    .from("webshop_payments")
    .select("*")
    .eq("checkout_id", checkoutId)
    .single();

  if (error || !savedPayment) {
    return NextResponse.json({ status: "open", product: "" });
  }

  const response = await fetch(
    `https://api.mollie.com/v2/payments/${savedPayment.payment_id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
      },
    }
  );

  const payment = await response.json();

  if (!response.ok) {
    return NextResponse.json({
      status: "open",
      product: savedPayment.product,
    });
  }

  await supabaseAdmin
    .from("webshop_payments")
    .update({ status: payment.status })
    .eq("checkout_id", checkoutId);

  return NextResponse.json({
    status: payment.status,
    product: savedPayment.product,
  });
}