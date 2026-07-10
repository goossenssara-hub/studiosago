import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  calculateCorrectionPrice,
  webshopProducts,
} from "@/lib/webshopProducts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITED_PRODUCT = "klaar-voor-de-sprong-middelbaar";
const MAX_INSCHRIJVINGEN = 9;

/*
 * Deze betaalstatussen reserveren een plaats.
 *
 * open:
 * De betaling is aangemaakt en de klant kan nog betalen.
 *
 * pending:
 * Mollie verwerkt de betaling.
 *
 * authorized:
 * De betaling is goedgekeurd, maar nog niet definitief geïnd.
 *
 * paid:
 * De inschrijving is betaald.
 */
const RESERVED_PAYMENT_STATUSES = [
  "open",
  "pending",
  "authorized",
  "paid",
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

async function getAantalGereserveerdePlaatsen({
  supabaseAdmin,
}: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
}) {
  const { count, error } = await supabaseAdmin
    .from("webshop_payments")
    .select("checkout_id", {
      count: "exact",
      head: true,
    })
    .eq("product", LIMITED_PRODUCT)
    .in("status", RESERVED_PAYMENT_STATUSES);

  if (error) {
    console.error(
      "KLAAR VOOR DE SPRONG CAPACITY CHECK ERROR:",
      error
    );

    throw new Error(
      "Het aantal beschikbare plaatsen kon niet gecontroleerd worden."
    );
  }

  return count ?? 0;
}

async function getDiscount({
  supabaseAdmin,
  product,
  studentName,
  email,
  discountCode,
  amount,
}: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
  product: string;
  studentName: string;
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

  const normalizedDiscountCode = discountCode.trim().toUpperCase();

  const { data: code, error } = await supabaseAdmin
    .from("discount_codes")
    .select("*")
    .eq("code", normalizedDiscountCode)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("DISCOUNT CODE FIND ERROR:", error);
  }

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

  const productOk =
    code.product === "all" || code.product === product;

  const emailOk =
    !code.email || normalize(code.email) === normalize(email);

  const nameOk =
    !code.customer_name ||
    normalize(code.customer_name) === normalize(studentName);

  const dateOk =
    (!code.valid_from || new Date(code.valid_from) <= now) &&
    (!code.valid_until || new Date(code.valid_until) >= now);

  const usesOk =
    !code.max_uses ||
    Number(code.used_count || 0) < Number(code.max_uses);

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
    discountId: String(code.id),
    discountCode: String(code.code),
  };
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const formData = await request.formData();

    const product = String(formData.get("product") || "").trim();
    const parentName = String(
      formData.get("parent_name") || ""
    ).trim();
    const studentName = String(
      formData.get("student_name") || ""
    ).trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const discountCode = String(
      formData.get("discount_code") || ""
    ).trim();

    const studentAge = String(
      formData.get("student_age") || ""
    ).trim();
    const schoolYear = String(
      formData.get("school_year") || ""
    ).trim();
    const school = String(formData.get("school") || "").trim();
    const wordCountValue = String(
      formData.get("word_count") || ""
    ).trim();
    const textType = String(
      formData.get("text_type") || ""
    ).trim();

    if (!product) {
      return NextResponse.json(
        {
          error: "Geen product geselecteerd.",
        },
        { status: 400 }
      );
    }

    if (!parentName || !email || !phone) {
      return NextResponse.json(
        {
          error: "Niet alle verplichte velden zijn ingevuld.",
        },
        { status: 400 }
      );
    }

    if (product !== "tekstcorrectie" && !studentName) {
      return NextResponse.json(
        {
          error: "De naam van de leerling ontbreekt.",
        },
        { status: 400 }
      );
    }

    /*
     * Controleer de capaciteit voordat een Mollie-betaling
     * wordt aangemaakt.
     */
    let plaatsenOver: number | null = null;

    if (product === LIMITED_PRODUCT) {
      const aantalGereserveerdePlaatsen =
        await getAantalGereserveerdePlaatsen({
          supabaseAdmin,
        });

      plaatsenOver = Math.max(
        0,
        MAX_INSCHRIJVINGEN - aantalGereserveerdePlaatsen
      );

      if (plaatsenOver === 0) {
        return NextResponse.json(
          {
            error:
              "Klaar voor de Sprong naar het middelbaar is helaas volzet. Er kunnen maximaal 9 leerlingen deelnemen.",
            soldOut: true,
            placesLeft: 0,
          },
          { status: 409 }
        );
      }
    }

    let productName = "";
    let amountNumber = 0;

    if (product === "tekstcorrectie") {
      const wordCount = Number(wordCountValue || 0);

      if (!Number.isFinite(wordCount) || wordCount < 1) {
        return NextResponse.json(
          {
            error: "Aantal woorden ontbreekt.",
          },
          { status: 400 }
        );
      }

      productName = `Tekstcorrectie Studio SaGo - ${wordCount} woorden`;
      amountNumber = calculateCorrectionPrice(wordCount);
    } else {
      const productInfo =
        webshopProducts[
          product as keyof typeof webshopProducts
        ];

      if (!productInfo) {
        return NextResponse.json(
          {
            error: "Onbekend product.",
          },
          { status: 400 }
        );
      }

      productName = productInfo.name;
      amountNumber = Number(productInfo.amount);
    }

    if (
      !Number.isFinite(amountNumber) ||
      amountNumber < 0
    ) {
      return NextResponse.json(
        {
          error: "Ongeldige productprijs.",
        },
        { status: 500 }
      );
    }

    const discount = await getDiscount({
      supabaseAdmin,
      product,
      studentName,
      email,
      discountCode,
      amount: amountNumber,
    });

    const amount = discount.finalAmount.toFixed(2);

    const mollieApiKey = process.env.MOLLIE_API_KEY;
    const siteUrlEnv = process.env.NEXT_PUBLIC_SITE_URL;

    if (!mollieApiKey) {
      return NextResponse.json(
        {
          error: "MOLLIE_API_KEY ontbreekt.",
        },
        { status: 500 }
      );
    }

    if (!siteUrlEnv) {
      return NextResponse.json(
        {
          error: "NEXT_PUBLIC_SITE_URL ontbreekt.",
        },
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
        ? `${productName} - €${discount.discountAmount.toFixed(
            0
          )} korting`
        : productName,

      method: "bancontact",

      redirectUrl: `${siteUrl}/betaling/status?checkoutId=${checkoutId}`,

      /*
       * Deze URL komt overeen met:
       * app/api/mollie/webhook/route.ts
       */
      ...(process.env.NODE_ENV === "production"
        ? {
            webhookUrl: `${siteUrl}/api/mollie/webhook`,
          }
        : {}),

      locale: "nl_BE",

      metadata: {
        checkoutId,
        product,
        productName,
        amount,
        originalAmount: amountNumber.toFixed(2),

        discountId: discount.discountId,
        discountCode: discount.discountCode,
        discountAmount:
          discount.discountAmount.toFixed(2),

        parentName,
        studentName,
        email,
        phone,
        studentAge,
        schoolYear,
        school,
        wordCount: wordCountValue,
        textType,
        notes,
      },
    };

    const response = await fetch(
      "https://api.mollie.com/v2/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mollieApiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": checkoutId,
        },
        body: JSON.stringify(paymentBody),
      }
    );

    const payment = await response.json();

    if (!response.ok) {
      console.error(
        "MOLLIE WEBSHOP PAYMENT CREATE ERROR:",
        payment
      );

      return NextResponse.json(
        {
          error:
            payment.detail ||
            "Mollie-betaling kon niet gestart worden.",
        },
        { status: response.status || 500 }
      );
    }

    if (!payment.id) {
      return NextResponse.json(
        {
          error:
            "Mollie heeft geen geldig betalingsnummer teruggestuurd.",
        },
        { status: 500 }
      );
    }

    const checkoutUrl = payment._links?.checkout?.href;

    if (!checkoutUrl) {
      return NextResponse.json(
        {
          error:
            "Mollie heeft geen geldige betaallink teruggestuurd.",
        },
        { status: 500 }
      );
    }

    /*
     * Mollie geeft normaal de status 'open' terug.
     * Daardoor telt deze betaling onmiddellijk als gereserveerde plaats.
     */
    const paymentStatus = String(
      payment.status || "open"
    );

    const { error: saveError } = await supabaseAdmin
      .from("webshop_payments")
      .insert({
        checkout_id: checkoutId,
        payment_id: payment.id,
        product,
        email,
        status: paymentStatus,
      });

    if (saveError) {
      console.error(
        "WEBSHOP PAYMENT SAVE ERROR:",
        saveError
      );

      /*
       * Er bestaat wel een Mollie-betaling, maar de reservering
       * kon niet in Supabase worden opgeslagen.
       */
      return NextResponse.json(
        {
          error:
            "De betaling werd aangemaakt, maar de inschrijving kon niet geregistreerd worden. Neem contact op met Studio SaGo.",
          details: saveError.details,
          hint: saveError.hint,
          code: saveError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: checkoutUrl,

      hasDiscount: discount.hasDiscount,
      discountAmount: discount.discountAmount,
      originalAmount: amountNumber,
      finalAmount: discount.finalAmount,

      soldOut: false,

      placesLeft:
        product === LIMITED_PRODUCT && plaatsenOver !== null
          ? Math.max(plaatsenOver - 1, 0)
          : null,
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