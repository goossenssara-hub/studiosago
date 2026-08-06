import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const firstName = String(body.firstName || "").trim().slice(0, 80);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 254);
    const role = String(body.role || "").trim().slice(0, 80) || null;
    const childrenAges = String(body.childrenAges || "").trim().slice(0, 120) || null;
    const privacyConsent = body.privacyConsent === true;
    const updatesConsent = body.updatesConsent === true;
    const website = String(body.website || "").trim();

    // Stil afhandelen van geautomatiseerde spam.
    if (website) {
      return NextResponse.json({ success: true, message: "Je aanmelding werd ontvangen." });
    }

    if (!firstName || !email) {
      return NextResponse.json({ error: "Vul je voornaam en e-mailadres in." }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Vul een geldig e-mailadres in." }, { status: 400 });
    }

    if (!privacyConsent || !updatesConsent) {
      return NextResponse.json(
        { error: "Bevestig beide toestemmingen om je aan te melden." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data: existing, error: lookupError } = await supabase
      .from("learning_platform_pioneers")
      .select("id,email")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("PIONEER LOOKUP ERROR:", lookupError);
      return NextResponse.json(
        { error: "De aanmelding kon niet worden gecontroleerd. Probeer het opnieuw." },
        { status: 500 }
      );
    }

    const payload = {
      first_name: firstName,
      email,
      role,
      children_ages: childrenAges,
      updates_consent: true,
      privacy_consent: true,
      lifetime_access_eligible: true,
      source: "leerplatform-aanmeldpagina",
      updated_at: now,
    };

    const result = existing
      ? await supabase.from("learning_platform_pioneers").update(payload).eq("id", existing.id)
      : await supabase.from("learning_platform_pioneers").insert({ ...payload, created_at: now });

    if (result.error) {
      console.error("PIONEER SAVE ERROR:", result.error);
      return NextResponse.json(
        { error: "Je aanmelding kon niet worden opgeslagen. Probeer het opnieuw." },
        { status: 500 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const mailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Studio SaGo <onboarding@resend.dev>",
          to: email,
          subject: "Je levenslange gratis toegang tot het Studio SaGo-leerplatform",
          text: `Dag ${firstName},\n\nWelkom bij de pioniers van het Studio SaGo-leerplatform.\n\nJe aanmelding is gekoppeld aan ${email}. Via deze vroege inschrijving heb je bij de lancering recht op levenslang gratis toegang tot het leerplatform en alle extra's binnen het platform.\n\nBewaar deze e-mail goed. We houden je via dit adres op de hoogte van de ontwikkeling en lancering.\n\nWarme groet,\nSara\nStudio SaGo`,
        }),
      });

      if (!mailResponse.ok) {
        console.error("PIONEER CONFIRMATION MAIL ERROR:", await mailResponse.text());
      }
    }

    return NextResponse.json({
      success: true,
      message: existing
        ? "Je gegevens zijn bijgewerkt. Je levenslange gratis toegang blijft gereserveerd."
        : "Je aanmelding is gelukt. Je levenslange gratis toegang is gereserveerd.",
    });
  } catch (error) {
    console.error("PIONEER SIGNUP ERROR:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het aanmelden. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
