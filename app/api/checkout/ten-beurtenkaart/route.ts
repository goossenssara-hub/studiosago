import { NextResponse } from "next/server";

const DISCOUNT_CODES = [
  "4KX9-MP7Q-L2ZT-81NR",
  "Q7LP-82XM-V4KT-9R31",
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getFinalAmount({
  discountCode,
  parentName,
  email,
}: {
  discountCode: string;
  parentName: string;
  email: string;
}) {
  const codeOk = DISCOUNT_CODES.includes(discountCode.trim().toUpperCase());
  const emailOk = normalize(email) === "markenvicky@outlook.be";

  const name = normalize(parentName);
  const nameOk = name === "vicky marken" || name === "joris koolen";

  if (codeOk && emailOk && nameOk) {
    return {
      hasDiscount: true,
      discountAmount: 20,
      finalAmount: 300,
    };
  }

  return {
    hasDiscount: false,
    discountAmount: 0,
    finalAmount: 320,
  };
}

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
    const discountCode = String(formData.get("discount_code") || "");

    if (!studentName || !studentAge || !schoolYear || !parentName || !email) {
      return NextResponse.json(
        { error: "Niet alle verplichte velden zijn ingevuld." },
        { status: 400 }
      );
    }

    const discount = getFinalAmount({
      discountCode,
      parentName,
      email,
    });

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
          value: discount.finalAmount.toFixed(2),
        },
        description: discount.hasDiscount
          ? "10-beurtenkaart Studio SaGo - €20 korting"
          : "10-beurtenkaart Studio SaGo",
        method: "bancontact",
        redirectUrl: `${siteUrl}/bedankt?product=10-beurtenkaart`,
        webhookUrl: `${siteUrl}/api/mollie/webhook`,
        locale: "nl_BE",
        metadata: {
          product: "10-beurtenkaart",
          originalAmount: "320",
          discountCode: discount.hasDiscount ? discountCode : "",
          discountAmount: String(discount.discountAmount),
          amount: String(discount.finalAmount),
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