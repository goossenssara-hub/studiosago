import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  calculateCorrectionPrice,
  webshopProducts,
} from "@/lib/webshopProducts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

async function getDiscount({
  supabaseAdmin,
  product,
  parentName,
  email,
  discountCode,
  amount,
}: {
supabaseAdmin: any;  product: string;
  parentName: string;
  email: string;
  discountCode: string;
  amount: number;
}) {
  if (!discountCode.trim()) {
    return {
      hasDiscount: false,
      discountAmount: 0,
      finalAmount: amount,
      discountId: null as string | null,
      discountCode: "",
    };
  }

  const { data: code, error } = await supabaseAdmin
    .from("discount_codes")
    .select("*")
    .eq("code", discountCode.trim().toUpperCase())
    .eq("active", true)
    .maybeSingle();

  if (error || !code) {
    return {
      hasDiscount: false,
      discountAmount: 0,
      finalAmount: amount,
      discountId: null as string | null,
      discountCode: "",
    };
  }

  const now = new Date();

  const productOk = code.product === "all" || code.product === product;
  const emailOk = !code.email || normalize(code.email) === normalize(email);
  const nameOk =
    !code.customer_name ||
    normalize(code.customer_name) === normalize(parentName);

  const dateOk =
    (!code.valid_from || new Date(code.valid_from) <= now) &&
    (!code.valid_until || new Date(code.valid_until) >= now);

  const usesOk =
    !code.max_uses || Number(code.used_count || 0) < Number(code.max_uses);

  if (!productOk || !emailOk || !nameOk || !dateOk || !usesOk) {
    return {
      hasDiscount: false,
      discountAmount: 0,
      finalAmount: amount,
      discountId: null as string | null,
      discountCode: "",
    };
  }

  let discountAmount = Number(code.discount_value || 0);

  if (code.discount_type === "percentage") {
    discountAmount = amount * (discountAmount / 100);
  }

  discountAmount = Math.min(discountAmount, amount);

  return {
    hasDiscount: true,
    discountAmount,
    finalAmount: Math.max(amount - discountAmount, 0),
    discountId: code.id as string,
    discountCode: code.code as string,
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

    const discount = await getDiscount({
      supabaseAdmin,
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
        ? `${productName} - €${discount.discountAmount.toFixed(0)} korting`
        : productName,
      method: "bancontact",
      redirectUrl: `${siteUrl}/betaling/status?checkoutId=${checkoutId}`,
      locale: "nl_BE",
      metadata: {
        checkoutId,
        product,
        productName,
        amount,
        originalAmount: amountNumber.toFixed(2),
        discountId: discount.discountId,
        discountCode: discount.discountCode,
        discountAmount: discount.discountAmount.toFixed(2),
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