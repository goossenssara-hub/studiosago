import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const question = String(formData.get("question") || "").trim();
    const privacyConsent = formData.get("privacyConsent");

    if (!name || !email || !phone || !question || !privacyConsent) {
      return NextResponse.json(
        { error: "Vul alle velden in en geef toestemming." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY ontbreekt." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Studio SaGo <onboarding@resend.dev>",
        to: "goossens.saraa@gmail.com",
        subject: `Nieuwe contactvraag van ${name}`,
        reply_to: email,
        text: `
Nieuwe vraag via Studio SaGo

Naam: ${name}
E-mail: ${email}
Telefoon: ${phone}

Vraag:
${question}

Toestemming gegevensbewaring: ja
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("MAIL ERROR:", error);

      return NextResponse.json(
        { error: "E-mail kon niet verzonden worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Er ging iets mis bij het verzenden." },
      { status: 500 }
    );
  }
}