import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getBuiltInService,
  normalizeService,
  type DynamicService,
} from "@/lib/webshopService";
import {
  calculateTextCorrectionPrice,
  verifyTextCorrectionToken,
} from "@/lib/textCorrection";
import { applyAuthorDiscount } from "@/lib/authorDiscount";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (value: unknown) => String(value ?? "").trim();

function normalize(value: unknown): string {
  return clean(value)
    .toLocaleLowerCase("nl-BE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isTextCorrectionService(service: DynamicService): boolean {
  const haystack = normalize(
    [
      service.slug,
      service.title,
      service.category,
      service.product_type,
      service.href,
    ].join(" ")
  );

  return (
    normalize(service.slug) === "tekstcorrectie" ||
    normalize(service.product_type) === "text" ||
    haystack.includes("tekstcorrectie") ||
    haystack.includes("teksten nalezen") ||
    haystack.includes("correctie van teksten")
  );
}

async function loadService(
  db: ReturnType<typeof getSupabaseAdmin>,
  serviceId: string,
  slug: string
): Promise<DynamicService | null> {
  if (serviceId && !serviceId.startsWith("builtin:")) {
    const { data } = await db
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .eq("is_visible", true)
      .maybeSingle();

    if (data) return normalizeService(data as Record<string, unknown>);
  }

  if (slug) {
    const { data } = await db
      .from("services")
      .select("*")
      .or(`slug.eq.${slug},href.eq./webshop/${slug}`)
      .eq("is_visible", true)
      .limit(1)
      .maybeSingle();

    if (data) return normalizeService(data as Record<string, unknown>);
  }

  return getBuiltInService(slug);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getSupabaseAdmin();
    const service = await loadService(
      db,
      clean(body.serviceId),
      clean(body.slug)
    );

    if (!service) {
      return NextResponse.json(
        { error: "Product niet gevonden." },
        { status: 404 }
      );
    }

    const isTextCorrection = isTextCorrectionService(service);
    const participants = Array.isArray(body.participants)
      ? body.participants
      : [];
    const bookingType = body.bookingType === "group" ? "group" : "individual";
    const deliveryType = body.deliveryType === "home" ? "home" : "digital";
    const count = bookingType === "group" ? participants.length : 1;

    let total = 0;
    let textAnalysis:
      | ReturnType<typeof verifyTextCorrectionToken>
      | null = null;

    if (isTextCorrection) {
      textAnalysis = verifyTextCorrectionToken(
        clean(body.textAnalysisToken)
      );
      total = calculateTextCorrectionPrice(textAnalysis.wordCount);
      const authorCode = clean(body.authorDiscountCode || body.discountCode);
      total = applyAuthorDiscount(total, textAnalysis.wordCount, authorCode).amount;
    } else {
      if (
        count < service.min_participants ||
        count > service.max_participants
      ) {
        return NextResponse.json(
          { error: "Ongeldig aantal deelnemers." },
          { status: 400 }
        );
      }

      if (deliveryType === "home" && !service.allows_home) {
        return NextResponse.json(
          { error: "Begeleiding aan huis is niet beschikbaar." },
          { status: 400 }
        );
      }

      if (deliveryType === "home" && !clean(body.customerAddress)) {
        return NextResponse.json(
          { error: "Adres ontbreekt." },
          { status: 400 }
        );
      }

      const unit =
        bookingType === "group"
          ? service.price_per_participant ?? service.price
          : service.price;
      total = Math.round(unit * count * 100) / 100;
    }

    const checkoutId = randomUUID();
    const appointment =
      !isTextCorrection &&
      (service.product_type === "appointment" || service.allows_group);
    let appointmentOrderId = "";
    let textCorrectionOrderId = "";

    if (isTextCorrection && textAnalysis) {
      const insertedTextOrder = await db
        .from("webshop_text_correction_orders")
        .insert({
          checkout_id: checkoutId,
          service_id: service.id.startsWith("builtin:") ? null : service.id,
          service_slug: service.slug,
          customer_first_name: clean(body.purchaserFirstName),
          customer_last_name: clean(body.purchaserLastName),
          customer_email: clean(body.purchaserEmail).toLowerCase(),
          customer_phone: clean(body.purchaserPhone) || null,
          original_file_name: textAnalysis.originalFileName,
          storage_path: textAnalysis.storagePath,
          mime_type: textAnalysis.mimeType,
          word_count: textAnalysis.wordCount,
          total_amount: total,
          text_type: clean(body.textType) || null,
          notes: clean(body.notes) || null,
          payment_status: "open",
        })
        .select("id")
        .single();

      if (insertedTextOrder.error) throw insertedTextOrder.error;
      textCorrectionOrderId = String(insertedTextOrder.data.id);
    }

    if (appointment) {
      const unit =
        bookingType === "group"
          ? service.price_per_participant ?? service.price
          : service.price;

      const insertedOrder = await db
        .from("appointment_orders")
        .insert({
          checkout_id: checkoutId,
          booking_type: bookingType,
          education_level: service.education_level,
          appointment_type: service.title,
          duration_minutes: 60,
          participant_count: count,
          price_per_participant: unit,
          total_amount: total,
          delivery_type: deliveryType,
          purchaser_first_name: clean(body.purchaserFirstName),
          purchaser_last_name: clean(body.purchaserLastName),
          purchaser_email: clean(body.purchaserEmail).toLowerCase(),
          purchaser_phone: clean(body.purchaserPhone),
          purchaser_address:
            deliveryType === "home" ? clean(body.customerAddress) : null,
          customer_address:
            deliveryType === "home" ? clean(body.customerAddress) : null,
          payment_status: "open",
          booking_status: "awaiting_payment",
          service_id: service.id.startsWith("builtin:") ? null : service.id,
          service_slug: service.slug,
        })
        .select("id")
        .single();

      if (insertedOrder.error) throw insertedOrder.error;
      appointmentOrderId = String(insertedOrder.data.id);

      if (participants.length) {
        const rows = participants.map((participant: Record<string, unknown>) => ({
          order_id: appointmentOrderId,
          first_names: clean(participant.firstNames),
          last_names: clean(participant.lastNames),
          birth_date: clean(participant.birthDate) || null,
          education_level: service.education_level,
          grade: clean(participant.grade),
          study_program: clean(participant.studyProgram) || null,
          school: clean(participant.school) || null,
          learning_goal: clean(participant.learningGoal) || null,
          parent_first_name: clean(participant.parentFirstName),
          parent_last_name: clean(participant.parentLastName),
          parent_email: clean(participant.parentEmail).toLowerCase(),
          parent_phone: clean(participant.parentPhone),
        }));

        const participantInsert = await db
          .from("appointment_order_participants")
          .insert(rows);

        if (participantInsert.error) throw participantInsert.error;
      }
    }

    const mollieApiKey = clean(process.env.MOLLIE_API_KEY);
    const requestOrigin = new URL(request.url).origin;
    const configuredSiteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL);
    const baseUrl =
      requestOrigin.includes("localhost") || requestOrigin.includes("127.0.0.1")
        ? requestOrigin
        : configuredSiteUrl || requestOrigin;

    if (!mollieApiKey) {
      throw new Error("MOLLIE_API_KEY ontbreekt.");
    }

    const metadata = appointment
      ? {
          orderType: "appointment",
          appointmentOrderId,
          checkoutId,
          bookingType,
          educationLevel: service.education_level,
          deliveryType,
          participantCount: count,
          purchaserEmail: clean(body.purchaserEmail),
          serviceSlug: service.slug,
        }
      : {
          orderType: "webshop",
          checkoutId,
          product: service.slug,
          productName: service.title,
          amount: total.toFixed(2),
          originalAmount: total.toFixed(2),
          parentName: `${clean(body.purchaserFirstName)} ${clean(
            body.purchaserLastName
          )}`.trim(),
          email: clean(body.purchaserEmail).toLowerCase(),
          phone: clean(body.purchaserPhone),
          wordCount: textAnalysis?.wordCount
            ? String(textAnalysis.wordCount)
            : "",
          textType: isTextCorrection ? clean(body.textType) : "",
          notes: clean(body.notes),
          uploadedFileName: textAnalysis?.originalFileName ?? "",
          uploadedFilePath: textAnalysis?.storagePath ?? "",
          uploadedFileMimeType: textAnalysis?.mimeType ?? "",
          textCorrectionOrderId,
          paymentMethod: "mollie",
          isFreeOrder: false,
        };

    const configuredWebhookUrl = clean(
      process.env.MOLLIE_WEBHOOK_URL
    );

    const hasPublicWebhookUrl = (() => {
      if (!configuredWebhookUrl) return false;

      try {
        const url = new URL(configuredWebhookUrl);
        const hostname = url.hostname.toLowerCase();

        return (
          url.protocol === "https:" &&
          hostname !== "localhost" &&
          hostname !== "127.0.0.1" &&
          hostname !== "0.0.0.0" &&
          !hostname.endsWith(".local")
        );
      } catch {
        return false;
      }
    })();

    const molliePaymentBody = {
      amount: {
        currency: "EUR",
        value: total.toFixed(2),
      },
      description: service.title,
      redirectUrl: `${baseUrl}/betaling/status?checkoutId=${encodeURIComponent(
        checkoutId
      )}`,
      metadata,
      ...(hasPublicWebhookUrl
        ? { webhookUrl: configuredWebhookUrl }
        : {}),
    };

    const mollieResponse = await fetch(
      "https://api.mollie.com/v2/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mollieApiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Idempotency-Key": checkoutId,
        },
        body: JSON.stringify(molliePaymentBody),
        cache: "no-store",
      }
    );

    const molliePayment = await mollieResponse.json();

    if (!mollieResponse.ok) {
      throw new Error(
        molliePayment.detail || "Mollie-betaling kon niet worden aangemaakt."
      );
    }

    if (!molliePayment.id) {
      throw new Error("Mollie gaf geen betalingsnummer terug.");
    }

    const checkoutUrl = molliePayment._links?.checkout?.href;

    if (!checkoutUrl) {
      throw new Error("Mollie gaf geen betaallink terug.");
    }

    if (appointment) {
      await db
        .from("appointment_orders")
        .update({ mollie_payment_id: molliePayment.id })
        .eq("id", appointmentOrderId);
    } else {
      const { error: paymentInsertError } = await db
        .from("webshop_payments")
        .insert({
          checkout_id: checkoutId,
          payment_id: molliePayment.id,
          product: service.slug || clean(body.slug) || "webshop",
          email: clean(body.purchaserEmail).toLowerCase(),
          status: molliePayment.status ?? "open",
          metadata,
        });

      if (paymentInsertError) throw paymentInsertError;

      if (textCorrectionOrderId) {
        const { error: textOrderUpdateError } = await db
          .from("webshop_text_correction_orders")
          .update({
            mollie_payment_id: molliePayment.id,
            payment_status: molliePayment.status ?? "open",
            updated_at: new Date().toISOString(),
          })
          .eq("id", textCorrectionOrderId);

        if (textOrderUpdateError) throw textOrderUpdateError;
      }
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
      checkoutId,
    });
  } catch (error) {
    console.error("DYNAMIC WEBSHOP CHECKOUT ERROR:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Checkout mislukt.",
      },
      { status: 500 }
    );
  }
}