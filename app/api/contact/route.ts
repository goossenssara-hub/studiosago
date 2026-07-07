import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const question = String(formData.get("question") || "").trim();

    const privacyConsent = formData.get("privacyConsent");
    const termsConsent = formData.get("termsConsent");

    if (!name || !email || !phone || !question) {
      return NextResponse.json(
        { error: "Vul alle verplichte velden in." },
        { status: 400 }
      );
    }

    if (!privacyConsent || !termsConsent) {
      return NextResponse.json(
        {
          error:
            "Je moet akkoord gaan met de Privacyverklaring en Algemene Voorwaarden.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .insert({
        customer_name: name,
        customer_email: email,
        phone,
        notes: question,
        service: "Contactaanvraag",
        status: "pending",
        credit_deducted: false,
      });

    if (appointmentError) {
      console.error("CONTACT SAVE ERROR:", appointmentError);

      return NextResponse.json(
        { error: "Aanvraag kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Studio SaGo <onboarding@resend.dev>",
          to: "creativestudiosago@gmail.com",
          subject: `Nieuwe contactvraag van ${name}`,
          reply_to: email,
          text: `
Nieuwe vraag via Studio SaGo

Naam: ${name}
E-mail: ${email}
Telefoon: ${phone}

Vraag:
${question}

Toestemmingen:
- Privacyverklaring gelezen: ja
- Akkoord met Algemene Voorwaarden: ja
          `.trim(),
        }),
      });

      if (!response.ok) {
        const mailError = await response.json();
        console.error("MAIL ERROR:", mailError);
      }
    } else {
      console.warn("RESEND_API_KEY ontbreekt. Aanvraag is wel opgeslagen.");
    }

    return NextResponse.json({
      success: true,
      message: "Je aanvraag werd succesvol ontvangen.",
    });
  } catch (error) {
    console.error("CONTACT SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Er ging iets mis bij het verzenden." },
      { status: 500 }
    );
  }
}