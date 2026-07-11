type SupabaseAdmin = any;

export type WebshopOrderMetadata = {
  checkoutId?: string;
  product?: string;
  productName?: string;
  amount?: string | number;
  originalAmount?: string | number;

  discountId?: string | null;
  discountCode?: string;
  discountAmount?: string | number;

  parentName?: string;
  studentName?: string;
  email?: string;
  phone?: string;
  studentAge?: string;
  schoolYear?: string;
  school?: string;
  wordCount?: string;
  textType?: string;
  notes?: string;

  paymentMethod?: string;
};

type FulfillWebshopOrderArguments = {
  supabaseAdmin: SupabaseAdmin;
  paymentId: string;
  metadata: WebshopOrderMetadata;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return clean(value).toLowerCase();
}

function makeReference(paymentId: string) {
  return `Betalingsreferentie: ${paymentId}`;
}

export async function fulfillWebshopOrder({
  supabaseAdmin,
  paymentId,
  metadata,
}: FulfillWebshopOrderArguments) {
  const product = clean(metadata.product);
  const productName =
    clean(metadata.productName) || product || "Webshopaankoop";

  const parentName = clean(metadata.parentName);
  const studentName = clean(metadata.studentName);
  const email = normalizeEmail(metadata.email);
  const phone = clean(metadata.phone);

  const studentAge = clean(metadata.studentAge);
  const schoolYear = clean(metadata.schoolYear);
  const school = clean(metadata.school);
  const notes = clean(metadata.notes);

  const amount = Number(metadata.amount || 0);
  const originalAmount = Number(
    metadata.originalAmount || metadata.amount || 0
  );

  const discountAmount = Number(metadata.discountAmount || 0);
  const discountId = clean(metadata.discountId);
  const discountCode = clean(metadata.discountCode);

  const paymentMethod =
    clean(metadata.paymentMethod) ||
    (paymentId.startsWith("voucher_")
      ? "waardebon"
      : "mollie");

  const paymentReference = makeReference(paymentId);

  /*
   * Dubbele verwerking voorkomen.
   * Zowel Mollie als een statuscontrole kan dezelfde betaling
   * eventueel meer dan één keer verwerken.
   */
  const { data: existingBooking, error: duplicateError } =
    await supabaseAdmin
      .from("bookings")
      .select("id")
      .ilike("notes", `%${paymentReference}%`)
      .maybeSingle();

  if (duplicateError) {
    console.error(
      "FULFILL ORDER DUPLICATE CHECK ERROR:",
      duplicateError
    );

    throw new Error(
      "De bestelling kon niet op dubbele verwerking gecontroleerd worden."
    );
  }

  if (existingBooking) {
    await supabaseAdmin
      .from("webshop_payments")
      .update({ status: "paid" })
      .eq("payment_id", paymentId);

    return {
      success: true,
      duplicate: true,
      contactId: null,
      bookingId: existingBooking.id,
    };
  }

  /*
   * Eerst zoeken of de klant al als contact bestaat.
   * Daardoor wordt niet bij iedere aankoop een dubbel contact gemaakt.
   */
  let contactId: string | null = null;

  if (email) {
    const { data: existingContact, error: contactFindError } =
      await supabaseAdmin
        .from("contacts")
        .select("id")
        .ilike("email", email)
        .limit(1)
        .maybeSingle();

    if (contactFindError) {
      console.error(
        "FULFILL ORDER CONTACT FIND ERROR:",
        contactFindError
      );
    }

    if (existingContact?.id) {
      contactId = String(existingContact.id);
    }
  }

  if (!contactId) {
    const contactNotes = [
      `Aankoop: ${productName}`,
      studentName ? `Leerling: ${studentName}` : "",
      studentAge ? `Leeftijd: ${studentAge}` : "",
      schoolYear ? `Studiejaar: ${schoolYear}` : "",
      school ? `School: ${school}` : "",
      notes ? `Opmerking: ${notes}` : "",
      discountCode
        ? `Kortingscode: ${discountCode}`
        : "",
      discountAmount > 0
        ? `Korting: €${discountAmount.toFixed(2)}`
        : "",
      `Betaalmethode: ${paymentMethod}`,
      paymentReference,
    ]
      .filter(Boolean)
      .join("\n");

    const { data: newContact, error: contactInsertError } =
      await supabaseAdmin
        .from("contacts")
        .insert({
          first_name: parentName || studentName || "Webshopklant",
          last_name: "",
          email,
          phone,
          notes: contactNotes,
          active: true,
        })
        .select("id")
        .single();

    if (contactInsertError || !newContact?.id) {
      console.error(
        "FULFILL ORDER CONTACT INSERT ERROR:",
        contactInsertError
      );

      throw new Error(
        "Het contact kon niet opgeslagen worden."
      );
    }

    contactId = String(newContact.id);
  }

  const bookingNotes = [
    `Betaald product: ${productName}`,
    studentName ? `Leerling: ${studentName}` : "",
    studentAge ? `Leeftijd: ${studentAge}` : "",
    schoolYear ? `Studiejaar: ${schoolYear}` : "",
    school ? `School: ${school}` : "",
    `Oorspronkelijk bedrag: €${originalAmount.toFixed(2)}`,
    discountAmount > 0
      ? `Korting: €${discountAmount.toFixed(2)}`
      : "",
    discountCode
      ? `Kortingscode: ${discountCode}`
      : "",
    `Betaald bedrag: €${amount.toFixed(2)}`,
    `Betaalmethode: ${paymentMethod}`,
    notes ? `Opmerking: ${notes}` : "",
    paymentReference,
  ]
    .filter(Boolean)
    .join("\n");

  const { data: booking, error: bookingError } =
    await supabaseAdmin
      .from("bookings")
      .insert({
        contact_id: contactId,
        service_id: null,
        availability_id: null,
        status: "confirmed",
        payment_status: "paid",
        amount,
        notes: bookingNotes,
      })
      .select("id")
      .single();

  if (bookingError || !booking?.id) {
    console.error(
      "FULFILL ORDER BOOKING INSERT ERROR:",
      bookingError
    );

    throw new Error(
      "De boeking kon niet opgeslagen worden."
    );
  }

  /*
   * Maak automatisch een beurtenkaart aan.
   * Controle gebeurt op productsleutel én productnaam.
   */
  const normalizedProduct = product.toLowerCase();
  const normalizedProductName = productName.toLowerCase();

  const isTenSessionPass =
    normalizedProduct.includes("10-beurtenkaart") ||
    normalizedProductName.includes("10-beurtenkaart");

  if (isTenSessionPass) {
    const level =
      normalizedProduct.includes("secundair") ||
      normalizedProductName.includes("secundair")
        ? "secundair"
        : "lager";

    const { data: existingPass, error: passFindError } =
      await supabaseAdmin
        .from("passes")
        .select("id")
        .eq("payment_id", paymentId)
        .maybeSingle();

    if (passFindError) {
      console.error(
        "FULFILL ORDER PASS FIND ERROR:",
        passFindError
      );
    }

    if (!existingPass) {
      const { error: passInsertError } =
        await supabaseAdmin.from("passes").insert({
          contact_id: contactId,
          customer_email: email,
          title: productName || "10-beurtenkaart",
          product: productName || product,
          level,
          total_credits: 10,
          remaining_credits: 10,
          total_sessions: 10,
          remaining_sessions: 10,
          status: "active",
          payment_id: paymentId,
        });

      if (passInsertError) {
        console.error(
          "FULFILL ORDER PASS INSERT ERROR:",
          passInsertError
        );

        throw new Error(
          "De beurtenkaart kon niet opgeslagen worden."
        );
      }
    }
  }

  /*
   * Kortingscode pas als gebruikt registreren nadat de
   * volledige bestelling succesvol verwerkt is.
   */
  if (discountId) {
    const { data: discountCodeRow, error: discountReadError } =
      await supabaseAdmin
        .from("discount_codes")
        .select("used_count, max_uses, active")
        .eq("id", discountId)
        .maybeSingle();

    if (discountReadError) {
      console.error(
        "FULFILL ORDER DISCOUNT READ ERROR:",
        discountReadError
      );
    } else if (discountCodeRow) {
      const currentUses = Number(
        discountCodeRow.used_count || 0
      );

      const newUsedCount = currentUses + 1;
      const maxUses =
        discountCodeRow.max_uses === null
          ? null
          : Number(discountCodeRow.max_uses);

      const shouldDeactivate =
        maxUses !== null && newUsedCount >= maxUses;

      const { error: discountUpdateError } =
        await supabaseAdmin
          .from("discount_codes")
          .update({
            used_count: newUsedCount,
            active: shouldDeactivate
              ? false
              : discountCodeRow.active,
          })
          .eq("id", discountId);

      if (discountUpdateError) {
        console.error(
          "FULFILL ORDER DISCOUNT UPDATE ERROR:",
          discountUpdateError
        );
      }
    }
  }

  const { error: paymentUpdateError } =
    await supabaseAdmin
      .from("webshop_payments")
      .update({ status: "paid" })
      .eq("payment_id", paymentId);

  if (paymentUpdateError) {
    console.error(
      "FULFILL ORDER PAYMENT UPDATE ERROR:",
      paymentUpdateError
    );
  }

  return {
    success: true,
    duplicate: false,
    contactId,
    bookingId: String(booking.id),
  };
}