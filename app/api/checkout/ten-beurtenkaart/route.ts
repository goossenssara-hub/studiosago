import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  calculateCorrectionPrice,
  webshopProducts,
} from "@/lib/webshopProducts";
import { fulfillWebshopOrder } from "@/lib/fulfillWebshopOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DiscountResult = {
  hasDiscount: boolean;
  discountAmount: number;
  finalAmount: number;
  discountId: string | null;
  discountCode: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function noDiscount(amount: number): DiscountResult {
  return {
    hasDiscount: false,
    discountAmount: 0,
    finalAmount: roundCurrency(amount),
    discountId: null,
    discountCode: "",
  };
}

async function getDiscount({
  supabaseAdmin,
  product,
  parentName,
  email,
  discountCode,
  amount,
}: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
  product: string;
  parentName: string;
  email: string;
  discountCode: string;
  amount: number;
}): Promise<DiscountResult> {
  const cleanedDiscountCode = discountCode
    .trim()
    .toUpperCase();

  if (!cleanedDiscountCode) {
    return noDiscount(amount);
  }

  const { data: code, error } = await supabaseAdmin
    .from("discount_codes")
    .select("*")
    .eq("code", cleanedDiscountCode)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("DISCOUNT CODE LOOKUP ERROR:", error);
    return noDiscount(amount);
  }

  if (!code) {
    return noDiscount(amount);
  }

  const now = new Date();

  const productOk =
    !code.product ||
    code.product === "all" ||
    code.product === product;

  const emailOk =
    !code.email ||
    normalize(String(code.email)) === normalize(email);

  const nameOk =
    !code.customer_name ||
    normalize(String(code.customer_name)) ===
      normalize(parentName);

  const validFromOk =
    !code.valid_from ||
    new Date(code.valid_from).getTime() <= now.getTime();

  const validUntilOk =
    !code.valid_until ||
    new Date(`${code.valid_until}T23:59:59`).getTime() >=
      now.getTime();

  const usesOk =
    !code.max_uses ||
    Number(code.used_count || 0) <
      Number(code.max_uses);

  if (
    !productOk ||
    !emailOk ||
    !nameOk ||
    !validFromOk ||
    !validUntilOk ||
    !usesOk
  ) {
    return noDiscount(amount);
  }

  const discountValue = Number(code.discount_value);

  if (
    !Number.isFinite(discountValue) ||
    discountValue <= 0
  ) {
    console.error("INVALID DISCOUNT VALUE:", {
      code: code.code,
      discountValue: code.discount_value,
    });

    return noDiscount(amount);
  }

  let discountAmount = discountValue;

  if (code.discount_type === "percentage") {
    discountAmount = amount * (discountValue / 100);
  }

  discountAmount = roundCurrency(
    Math.min(
      Math.max(discountAmount, 0),
      amount
    )
  );

  const finalAmount = roundCurrency(
    amount - discountAmount
  );

  return {
    hasDiscount: discountAmount > 0,
    discountAmount,
    finalAmount,
    discountId: String(code.id),
    discountCode: String(code.code),
  };
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const formData = await request.formData();

    const product = String(
      formData.get("product") || ""
    ).trim();

    const parentName = String(
      formData.get("parent_name") || ""
    ).trim();

    const email = String(
      formData.get("email") || ""
    )
      .trim()
      .toLowerCase();

    const phone = String(
      formData.get("phone") || ""
    ).trim();

    const notes = String(
      formData.get("notes") || ""
    ).trim();

    const discountCode = String(
      formData.get("discount_code") || ""
    ).trim();

    const studentName = String(
      formData.get("student_name") || ""
    ).trim();

    const studentAge = String(
      formData.get("student_age") || ""
    ).trim();

    const schoolYear = String(
      formData.get("school_year") || ""
    ).trim();

    const school = String(
      formData.get("school") || ""
    ).trim();

    const wordCountValue = String(
      formData.get("word_count") || ""
    ).trim();

    const textType = String(
      formData.get("text_type") || ""
    ).trim();

    /*
     * Optionele velden om een dienst rechtstreeks gratis
     * aan te bieden, bijvoorbeeld vanuit je admin.
     *
     * De frontend kan dan meesturen:
     * is_free_order = true
     * payment_method = gratis
     */
    const requestedFreeOrder =
      String(
        formData.get("is_free_order") || ""
      ).toLowerCase() === "true";

    const requestedPaymentMethod = String(
      formData.get("payment_method") || ""
    )
      .trim()
      .toLowerCase();

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
          error:
            "Niet alle verplichte velden zijn ingevuld.",
        },
        { status: 400 }
      );
    }

    let productName = "";
    let amountNumber = 0;

    if (product === "tekstcorrectie") {
      const wordCount = Number(wordCountValue || 0);

      if (
        !Number.isFinite(wordCount) ||
        wordCount < 1
      ) {
        return NextResponse.json(
          {
            error: "Aantal woorden ontbreekt.",
          },
          { status: 400 }
        );
      }

      productName =
        `Tekstcorrectie Studio SaGo - ${wordCount} woorden`;

      amountNumber = Number(
        calculateCorrectionPrice(wordCount)
      );
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
      amountNumber <= 0
    ) {
      console.error("INVALID PRODUCT AMOUNT:", {
        product,
        amountNumber,
      });

      return NextResponse.json(
        {
          error:
            "De prijs van dit product is ongeldig.",
        },
        { status: 400 }
      );
    }

    amountNumber = roundCurrency(amountNumber);

    const discount = await getDiscount({
      supabaseAdmin,
      product,
      parentName,
      email,
      discountCode,
      amount: amountNumber,
    });

    /*
     * Een dienst kan gratis worden door:
     *
     * 1. een kortingscode of waardebon die het volledige
     *    bedrag dekt;
     * 2. is_free_order=true, bijvoorbeeld vanuit je admin.
     */
    const finalAmountNumber = requestedFreeOrder
      ? 0
      : roundCurrency(discount.finalAmount);

    if (
      !Number.isFinite(finalAmountNumber) ||
      finalAmountNumber < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Het berekende eindbedrag is ongeldig.",
        },
        { status: 400 }
      );
    }

    const siteUrlEnv =
      process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrlEnv) {
      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_SITE_URL ontbreekt.",
        },
        { status: 500 }
      );
    }

    const siteUrl = siteUrlEnv.replace(/\/$/, "");
    const checkoutId = crypto.randomUUID();

    /*
     * GRATIS BESTELLING
     *
     * Mollie ondersteunt geen betaling van €0,00.
     * Daarom wordt elke gratis dienst rechtstreeks als
     * betaald en bevestigd verwerkt.
     */
    if (finalAmountNumber === 0) {
      const isVoucherOrder =
        discount.hasDiscount &&
        Boolean(discount.discountId);

      const paymentMethod =
        requestedPaymentMethod ||
        (isVoucherOrder ? "waardebon" : "gratis");

      const freePaymentId = isVoucherOrder
        ? `voucher_${checkoutId}`
        : `free_${checkoutId}`;

      /*
       * Wanneer de dienst handmatig gratis wordt aangeboden,
       * is de volledige productprijs de effectieve korting.
       */
      const effectiveDiscountAmount = isVoucherOrder
        ? discount.discountAmount
        : amountNumber;

      const effectiveDiscountCode = isVoucherOrder
        ? discount.discountCode
        : "";

      const effectiveDiscountId = isVoucherOrder
        ? discount.discountId
        : null;

      const { error: saveFreeOrderError } =
        await supabaseAdmin
          .from("webshop_payments")
          .insert({
            checkout_id: checkoutId,
            payment_id: freePaymentId,
            product,
            email,
            status: "paid",
          });

      if (saveFreeOrderError) {
        console.error(
          "FREE ORDER PAYMENT SAVE ERROR:",
          saveFreeOrderError
        );

        return NextResponse.json(
          {
            error:
              "De gratis bestelling kon niet opgeslagen worden.",
          },
          { status: 500 }
        );
      }

      try {
        await fulfillWebshopOrder({
          supabaseAdmin,
          paymentId: freePaymentId,

          metadata: {
            checkoutId,

            product,
            productName,

            amount: "0.00",
            originalAmount:
              amountNumber.toFixed(2),

            discountId:
              effectiveDiscountId,

            discountCode:
              effectiveDiscountCode,

            discountAmount:
              effectiveDiscountAmount.toFixed(2),

            isFreeOrder: true,
            paymentMethod,

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
        });
      } catch (fulfillError) {
        console.error(
          "FREE ORDER FULFILL ERROR:",
          fulfillError
        );

        await supabaseAdmin
          .from("webshop_payments")
          .update({
            status: "failed",
          })
          .eq("payment_id", freePaymentId);

        return NextResponse.json(
          {
            error:
              fulfillError instanceof Error
                ? fulfillError.message
                : "De gratis bestelling kon niet verwerkt worden.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url:
          `${siteUrl}/betaling/status?checkoutId=${checkoutId}`,

        hasDiscount:
          isVoucherOrder,

        isFreeOrder: true,

        fullyPaidWithVoucher:
          isVoucherOrder,

        paymentMethod,

        discountAmount:
          effectiveDiscountAmount,

        originalAmount:
          amountNumber,

        finalAmount: 0,
      });
    }

    /*
     * Alleen wanneer er nog een positief bedrag moet worden
     * betaald, wordt een Molliebetaling aangemaakt.
     */
    const mollieApiKey =
      process.env.MOLLIE_API_KEY;

    if (!mollieApiKey) {
      return NextResponse.json(
        {
          error: "MOLLIE_API_KEY ontbreekt.",
        },
        { status: 500 }
      );
    }

    const mollieAmount =
      finalAmountNumber.toFixed(2);

    const paymentBody = {
      amount: {
        currency: "EUR",
        value: mollieAmount,
      },

      description: discount.hasDiscount
        ? `${productName} - €${discount.discountAmount.toFixed(
            2
          )} korting`
        : productName,

      method: "bancontact",

      redirectUrl:
        `${siteUrl}/betaling/status?checkoutId=${checkoutId}`,

      webhookUrl:
        `${siteUrl}/api/mollie/webhook`,

      locale: "nl_BE",

      metadata: {
        checkoutId,

        product,
        productName,

        amount: mollieAmount,
        originalAmount:
          amountNumber.toFixed(2),

        discountId:
          discount.discountId,

        discountCode:
          discount.discountCode,

        discountAmount:
          discount.discountAmount.toFixed(2),

        isFreeOrder: false,
        paymentMethod: "mollie",

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

    console.log("MOLLIE PAYMENT AMOUNTS:", {
      product,
      originalAmount:
        amountNumber.toFixed(2),
      discountCode:
        discount.discountCode,
      discountAmount:
        discount.discountAmount.toFixed(2),
      finalAmount:
        mollieAmount,
    });

    const response = await fetch(
      "https://api.mollie.com/v2/payments",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${mollieApiKey}`,

          "Content-Type":
            "application/json",

          "Idempotency-Key":
            checkoutId,
        },

        body:
          JSON.stringify(paymentBody),
      }
    );

    const payment =
      await response.json();

    if (!response.ok) {
      console.error(
        "MOLLIE PAYMENT CREATE ERROR:",
        payment
      );

      return NextResponse.json(
        {
          error:
            payment.detail ||
            "Mollie-betaling kon niet gestart worden.",
        },
        {
          status:
            response.status || 500,
        }
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

    const checkoutUrl =
      payment._links?.checkout?.href;

    if (!checkoutUrl) {
      return NextResponse.json(
        {
          error:
            "Mollie heeft geen geldige betaallink teruggestuurd.",
        },
        { status: 500 }
      );
    }

    const { error: saveError } =
      await supabaseAdmin
        .from("webshop_payments")
        .insert({
          checkout_id:
            checkoutId,

          payment_id:
            payment.id,

          product,
          email,

          status:
            payment.status || "open",
        });

    if (saveError) {
      console.error(
        "SUPABASE PAYMENT SAVE ERROR:",
        saveError
      );

      return NextResponse.json(
        {
          error:
            "De betaling werd aangemaakt, maar kon niet in de database worden opgeslagen.",

          details:
            saveError.message,

          hint:
            saveError.hint,

          code:
            saveError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url:
        checkoutUrl,

      hasDiscount:
        discount.hasDiscount,

      isFreeOrder: false,

      fullyPaidWithVoucher:
        false,

      paymentMethod:
        "mollie",

      discountAmount:
        discount.discountAmount,

      originalAmount:
        amountNumber,

      finalAmount:
        finalAmountNumber,
    });
  } catch (error) {
    console.error(
      "WEBSHOP CHECKOUT ERROR:",
      error
    );

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