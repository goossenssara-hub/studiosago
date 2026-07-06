import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  calculateCorrectionPrice,
  webshopProducts,
} from "@/lib/webshopProducts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
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
      console.error("SUPABASE SAVE ERROR:", saveError);

      return NextResponse.json(
        {
          error: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
          code: saveError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: payment._links?.checkout?.href,
    });
  } catch (error) {
    console.error("WEBSHOP CHECKOUT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Er ging iets mis bij het starten van de betaling.",
      },
      { status: 500 }
    );
  }
}