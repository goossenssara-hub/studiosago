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

  /*
   * Nodig voor volledig gratis diensten of waardebonnen
   * die het volledige bedrag dekken.
   */
  isFreeOrder?: boolean;
};

type FulfillWebshopOrderArguments = {
  supabaseAdmin: SupabaseAdmin;
  paymentId: string;
  metadata: WebshopOrderMetadata;
};

type FulfillWebshopOrderResult = {
  success: true;
  duplicate: boolean;
  contactId: string | null;
  bookingId: string;
  passCreated: boolean;
  isFreeOrder: boolean;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return clean(value).toLowerCase();
}

function toSafeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value: number) {
  return `€${roundCurrency(value).toFixed(2)}`;
}

function makeReference(paymentId: string) {
  return `Betalingsreferentie: ${paymentId}`;
}

function getPaymentMethod({
  paymentId,
  metadata,
  isFreeOrder,
}: {
  paymentId: string;
  metadata: WebshopOrderMetadata;
  isFreeOrder: boolean;
}) {
  const suppliedMethod = clean(metadata.paymentMethod);

  if (suppliedMethod) {
    return suppliedMethod;
  }

  if (paymentId.startsWith("voucher_")) {
    return "waardebon";
  }

  if (paymentId.startsWith("free_")) {
    return "gratis";
  }

  if (paymentId.startsWith("admin_")) {
    return "admin";
  }

  if (isFreeOrder) {
    return "gratis";
  }

  return "mollie";
}

export async function fulfillWebshopOrder({
  supabaseAdmin,
  paymentId,
  metadata,
}: FulfillWebshopOrderArguments): Promise<FulfillWebshopOrderResult> {
  const cleanedPaymentId = clean(paymentId);

  if (!cleanedPaymentId) {
    throw new Error(
      "De betalingsreferentie van de bestelling ontbreekt."
    );
  }

  const product = clean(metadata.product);

  const productName =
    clean(metadata.productName) ||
    product ||
    "Webshopaankoop";

  const parentName = clean(metadata.parentName);
  const studentName = clean(metadata.studentName);

  const email = normalizeEmail(metadata.email);
  const phone = clean(metadata.phone);

  const studentAge = clean(metadata.studentAge);
  const schoolYear = clean(metadata.schoolYear);
  const school = clean(metadata.school);

  const wordCount = clean(metadata.wordCount);
  const textType = clean(metadata.textType);
  const notes = clean(metadata.notes);

  const amount = roundCurrency(
    Math.max(toSafeNumber(metadata.amount), 0)
  );

  const originalAmount = roundCurrency(
    Math.max(
      toSafeNumber(metadata.originalAmount, amount),
      0
    )
  );

  const discountAmount = roundCurrency(
    Math.max(toSafeNumber(metadata.discountAmount), 0)
  );

  const discountId = clean(metadata.discountId);
  const discountCode = clean(metadata.discountCode);

  const isFreeOrder =
    metadata.isFreeOrder === true || amount === 0;

  const paymentMethod = getPaymentMethod({
    paymentId: cleanedPaymentId,
    metadata,
    isFreeOrder,
  });

  const paymentReference =
    makeReference(cleanedPaymentId);

  /*
   * Dubbele verwerking voorkomen.
   */
  const {
    data: existingBooking,
    error: duplicateError,
  } = await supabaseAdmin
    .from("bookings")
    .select("id, contact_id")
    .ilike("notes", `%${paymentReference}%`)
    .limit(1)
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

  if (existingBooking?.id) {
    const { error: paymentStatusError } =
      await supabaseAdmin
        .from("webshop_payments")
        .update({
          status: "paid",
        })
        .eq("payment_id", cleanedPaymentId);

    if (paymentStatusError) {
      console.error(
        "FULFILL DUPLICATE PAYMENT UPDATE ERROR:",
        paymentStatusError
      );
    }

    return {
      success: true,
      duplicate: true,
      contactId: existingBooking.contact_id
        ? String(existingBooking.contact_id)
        : null,
      bookingId: String(existingBooking.id),
      passCreated: false,
      isFreeOrder,
    };
  }

  /*
   * Zoek een bestaand contact op e-mailadres.
   */
  let contactId: string | null = null;

  if (email) {
    const {
      data: existingContact,
      error: contactFindError,
    } = await supabaseAdmin
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

  /*
   * Maak een contact aan wanneer het nog niet bestaat.
   */
  if (!contactId) {
    const contactNotes = [
      `${isFreeOrder ? "Gratis dienst" : "Aankoop"}: ${productName}`,

      studentName
        ? `Leerling: ${studentName}`
        : "",

      studentAge
        ? `Leeftijd: ${studentAge}`
        : "",

      schoolYear
        ? `Studiejaar: ${schoolYear}`
        : "",

      school
        ? `School: ${school}`
        : "",

      wordCount
        ? `Aantal woorden: ${wordCount}`
        : "",

      textType
        ? `Teksttype: ${textType}`
        : "",

      notes
        ? `Opmerking: ${notes}`
        : "",

      discountCode
        ? `Kortingscode: ${discountCode}`
        : "",

      discountAmount > 0
        ? `Korting: ${formatCurrency(discountAmount)}`
        : "",

      `Betaalmethode: ${paymentMethod}`,
      paymentReference,
    ]
      .filter(Boolean)
      .join("\n");

    const {
      data: newContact,
      error: contactInsertError,
    } = await supabaseAdmin
      .from("contacts")
      .insert({
        first_name:
          parentName ||
          studentName ||
          "Webshopklant",

        last_name: "",
        email,
        phone,
        notes: contactNotes,
        active: true,
      })
      .select("id")
      .single();

    if (
      contactInsertError ||
      !newContact?.id
    ) {
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

  /*
   * Elke dienst wordt als bevestigde boeking opgeslagen.
   */
  const bookingNotes = [
    `${isFreeOrder ? "Gratis aangeboden product" : "Betaald product"}: ${productName}`,

    product
      ? `Productsleutel: ${product}`
      : "",

    studentName
      ? `Leerling: ${studentName}`
      : "",

    studentAge
      ? `Leeftijd: ${studentAge}`
      : "",

    schoolYear
      ? `Studiejaar: ${schoolYear}`
      : "",

    school
      ? `School: ${school}`
      : "",

    wordCount
      ? `Aantal woorden: ${wordCount}`
      : "",

    textType
      ? `Teksttype: ${textType}`
      : "",

    `Oorspronkelijk bedrag: ${formatCurrency(
      originalAmount
    )}`,

    discountAmount > 0
      ? `Korting: ${formatCurrency(discountAmount)}`
      : "",

    discountCode
      ? `Kortingscode: ${discountCode}`
      : "",

    `Betaald bedrag: ${formatCurrency(amount)}`,

    isFreeOrder
      ? "Bestelling volledig voldaan zonder online betaling"
      : "",

    `Betaalmethode: ${paymentMethod}`,

    notes
      ? `Opmerking: ${notes}`
      : "",

    paymentReference,
  ]
    .filter(Boolean)
    .join("\n");

  const {
    data: booking,
    error: bookingError,
  } = await supabaseAdmin
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

  if (
    bookingError ||
    !booking?.id
  ) {
    console.error(
      "FULFILL ORDER BOOKING INSERT ERROR:",
      bookingError
    );

    throw new Error(
      "De boeking kon niet opgeslagen worden."
    );
  }

  /*
   * Herken beurtenkaarten.
   */
  const normalizedProduct =
    product.toLowerCase();

  const normalizedProductName =
    productName.toLowerCase();

  const isTenSessionPass =
    normalizedProduct.includes("10-beurtenkaart") ||
    normalizedProductName.includes("10-beurtenkaart") ||
    normalizedProduct.includes("tienbeurtenkaart") ||
    normalizedProductName.includes("tienbeurtenkaart");

  let passCreated = false;

  if (isTenSessionPass) {
    const level =
      normalizedProduct.includes("secundair") ||
      normalizedProductName.includes("secundair")
        ? "secundair"
        : "lager";

    const {
      data: existingPass,
      error: passFindError,
    } = await supabaseAdmin
      .from("passes")
      .select("id")
      .eq("payment_id", cleanedPaymentId)
      .limit(1)
      .maybeSingle();

    if (passFindError) {
      console.error(
        "FULFILL ORDER PASS FIND ERROR:",
        passFindError
      );
    }

    if (!existingPass?.id) {
      const { error: passInsertError } =
        await supabaseAdmin
          .from("passes")
          .insert({
            contact_id: contactId,
            customer_email: email,

            title:
              productName ||
              "10-beurtenkaart",

            product:
              productName ||
              product ||
              "10-beurtenkaart",

            level,

            total_credits: 10,
            remaining_credits: 10,

            total_sessions: 10,
            remaining_sessions: 10,

            status: "active",
            payment_id: cleanedPaymentId,
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

      passCreated = true;
    }
  }

  /*
   * Registreer de kortingscode als gebruikt.
   */
  if (discountId) {
    const {
      data: discountCodeRow,
      error: discountReadError,
    } = await supabaseAdmin
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
      const currentUses = Math.max(
        Number(discountCodeRow.used_count || 0),
        0
      );

      const newUsedCount =
        currentUses + 1;

      const maxUses =
        discountCodeRow.max_uses === null
          ? null
          : Number(discountCodeRow.max_uses);

      const shouldDeactivate =
        maxUses !== null &&
        Number.isFinite(maxUses) &&
        newUsedCount >= maxUses;

      const {
        error: discountUpdateError,
      } = await supabaseAdmin
        .from("discount_codes")
        .update({
          used_count: newUsedCount,

          active: shouldDeactivate
            ? false
            : Boolean(discountCodeRow.active),
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

  /*
   * Zet de webshopbetaling op betaald.
   */
  const {
    error: paymentUpdateError,
  } = await supabaseAdmin
    .from("webshop_payments")
    .update({
      status: "paid",
    })
    .eq("payment_id", cleanedPaymentId);

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
    passCreated,
    isFreeOrder,
  };
}