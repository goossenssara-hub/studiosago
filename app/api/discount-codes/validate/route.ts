import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DiscountCodeRow = {
  id: string;
  code: string;
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

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function normalizeCode(value: unknown): string {
  return clean(value).toUpperCase();
}

function toSafeNumber(
  value: unknown,
  fallback = 0
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function roundCurrency(value: number): number {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}

function productMatches(
  configuredProduct: string | null,
  requestedProduct: string
): boolean {
  const configured = clean(
    configuredProduct
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
    configured === "tienbeurtenkaart";

  const isRequestedPass =
    requested.includes("10-beurtenkaart") ||
    requested.includes("tienbeurtenkaart");

  return (
    isGeneralPassCode &&
    isRequestedPass
  );
}

export async function POST(
  request: Request
): Promise<NextResponse> {
  try {
    const body = await request.json();

    const code = normalizeCode(body.code);
    const product = clean(body.product);
    const email = normalizeEmail(body.email);

    const amount = Math.max(
      toSafeNumber(body.amount),
      0
    );

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Vul een kortingscode in.",
        },
        {
          status: 400,
        }
      );
    }

    if (!product) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Het product ontbreekt.",
        },
        {
          status: 400,
        }
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("discount_codes")
      .select(
        `
          id,
          code,
          discount_type,
          discount_value,
          product,
          email,
          customer_name,
          valid_until,
          max_uses,
          used_count,
          active
        `
      )
      .ilike("code", code)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "DISCOUNT VALIDATION DATABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          valid: false,
          error:
            "De kortingscode kon niet gecontroleerd worden.",
        },
        {
          status: 500,
        }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Deze kortingscode bestaat niet.",
        },
        {
          status: 404,
        }
      );
    }

    const discount =
      data as DiscountCodeRow;

    if (!discount.active) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Deze kortingscode is niet meer actief.",
        },
        {
          status: 400,
        }
      );
    }

    if (discount.valid_until) {
      const validUntil = new Date(
        discount.valid_until
      );

      if (
        Number.isFinite(
          validUntil.getTime()
        ) &&
        validUntil.getTime() <
          Date.now()
      ) {
        return NextResponse.json(
          {
            valid: false,
            error:
              "Deze kortingscode is vervallen.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const usedCount = Math.max(
      toSafeNumber(
        discount.used_count
      ),
      0
    );

    if (
      discount.max_uses !== null &&
      usedCount >=
        toSafeNumber(
          discount.max_uses
        )
    ) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Deze kortingscode werd al maximaal gebruikt.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !productMatches(
        discount.product,
        product
      )
    ) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Deze kortingscode is niet geldig voor dit product.",
        },
        {
          status: 400,
        }
      );
    }

    const requiredEmail =
      normalizeEmail(discount.email);

    if (
      requiredEmail &&
      requiredEmail !== email
    ) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Deze kortingscode is gekoppeld aan een ander e-mailadres.",
        },
        {
          status: 400,
        }
      );
    }

    const discountValue = Math.max(
      toSafeNumber(
        discount.discount_value
      ),
      0
    );

    let discountAmount = 0;

    if (
      discount.discount_type ===
      "percentage"
    ) {
      const percentage = Math.min(
        discountValue,
        100
      );

      discountAmount =
        amount *
        (percentage / 100);
    } else {
      discountAmount =
        discountValue;
    }

    discountAmount = Math.min(
      roundCurrency(discountAmount),
      amount
    );

    const finalAmount =
      roundCurrency(
        Math.max(
          amount - discountAmount,
          0
        )
      );

    return NextResponse.json(
      {
        valid: true,

        discountId:
          String(discount.id),

        discountCode:
          normalizeCode(
            discount.code
          ),

        discountAmount,
        finalAmount,

        message:
          finalAmount === 0
            ? "Je waardebon dekt het volledige bedrag."
            : `Kortingscode toegepast. Je krijgt €${discountAmount
                .toFixed(2)
                .replace(
                  ".",
                  ","
                )} korting.`,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DISCOUNT VALIDATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        valid: false,
        error:
          "Er ging iets mis bij het controleren van de kortingscode.",
      },
      {
        status: 500,
      }
    );
  }
}