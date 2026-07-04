import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.json();

  const { checkoutId, paymentId, product, email } = body;

  await supabaseAdmin.from("webshop_payments").insert({
    checkout_id: checkoutId,
    payment_id: paymentId,
    product,
    email,
    status: "created",
  });

  return NextResponse.json({ ok: true });
}