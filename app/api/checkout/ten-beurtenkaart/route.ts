import { NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  fulfillWebshopOrder,
  type WebshopOrderMetadata,
  type WebshopPaymentMethod,
} from "@/lib/fulfillWebshopOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutRequestBody = {
  product?: string;
  productName?: string;

  parentName?: string;
  studentName?: string;
  email?: string;
  phone?: string;

  studentAge?: string;
  schoolYear?: string;
  school?: string;
  notes?: string;

  discountCode?: string;

  amount?: string | number;
  originalAmount?: string | number;

  metadata?: Partial<WebshopOrderMetadata>;
};

type TenSessionProduct = {
  key: string;
  name: string;
  price: number;
  level: "lager" | "secundair";
};

type DiscountCodeRow = {
  id: string;
  code: string;
  description: string | null;

  discount_type: "fixed" | "percentage";
  discount_value: number;

  product: string | null;
  email: string | null;
  customer_name: string | null;

  valid_until: string | null;
  max_uses: number | null;
  used_count: number | null;

  active: boolean;
};

type DiscountResult = {
  discountId: string | null;
  discountCode: string;
  discountAmount: number;
};

const TEN_SESSION_PRODUCTS: Record<
  string,
  TenSessionProduct
> = {
  "10-beurtenkaart-lager": {
    key: "10-beurtenkaart-lager",
    name: "10-beurtenkaart Lager onderwijs",
    price: 320,
    level: "lager",
  },

  "10-beurtenkaart-secundair": {
    key: "10-beurtenkaart-secundair",
    name: "10-beurtenkaart Secundair onderwijs",
    price: 380,
    level: "secundair",
  },
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function normalizeCode(value: unknown): string {
  return clean(value).toUpperCase();
}

function normalizeName(value: unknown): string {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function moneyValue(value: number): string {
  return roundCurrency(value).toFixed(2);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getBaseUrl(request: Request): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    const normalizedUrl = configuredUrl.startsWith("http")
      ? configuredUrl
      : `https://${configuredUrl}`;

    return normalizedUrl.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}

function calculateDiscountAmount({
  originalAmount,
  discountType,
  discountValue,
}: {
  originalAmount: number;
  discountType: "fixed" | "percentage";
  discountValue: number;
}): number {
  if (discountType === "percentage") {
    const percentage = Math.min(
      Math.max(discountValue, 0),
      100
    );

    return roundCurrency(
      originalAmount * (percentage / 100)
    );
  }

  return roundCurrency(
    Math.max(discountValue, 0)
  );
}

function discountMatchesProduct({
  discountProduct,
  requestedProduct,
}: {
  discountProduct: string | null;
  requestedProduct: string;
}): boolean {
  const configured = clean(
    discountProduct
  ).toLowerCase();

  const requested = clean(
    requestedProduct
  ).toLowerCase();

  if (
    !configured ||
    configured === "all" ||
    configured === "alle" ||
    configured === "alles" ||
    configured === "*"
  ) {
    return true;
  }

  if (configured === requested) {
    return true;
  }

  const isGeneralPassCode =
    configured === "10-beurtenkaart" ||
    configured === "tienbeurtenkaart" ||
    configured === "ten-beurtenkaart";

  const isRequestedPass =
    requested.includes("10-beurtenkaart") ||
    requested.includes("tienbeurtenkaart") ||
    requested.includes("ten-beurtenkaart");

  return isGeneralPassCode && isRequestedPass;
}

async function findAndValidateDiscount({
  supabaseAdmin,
  code,
  product,
  email,
  parentName,
  studentName,
  originalAmount,
}: {
  supabaseAdmin: any;
  code: string;
  product: TenSessionProduct;
  email: string;
  parentName: string;
  studentName: string;
  originalAmount: number;
}): Promise<DiscountResult> {
  if (!code) {
    return {
      discountId: null,
      discountCode: "",
      discountAmount: 0,
    };
  }

  const {
    data: discount,
    error: discountError,
  } = await supabaseAdmin
    .from("discount_codes")
    .select(
      [
        "id",
        "code",
        "description",
        "discount_type",
        "discount_value",
        "product",
        "email",
        "customer_name",
        "valid_until",
        "max_uses",
        "used_count",
        "active",
      ].join(", ")
    )
    .ilike("code", code)
    .limit(1)
    .maybeSingle();

  if (discountError) {
    console.error(
      "TEN SESSION DISCOUNT LOOKUP ERROR:",
      discountError
    );

    throw new Error(
      "De kortingscode kon niet gecontroleerd worden."
    );
  }

  if (!discount) {
    throw new Error(
      "Deze kortingscode bestaat niet."
    );
  }

  const row = discount as DiscountCodeRow;

  if (!row.active) {
    throw new Error(
      "Deze kortingscode is niet meer actief."
    );
  }

  if (row.valid_until) {
    const validUntil = new Date(
      row.valid_until
    );

    if (
      Number.isFinite(validUntil.getTime()) &&
      validUntil.getTime() < Date.now()
    ) {
      throw new Error(
        "Deze kortingscode is vervallen."
      );
    }
  }

  const usedCount = Math.max(
    Number(row.used_count || 0),
    0
  );

  if (
    row.max_uses !== null &&
    usedCount >= Number(row.max_uses)
  ) {
    throw new Error(
      "Deze kortingscode werd al maximaal gebruikt."
    );
  }

  if (
    !discountMatchesProduct({
      discountProduct: row.product,
      requestedProduct: product.key,
    })
  ) {
    throw new Error(
      "Deze kortingscode is niet geldig voor deze tienbeurtenkaart."
    );
  }

  const requiredEmail = normalizeEmail(
    row.email
  );

  if (
    requiredEmail &&
    requiredEmail !== email
  ) {
    throw new Error(
      "Deze kortingscode is gekoppeld aan een ander e-mailadres."
    );
  }

  const requiredCustomerName =
    normalizeName(row.customer_name);

  const normalizedParentName =
    normalizeName(parentName);

  const normalizedStudentName =
    normalizeName(studentName);

  const customerNameMatches =
    !requiredCustomerName ||
    requiredCustomerName ===
      normalizedParentName ||
    requiredCustomerName ===
      normalizedStudentName;

  if (!customerNameMatches) {
    throw new Error(
      "Deze kortingscode is gekoppeld aan een andere klant."
    );
  }

  const discountValue = Number(
    row.discount_value
  );

  if (
    !Number.isFinite(discountValue) ||
    discountValue <= 0
  ) {
    throw new Error(
      "De kortingscode bevat geen geldige korting."
    );
  }

  const calculatedDiscount =
    calculateDiscountAmount({
      originalAmount,
      discountType: row.discount_type,
      discountValue,
    });

  const discountAmount = Math.min(
    calculatedDiscount,
    originalAmount
  );

  return {
    discountId: String(row.id),
    discountCode: normalizeCode(row.code),
    discountAmount: roundCurrency(
      discountAmount
    ),
  };
}

/*
 * webshop_payments vereist minstens:
 *
 * payment_id, checkout_id, product, email en status.
 *
 * created_at wordt automatisch door Supabase ingevuld.
 */
async function saveWebshopPayment({
  supabaseAdmin,
  paymentId,
  checkoutId,
  product,
  email,
  status,
}: {
  supabaseAdmin: any;
  paymentId: string;
  checkoutId: string;
  product: string;
  email: string;
  status: string;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from("webshop_payments")
    .insert({
      payment_id: paymentId,
      checkout_id: checkoutId,
      product,
      email,
      status,
    });

  if (error) {
    console.error(
      "WEBSHOP PAYMENT INSERT ERROR:",
      error
    );

    throw new Error(
      error.message ||
        "De bestelling kon niet opgeslagen worden."
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse> {
  try {
    const body =
      (await request.json()) as CheckoutRequestBody;

    const productKey = clean(body.product);
    const product =
      TEN_SESSION_PRODUCTS[productKey];

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Deze tienbeurtenkaart bestaat niet.",
        },
        { status: 400 }
      );
    }

    const parentName = clean(
      body.parentName ||
        body.metadata?.parentName
    );

    const studentName = clean(
      body.studentName ||
        body.metadata?.studentName
    );

    const email = normalizeEmail(
      body.email ||
        body.metadata?.email
    );

    const phone = clean(
      body.phone ||
        body.metadata?.phone
    );

    const studentAge = clean(
      body.studentAge ||
        body.metadata?.studentAge
    );

    const schoolYear = clean(
      body.schoolYear ||
        body.metadata?.schoolYear
    );

    const school = clean(
      body.school ||
        body.metadata?.school
    );

    const notes = clean(
      body.notes ||
        body.metadata?.notes
    );

    const requestedDiscountCode =
      normalizeCode(
        body.discountCode ||
          body.metadata?.discountCode
      );

    if (!parentName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Vul de naam van de ouder of klant in.",
        },
        { status: 400 }
      );
    }

    if (!studentName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Vul de naam van de leerling in.",
        },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Vul een geldig e-mailadres in.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    const originalAmount =
      roundCurrency(product.price);

    let discountResult: DiscountResult;

    try {
      discountResult =
        await findAndValidateDiscount({
          supabaseAdmin,
          code: requestedDiscountCode,
          product,
          email,
          parentName,
          studentName,
          originalAmount,
        });
    } catch (discountError) {
      return NextResponse.json(
        {
          success: false,
          error:
            discountError instanceof Error
              ? discountError.message
              : "De kortingscode is niet geldig.",
        },
        { status: 400 }
      );
    }

    const finalAmount = roundCurrency(
      Math.max(
        originalAmount -
          discountResult.discountAmount,
        0
      )
    );

    const isFreeOrder =
      finalAmount === 0;

    const paymentMethod: WebshopPaymentMethod =
      isFreeOrder
        ? discountResult.discountId
          ? "waardebon"
          : "gratis"
        : "mollie";

    const baseUrl = getBaseUrl(request);
    const checkoutId = crypto.randomUUID();

    const metadata: WebshopOrderMetadata = {
      checkoutId,

      product: product.key,
      productName: product.name,

      amount: moneyValue(finalAmount),
      originalAmount:
        moneyValue(originalAmount),

      discountId:
        discountResult.discountId,

      discountCode:
        discountResult.discountCode,

      discountAmount: moneyValue(
        discountResult.discountAmount
      ),

      parentName,
      studentName,
      email,
      phone,

      studentAge,
      schoolYear,
      school,

      notes,

      paymentMethod,
      isFreeOrder,
    };

    if (isFreeOrder) {
      const freePaymentId = `${
        paymentMethod === "waardebon"
          ? "voucher"
          : "free"
      }_${checkoutId}`;

      /*
       * Eerst registreren we de bestelling als pending.
       * fulfillWebshopOrder verwerkt daarna de boeking,
       * eventuele beurtenkaart en zet de betaling op paid.
       */
      await saveWebshopPayment({
        supabaseAdmin,
        paymentId: freePaymentId,
        checkoutId,
        product: product.key,
        email,
        status: "pending",
      });

      const fulfillment =
        await fulfillWebshopOrder({
          supabaseAdmin,
          paymentId: freePaymentId,
          metadata,
        });

      return NextResponse.json(
        {
          success: true,
          isFreeOrder: true,

          paymentId: freePaymentId,
          checkoutId,

          bookingId:
            fulfillment.bookingId,

          passCreated:
            fulfillment.passCreated,

          redirectUrl: `${baseUrl}/betaling/gelukt?paymentId=${encodeURIComponent(
            freePaymentId
          )}`,

          message:
            "Je bestelling werd correct geregistreerd. Er is geen online betaling nodig.",
        },
        { status: 200 }
      );
    }

    const mollieApiKey = clean(
      process.env.MOLLIE_API_KEY
    );

    if (!mollieApiKey) {
      console.error(
        "MOLLIE_API_KEY ontbreekt."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "De betaalomgeving is momenteel niet correct ingesteld.",
        },
        { status: 500 }
      );
    }

    const mollieClient =
      createMollieClient({
        apiKey: mollieApiKey,
      });

    const payment =
      await mollieClient.payments.create({
        amount: {
          currency: "EUR",
          value: moneyValue(finalAmount),
        },

        description: product.name,

        redirectUrl: `${baseUrl}/betaling/gelukt?checkoutId=${encodeURIComponent(
          checkoutId
        )}`,

        webhookUrl: `${baseUrl}/api/mollie/webhook`,

        metadata,
      });

    const checkoutUrl =
      payment._links.checkout?.href;

    if (!checkoutUrl) {
      console.error(
        "Mollie payment heeft geen checkout-URL:",
        payment.id
      );

      throw new Error(
        "Mollie heeft geen betaalpagina teruggegeven."
      );
    }

    await saveWebshopPayment({
      supabaseAdmin,
      paymentId: payment.id,
      checkoutId,
      product: product.key,
      email,
      status: payment.status,
    });

    return NextResponse.json(
      {
        success: true,
        isFreeOrder: false,

        paymentId: payment.id,
        checkoutId,

        checkoutUrl,
        redirectUrl: checkoutUrl,

        amount: moneyValue(finalAmount),
        originalAmount:
          moneyValue(originalAmount),

        discountAmount: moneyValue(
          discountResult.discountAmount
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "TEN SESSION CHECKOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Er ging iets mis bij het aanmaken van de bestelling.",
      },
      { status: 500 }
    );
  }
}
