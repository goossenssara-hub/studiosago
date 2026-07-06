import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const formData = await request.formData();
    const paymentId = String(formData.get("id") || "");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Geen payment id ontvangen." },
        { status: 400 }
      );
    }

    const mollieApiKey = process.env.MOLLIE_API_KEY;

    if (!mollieApiKey) {
      return NextResponse.json(
        { error: "MOLLIE_API_KEY ontbreekt." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.mollie.com/v2/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${mollieApiKey}`,
        },
      }
    );

    const payment = await response.json();

    if (!response.ok) {
      console.error("MOLLIE WEBHOOK PAYMENT ERROR:", payment);

      return NextResponse.json(
        { error: "Betaling niet gevonden." },
        { status: 404 }
      );
    }

    if (payment.status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const metadata = payment.metadata || {};

    const { data: existingBooking, error: existingBookingError } =
      await supabaseAdmin
        .from("bookings")
        .select("id")
        .ilike("notes", `%Mollie betaling: ${payment.id}%`)
        .maybeSingle();

    if (existingBookingError) {
      console.error("WEBHOOK DUPLICATE CHECK ERROR:", existingBookingError);
    }

    if (existingBooking) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const { data: contact, error: contactError } = await supabaseAdmin
      .from("contacts")
      .insert({
        first_name: metadata.parentName || "",
        last_name: "",
        email: metadata.email || "",
        phone: metadata.phone || "",
        notes: [
          `Aankoop: ${metadata.productName}`,
          metadata.studentName ? `Leerling: ${metadata.studentName}` : "",
          metadata.studentAge ? `Leeftijd: ${metadata.studentAge}` : "",
          metadata.schoolYear ? `Studiejaar: ${metadata.schoolYear}` : "",
          metadata.school ? `School: ${metadata.school}` : "",
          metadata.notes ? `Opmerking: ${metadata.notes}` : "",
          `Mollie betaling: ${payment.id}`,
        ]
          .filter(Boolean)
          .join("\n"),
        active: true,
      })
      .select("id")
      .single();

    if (contactError || !contact) {
      console.error("WEBHOOK CONTACT INSERT ERROR:", contactError);

      return NextResponse.json(
        { error: "Contact kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    const { error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        contact_id: contact.id,
        service_id: null,
        availability_id: null,
        status: "confirmed",
        payment_status: "paid",
        amount: Number(metadata.amount || 0),
        notes: [
          `Betaald product: ${metadata.productName}`,
          metadata.studentName ? `Leerling: ${metadata.studentName}` : "",
          metadata.studentAge ? `Leeftijd: ${metadata.studentAge}` : "",
          metadata.schoolYear ? `Studiejaar: ${metadata.schoolYear}` : "",
          `Mollie betaling: ${payment.id}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });

    if (bookingError) {
      console.error("WEBHOOK BOOKING INSERT ERROR:", bookingError);

      return NextResponse.json(
        { error: "Boeking kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    const productName = String(metadata.productName || "").toLowerCase();

    if (productName.includes("10-beurtenkaart")) {
      const level = productName.includes("secundair") ? "secundair" : "lager";

      const { error: passError } = await supabaseAdmin.from("passes").insert({
        contact_id: contact.id,
        customer_email: metadata.email || "",
        title: metadata.productName || "10-beurtenkaart",
        product: metadata.productName || "10-beurtenkaart",
        level,
        total_credits: 10,
        remaining_credits: 10,
        total_sessions: 10,
        remaining_sessions: 10,
        status: "active",
        payment_id: payment.id,
      });

      if (passError) {
        console.error("WEBHOOK PASS INSERT ERROR:", passError);

        return NextResponse.json(
          { error: "Beurtenkaart kon niet opgeslagen worden." },
          { status: 500 }
        );
      }
    }

    await supabaseAdmin
      .from("webshop_payments")
      .update({ status: payment.status })
      .eq("payment_id", payment.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("MOLLIE WEBHOOK SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Webhook fout." },
      { status: 500 }
    );
  }
}