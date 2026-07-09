import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  calculateCorrectionPrice,
  webshopProducts,
} from "@/lib/webshopProducts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISCOUNT_CODES = [
  "4KX9-MP7Q-L2ZT-81NR",
  "Q7LP-82XM-V4KT-9R31",
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function applyDiscount({
  product,
  parentName,
  email,
  discountCode,
  amount,
}: {
  product: string;
  parentName: string;
  email: string;
  discountCode: string;
  amount: number;
}) {
  const isTenBeurtenkaart =
    product === "10-beurtenkaart-lager" ||
    product === "10-beurtenkaart-secundair";

  const codeOk = DISCOUNT_CODES.includes(discountCode.trim().toUpperCase());
  const emailOk = normalize(email) === "markenvicky@outlook.be";

  const name = normalize(parentName);
  const nameOk = name === "vicky marken" || name === "joris koolen";

  if (isTenBeurtenkaart && codeOk && emailOk && nameOk) {
    return {
      hasDiscount: true,
      originalAmount: amount,
      discountAmount: 20,
      finalAmount: Math.max(amount - 20, 0),
    };
  }

  return {
    hasDiscount: false,
    originalAmount: amount,
    discountAmount: 0,
    finalAmount: amount,
  };
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const formData = await request.formData();

    const product = String(formData.get("product") || "");
    const parentName = String(formData.get("parent_name") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const notes = String(formData.get("notes") || "");
    const discountCode = String(formData.get("discount_code") || "");

    let productName = "";
    let amountNumber = 0;

    if (product === "tekstcorrectie") {
      const wordCount = Number(formData.get("word_count") || 0);

      if (!wordCount || wordCount < 1) {
        return NextResponse.json(
          { error: "Aantal woorden ontbreekt." },
          { status: 400 }
        );
      }

      productName = `Tekstcorrectie Studio SaGo - ${wordCount} woorden`;
      amountNumber = calculateCorrectionPrice(wordCount);
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
      amountNumber = Number(productInfo.amount);
    }

    if (!parentName || !email || !phone) {
      return NextResponse.json(
        { error: "Niet alle verplichte velden zijn ingevuld." },
        { status: 400 }
      );
    }

    const discount = applyDiscount({
      product,
      parentName,
      email,
      discountCode,
      amount: amountNumber,
    });

    const amount = discount.finalAmount.toFixed(2);

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
      description: discount.hasDiscount
        ? `${productName} - €20 korting`
        : productName,
      method: "bancontact",
      redirectUrl: `${siteUrl}/betaling/status?checkoutId=${checkoutId}`,
      locale: "nl_BE",
      metadata: {
        checkoutId,
        product,
        productName,
        amount,
        originalAmount: discount.originalAmount.toFixed(2),
        discountAmount: discount.discountAmount.toFixed(2),
        discountCode: discount.hasDiscount ? discountCode : "",
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