import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  fulfillWebshopOrder,
  WebshopOrderMetadata,
} from "@/lib/fulfillWebshopOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const formData = await request.formData();
    const paymentId = String(
      formData.get("id") || ""
    ).trim();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Geen payment id ontvangen." },
        { status: 400 }
      );
    }

    const mollieApiKey = process.env.MOLLIE_API_KEY;

    if (!mollieApiKey) {
      console.error(
        "MOLLIE WEBHOOK: MOLLIE_API_KEY ontbreekt."
      );

      return NextResponse.json(
        { error: "De Mollie-configuratie ontbreekt." },
        { status: 500 }
      );
    }

    const mollieResponse = await fetch(
      `https://api.mollie.com/v2/payments/${encodeURIComponent(
        paymentId
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mollieApiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const payment = await mollieResponse.json();

    if (!mollieResponse.ok) {
      console.error(
        "MOLLIE WEBHOOK PAYMENT ERROR:",
        payment
      );

      return NextResponse.json(
        {
          error:
            payment.detail ||
            "De betaling kon niet bij Mollie opgehaald worden.",
        },
        { status: mollieResponse.status }
      );
    }

    const paymentStatus = String(
      payment.status || "open"
    );

    /*
     * Ook mislukte, verlopen of geannuleerde betalingen
     * in webshop_payments bijwerken.
     */
    const { error: statusUpdateError } =
      await supabaseAdmin
        .from("webshop_payments")
        .update({
          status: paymentStatus,
        })
        .eq("payment_id", payment.id);

    if (statusUpdateError) {
      console.error(
        "MOLLIE WEBHOOK STATUS UPDATE ERROR:",
        statusUpdateError
      );
    }

    /*
     * Alleen een definitief betaalde betaling levert
     * een boeking, contact en eventueel beurtenkaart op.
     */
    if (paymentStatus !== "paid") {
      return NextResponse.json({
        received: true,
        status: paymentStatus,
      });
    }

    const metadata =
      payment.metadata &&
      typeof payment.metadata === "object"
        ? (payment.metadata as WebshopOrderMetadata)
        : {};

    const result = await fulfillWebshopOrder({
      supabaseAdmin,
      paymentId: String(payment.id),
      metadata: {
        ...metadata,
        paymentMethod: "mollie",
      },
    });

    return NextResponse.json({
      received: true,
      status: "paid",
      duplicate: result.duplicate,
    });
  } catch (error) {
    console.error(
      "MOLLIE WEBHOOK SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Er trad een fout op tijdens de verwerking van de webhook.",
      },
      { status: 500 }
    );
  }
}