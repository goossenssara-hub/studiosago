import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const paymentId = String(formData.get("id") || "");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Geen payment id ontvangen." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.mollie.com/v2/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
        },
      }
    );

    const payment = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Betaling niet gevonden." },
        { status: 404 }
      );
    }

    if (payment.status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const metadata = payment.metadata || {};

    const { data: existingBooking } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .ilike("notes", `%Mollie betaling: ${payment.id}%`)
      .maybeSingle();

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
          "Aankoop: 10-beurtenkaart",
          `Leerling: ${metadata.studentName}`,
          `Leeftijd: ${metadata.studentAge}`,
          `Studiejaar: ${metadata.schoolYear}`,
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
      console.error(contactError);
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
        amount: 320,
        notes: [
          "10-beurtenkaart betaald via Bancontact",
          `Leerling: ${metadata.studentName}`,
          `Leeftijd: ${metadata.studentAge}`,
          `Studiejaar: ${metadata.schoolYear}`,
          `Mollie betaling: ${payment.id}`,
        ].join("\n"),
      });

    if (bookingError) {
      console.error(bookingError);
      return NextResponse.json(
        { error: "Boeking kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook fout." }, { status: 500 });
  }
}