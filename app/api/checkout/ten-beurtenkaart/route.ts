import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const studentName = String(formData.get("student_name") || "");
    const studentAge = String(formData.get("student_age") || "");
    const schoolYear = String(formData.get("school_year") || "");
    const parentName = String(formData.get("parent_name") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const notes = String(formData.get("notes") || "");

    if (!studentName || !studentAge || !schoolYear || !parentName || !email) {
      return NextResponse.json(
        { error: "Niet alle verplichte velden zijn ingevuld." },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const response = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: "320.00",
        },
        description: "10-beurtenkaart Studio SaGo",
        method: "bancontact",
        redirectUrl: `${siteUrl}/bedankt?product=10-beurtenkaart`,
        webhookUrl: `${siteUrl}/api/mollie/webhook`,
        locale: "nl_BE",
        metadata: {
          product: "10-beurtenkaart",
          amount: "320",
          studentName,
          studentAge,
          schoolYear,
          parentName,
          email,
          phone,
          notes,
        },
      }),
    });

    const payment = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: payment.detail || "Mollie betaling kon niet gestart worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: payment._links.checkout.href,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Er ging iets mis bij het starten van de betaling." },
      { status: 500 }
    );
  }
}