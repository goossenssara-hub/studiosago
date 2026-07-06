import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  calculateCorrectionPrice,
  webshopProducts,
} from "@/lib/webshopProducts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase environment variables ontbreken: NEXT_PUBLIC_SUPABASE_URL en/of SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const product = String(formData.get("product") || "");
    const parentName = String(formData.get("parent_name") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const notes = String(formData.get("notes") || "");

    let productName = "";
    let amount = "";

    if (product === "tekstcorrectie") {
      const wordCount = Number(formData.get("word_count") || 0);

      if (!wordCount || wordCount < 1) {
        return NextResponse.json(
          { error: "Aantal woorden ontbreekt." },
          { status: 400 }
        );
      }

      productName = `Tekstcorrectie Studio SaGo - ${wordCount} woorden`;
      amount = calculateCorrectionPrice(wordCount).toFixed(2);
    } else {
      const productInfo =
        webshopProducts[product as keyof typeof webshopProducts];

      if (!productInfo) {
        return NextResponse.json(
          { error: "Onbekend product." },
          { status: 400 }
        );
      }

      productName = productInfo.name;
      amount = productInfo.amount;
    }

    if (!parentName || !email || !phone) {
      return NextResponse.json(
        { error: "Niet alle verplichte velden zijn ingevuld." },
        { status: 400 }
      );
    }

    const mollieApiKey = process.env.MOLLIE_API_KEY;
    const siteUrlEnv = process.env.NEXT_PUBLIC_SITE_URL;

    if (!mollieApiKey) {
      return NextResponse.json(
        { error: "MOLLIE_API_KEY ontbreekt." },
        { status: 500 }
      );
    }

    if (!siteUrlEnv) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SITE_URL ontbreekt." },
        { status: 500 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const siteUrl = siteUrlEnv.replace(/\/$/, "");
    const checkoutId = crypto.randomUUID();

    const paymentBody = {
      amount: {
        currency: "EUR",
        value: amount,
      },
      description: productName,
      method: "bancontact",
      redirectUrl: `${siteUrl}/betaling/status?checkoutId=${checkoutId}`,
      locale: "nl_BE",
      metadata: {
        checkoutId,
        product,
        productName,
        amount,
        parentName,
        email,
        phone,
        studentName: String(formData.get("student_name") || ""),
        studentAge: String(formData.get("student_age") || ""),
        schoolYear: String(formData.get("school_year") || ""),
        school: String(formData.get("school") || ""),
        wordCount: String(formData.get("word_count") || ""),
        textType: String(formData.get("text_type") || ""),
        notes,
      },
      ...(process.env.NODE_ENV === "production"
        ? { webhookUrl: `${siteUrl}/api/mollie/webshop-webhook` }
        : {}),
    };

    const response = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": checkoutId,
      },
      body: JSON.stringify(paymentBody),
    });

    const payment = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: payment.detail || "Mollie betaling kon niet gestart worden.",
        },
        { status: 500 }
      );
    }

    const { error: saveError } = await supabaseAdmin
      .from("webshop_payments")
      .insert({
        checkout_id: checkoutId,
        payment_id: payment.id,
        product,
        email,
        status: payment.status || "created",
      });

    if (saveError) {
      console.error(saveError);

      return NextResponse.json(
        { error: "Betaling kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: payment._links?.checkout?.href,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Er ging iets mis bij het starten van de betaling." },
      { status: 500 }
    );
  }
}