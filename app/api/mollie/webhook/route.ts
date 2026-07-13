import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

import {
  fulfillWebshopOrder,
  WebshopOrderMetadata,
} from "@/lib/fulfillWebshopOrder";

import {
  fulfillAppointmentOrder,
} from "@/lib/fulfillAppointmentOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MollieMetadata = WebshopOrderMetadata & {
  orderType?: string;
  appointmentOrderId?: string;
  checkoutId?: string;
  bookingType?: string;
  educationLevel?: string;
  deliveryType?: string;
  participantCount?: number | string;
  purchaserEmail?: string;
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

export async function POST(
  request: Request
): Promise<NextResponse> {
  try {
    const supabaseAdmin =
      getSupabaseAdmin();

    const formData =
      await request.formData();

    const paymentId =
      clean(
        formData.get("id")
      );

    if (!paymentId) {
      return NextResponse.json(
        {
          error:
            "Geen payment id ontvangen.",
        },
        {
          status: 400,
        }
      );
    }

    const mollieApiKey =
      clean(
        process.env
          .MOLLIE_API_KEY
      );

    if (!mollieApiKey) {
      console.error(
        "MOLLIE WEBHOOK: MOLLIE_API_KEY ontbreekt."
      );

      return NextResponse.json(
        {
          error:
            "De Mollie-configuratie ontbreekt.",
        },
        {
          status: 500,
        }
      );
    }

    const mollieResponse =
      await fetch(
        `https://api.mollie.com/v2/payments/${encodeURIComponent(
          paymentId
        )}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${mollieApiKey}`,
            Accept:
              "application/json",
          },
          cache: "no-store",
        }
      );

    const payment =
      await mollieResponse.json();

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
        {
          status:
            mollieResponse.status,
        }
      );
    }

    const paymentStatus =
      clean(
        payment.status ||
        "open"
      );

    const metadata: MollieMetadata =
      payment.metadata &&
      typeof payment.metadata ===
        "object"
        ? (
            payment.metadata as MollieMetadata
          )
        : {};

    const orderType =
      clean(
        metadata.orderType
      );

    const isAppointmentOrder =
      orderType ===
        "appointment" ||
      Boolean(
        clean(
          metadata
            .appointmentOrderId
        )
      );

    /*
     * Afspraakbestellingen worden bijgewerkt
     * in appointment_orders.
     */
    if (isAppointmentOrder) {
      const appointmentOrderId =
        clean(
          metadata
            .appointmentOrderId
        );

      const checkoutId =
        clean(
          metadata.checkoutId
        );

      let updateQuery =
        supabaseAdmin
          .from(
            "appointment_orders"
          )
          .update({
            mollie_payment_id:
              payment.id,
            payment_status:
              paymentStatus,
            updated_at:
              new Date()
                .toISOString(),
          });

      if (
        appointmentOrderId
      ) {
        updateQuery =
          updateQuery.eq(
            "id",
            appointmentOrderId
          );
      } else if (
        checkoutId
      ) {
        updateQuery =
          updateQuery.eq(
            "checkout_id",
            checkoutId
          );
      } else {
        updateQuery =
          updateQuery.eq(
            "mollie_payment_id",
            payment.id
          );
      }

      const {
        error:
          appointmentStatusError,
      } =
        await updateQuery;

      if (
        appointmentStatusError
      ) {
        console.error(
          "APPOINTMENT PAYMENT STATUS UPDATE ERROR:",
          appointmentStatusError
        );
      }
    } else {
      /*
       * Bestaande webshopbetalingen blijven
       * in webshop_payments bijgewerkt worden.
       */
      const {
        error:
          webshopStatusError,
      } =
        await supabaseAdmin
          .from(
            "webshop_payments"
          )
          .update({
            status:
              paymentStatus,
          })
          .eq(
            "payment_id",
            payment.id
          );

      if (
        webshopStatusError
      ) {
        console.error(
          "MOLLIE WEBHOOK WEBSHOP STATUS UPDATE ERROR:",
          webshopStatusError
        );
      }
    }

    /*
     * Alleen betaalde betalingen worden vervuld.
     */
    if (
      paymentStatus !==
      "paid"
    ) {
      return NextResponse.json({
        received: true,
        status:
          paymentStatus,
        orderType:
          isAppointmentOrder
            ? "appointment"
            : "webshop",
      });
    }

    /*
     * Nieuwe flow voor losse en groepsbegeleiding.
     */
    if (
      isAppointmentOrder
    ) {
      try {
        const result =
          await fulfillAppointmentOrder({
            supabaseAdmin,
            paymentId:
              clean(
                payment.id
              ),
            metadata,
          });

        return NextResponse.json({
          received: true,
          status: "paid",
          orderType:
            "appointment",
          duplicate:
            result.duplicate,
          orderId:
            result.orderId,
          purchaserProfileId:
            result.purchaserProfileId,
          introductionAvailable:
            result.introductionAvailable,
        });
      } catch (fulfillmentError) {
        console.error(
          "APPOINTMENT FULFILLMENT ERROR:",
          fulfillmentError
        );

        const appointmentOrderId =
          clean(
            metadata
              .appointmentOrderId
          );

        if (
          appointmentOrderId
        ) {
          await supabaseAdmin
            .from(
              "appointment_orders"
            )
            .update({
              payment_status:
                "paid",
              booking_status:
                "fulfillment_error",
              fulfillment_error:
                fulfillmentError instanceof
                Error
                  ? fulfillmentError.message
                  : "Onbekende fout bij verwerking.",
              updated_at:
                new Date()
                  .toISOString(),
            })
            .eq(
              "id",
              appointmentOrderId
            );
        }

        /*
         * Mollie mag opnieuw proberen wanneer de
         * verwerking tijdelijk mislukt.
         */
        return NextResponse.json(
          {
            error:
              fulfillmentError instanceof
              Error
                ? fulfillmentError.message
                : "De afspraakbestelling kon niet verwerkt worden.",
          },
          {
            status: 500,
          }
        );
      }
    }

    /*
     * Bestaande webshop- en beurtenkaartflow.
     */
    const webshopResult =
      await fulfillWebshopOrder({
        supabaseAdmin,
        paymentId:
          clean(
            payment.id
          ),
        metadata: {
          ...metadata,
          paymentMethod:
            "mollie",
        },
      });

    return NextResponse.json({
      received: true,
      status: "paid",
      orderType:
        "webshop",
      duplicate:
        webshopResult.duplicate,
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
      {
        status: 500,
      }
    );
  }
}