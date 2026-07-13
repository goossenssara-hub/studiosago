import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingType = "individual" | "group";
type EducationLevel = "primary" | "secondary";
type DeliveryType = "digital" | "home";

type PurchaserInput = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
};

type ParticipantInput = {
  firstNames?: unknown;
  lastNames?: unknown;
  birthDate?: unknown;

  grade?: unknown;
  studyProgram?: unknown;
  school?: unknown;

  schoolContactName?: unknown;
  schoolContactEmail?: unknown;
  schoolContactPhone?: unknown;

  learningGoal?: unknown;

  parentFirstName?: unknown;
  parentLastName?: unknown;
  parentEmail?: unknown;
  parentPhone?: unknown;
};

type CheckoutRequestBody = {
  bookingType?: unknown;
  educationLevel?: unknown;
  deliveryType?: unknown;

  durationMinutes?: unknown;
  participantCount?: unknown;

  pricePerParticipant?: unknown;
  totalAmount?: unknown;

  purchaser?: PurchaserInput;
  participants?: ParticipantInput[];

  radiusAccepted?: unknown;
  termsAccepted?: unknown;
  privacyAccepted?: unknown;
};

type ValidatedParticipant = {
  firstNames: string;
  lastNames: string;
  birthDate: string;

  grade: string;
  studyProgram: string;
  school: string;

  schoolContactName: string;
  schoolContactEmail: string;
  schoolContactPhone: string;

  learningGoal: string;

  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
};

type MolliePaymentResponse = {
  id?: string;
  status?: string;
  detail?: string;
  title?: string;

  _links?: {
    checkout?: {
      href?: string;
    };
  };
};

const PRICE_CONFIG = {
  individual: {
    primary: 35,
    secondary: 40,
  },

  group: {
    primary: 22,
    secondary: 30,
  },
} as const;

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T12:00:00`);

  return (
    Number.isFinite(date.getTime()) &&
    date.getTime() <= Date.now()
  );
}

function isBookingType(value: string): value is BookingType {
  return value === "individual" || value === "group";
}

function isEducationLevel(
  value: string
): value is EducationLevel {
  return value === "primary" || value === "secondary";
}

function isDeliveryType(value: string): value is DeliveryType {
  return value === "digital" || value === "home";
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function moneyValue(value: number): string {
  return roundCurrency(value).toFixed(2);
}

function getBaseUrl(request: Request): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    const normalizedUrl = configuredUrl.startsWith("http")
      ? configuredUrl
      : `https://${configuredUrl}`;

    return normalizedUrl.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}

function getProductName({
  bookingType,
  educationLevel,
  participantCount,
}: {
  bookingType: BookingType;
  educationLevel: EducationLevel;
  participantCount: number;
}): string {
  const level =
    educationLevel === "primary"
      ? "Lager onderwijs"
      : "Secundair onderwijs";

  if (bookingType === "group") {
    return `Begeleiding in kleine groep – ${level} – ${participantCount} leerlingen`;
  }

  return `Individuele begeleiding – ${level}`;
}

function validateParticipant({
  participant,
  index,
  educationLevel,
}: {
  participant: ParticipantInput;
  index: number;
  educationLevel: EducationLevel;
}):
  | {
      valid: true;
      participant: ValidatedParticipant;
    }
  | {
      valid: false;
      error: string;
    } {
  const number = index + 1;

  const firstNames = clean(participant.firstNames);
  const lastNames = clean(participant.lastNames);
  const birthDate = clean(participant.birthDate);

  const grade = clean(participant.grade);
  const studyProgram = clean(participant.studyProgram);
  const school = clean(participant.school);

  const schoolContactName = clean(
    participant.schoolContactName
  );

  const schoolContactEmail = normalizeEmail(
    participant.schoolContactEmail
  );

  const schoolContactPhone = clean(
    participant.schoolContactPhone
  );

  const learningGoal = clean(participant.learningGoal);

  const parentFirstName = clean(
    participant.parentFirstName
  );

  const parentLastName = clean(
    participant.parentLastName
  );

  const parentEmail = normalizeEmail(
    participant.parentEmail
  );

  const parentPhone = clean(participant.parentPhone);

  if (!firstNames || !lastNames) {
    return {
      valid: false,
      error: `Vul de volledige naam van leerling ${number} in.`,
    };
  }

  if (!birthDate || !isValidDate(birthDate)) {
    return {
      valid: false,
      error: `Vul een geldige geboortedatum van leerling ${number} in.`,
    };
  }

  if (!grade) {
    return {
      valid: false,
      error: `Kies het leerjaar of studiejaar van leerling ${number}.`,
    };
  }

  if (
    educationLevel === "secondary" &&
    !studyProgram
  ) {
    return {
      valid: false,
      error: `Vul de studierichting van leerling ${number} in.`,
    };
  }

  if (!school) {
    return {
      valid: false,
      error: `Vul de school van leerling ${number} in.`,
    };
  }

  if (!schoolContactName) {
    return {
      valid: false,
      error: `Vul de betrokken leerkracht of schoolcontactpersoon van leerling ${number} in.`,
    };
  }

  if (
    schoolContactEmail &&
    !isValidEmail(schoolContactEmail)
  ) {
    return {
      valid: false,
      error: `Vul een geldig e-mailadres voor de schoolcontactpersoon van leerling ${number} in.`,
    };
  }

  if (!learningGoal) {
    return {
      valid: false,
      error: `Vul de hulpvraag of het leerdoel van leerling ${number} in.`,
    };
  }

  if (!parentFirstName || !parentLastName) {
    return {
      valid: false,
      error: `Vul de naam van de ouder of voogd van leerling ${number} in.`,
    };
  }

  if (!parentEmail || !isValidEmail(parentEmail)) {
    return {
      valid: false,
      error: `Vul een geldig e-mailadres van de ouder van leerling ${number} in.`,
    };
  }

  if (!parentPhone) {
    return {
      valid: false,
      error: `Vul het telefoonnummer van de ouder van leerling ${number} in.`,
    };
  }

  return {
    valid: true,

    participant: {
      firstNames,
      lastNames,
      birthDate,

      grade,

      studyProgram:
        educationLevel === "secondary"
          ? studyProgram
          : "",

      school,

      schoolContactName,
      schoolContactEmail,
      schoolContactPhone,

      learningGoal,

      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
    },
  };
}

async function deleteOrder({
  supabaseAdmin,
  orderId,
}: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
  orderId: string;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from("appointment_orders")
    .delete()
    .eq("id", orderId);

  if (error) {
    console.error(
      "APPOINTMENT ORDER ROLLBACK ERROR:",
      error
    );
  }
}

async function updateOrderStatus({
  supabaseAdmin,
  orderId,
  paymentStatus,
}: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
  orderId: string;
  paymentStatus: string;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from("appointment_orders")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error(
      "APPOINTMENT ORDER STATUS UPDATE ERROR:",
      error
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse> {
  let createdOrderId = "";

  try {
    const body =
      (await request.json()) as CheckoutRequestBody;

    const bookingTypeValue = clean(body.bookingType);

    const educationLevelValue = clean(
      body.educationLevel
    );

    const deliveryTypeValue = clean(
      body.deliveryType
    );

    if (!isBookingType(bookingTypeValue)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Het gekozen type begeleiding is ongeldig.",
        },
        { status: 400 }
      );
    }

    if (!isEducationLevel(educationLevelValue)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Het gekozen onderwijsniveau is ongeldig.",
        },
        { status: 400 }
      );
    }

    if (!isDeliveryType(deliveryTypeValue)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kies digitale begeleiding of begeleiding aan huis.",
        },
        { status: 400 }
      );
    }

    const bookingType = bookingTypeValue;
    const educationLevel = educationLevelValue;
    const deliveryType = deliveryTypeValue;

    const purchaser = body.purchaser ?? {};

    const purchaserFirstName = clean(
      purchaser.firstName
    );

    const purchaserLastName = clean(
      purchaser.lastName
    );

    const purchaserEmail = normalizeEmail(
      purchaser.email
    );

    const purchaserPhone = clean(
      purchaser.phone
    );

    const purchaserAddress = clean(
      purchaser.address
    );

    if (!purchaserFirstName || !purchaserLastName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Vul de voornaam en familienaam van de koper in.",
        },
        { status: 400 }
      );
    }

    if (
      !purchaserEmail ||
      !isValidEmail(purchaserEmail)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Vul een geldig e-mailadres van de koper in.",
        },
        { status: 400 }
      );
    }

    if (!purchaserPhone) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Vul het telefoonnummer van de koper in.",
        },
        { status: 400 }
      );
    }

    if (
      deliveryType === "home" &&
      !purchaserAddress
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Vul het volledige adres voor begeleiding aan huis in.",
        },
        { status: 400 }
      );
    }

    if (
      deliveryType === "home" &&
      body.radiusAccepted !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bevestig dat het adres binnen 15 km rond Peer ligt.",
        },
        { status: 400 }
      );
    }

    if (body.termsAccepted !== true) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Je moet akkoord gaan met de boekings- en annuleringsvoorwaarden.",
        },
        { status: 400 }
      );
    }

    if (body.privacyAccepted !== true) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Je moet akkoord gaan met de verwerking van de ingevulde gegevens.",
        },
        { status: 400 }
      );
    }

    const rawParticipants = Array.isArray(
      body.participants
    )
      ? body.participants
      : [];

    const requestedParticipantCount = Math.trunc(
      Number(body.participantCount)
    );

    const expectedParticipantCount =
      bookingType === "group"
        ? Math.max(
            2,
            Math.min(
              5,
              Number.isFinite(requestedParticipantCount)
                ? requestedParticipantCount
                : 2
            )
          )
        : 1;

    if (
      rawParticipants.length !==
      expectedParticipantCount
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            bookingType === "group"
              ? "Vul de gegevens van alle gekozen groepsleden in."
              : "Vul de gegevens van de leerling in.",
        },
        { status: 400 }
      );
    }

    const participants: ValidatedParticipant[] = [];

    for (
      let index = 0;
      index < rawParticipants.length;
      index += 1
    ) {
      const validation = validateParticipant({
        participant: rawParticipants[index],
        index,
        educationLevel,
      });

      if (validation.valid === false) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error,
          },
          { status: 400 }
        );
      }

      participants.push(validation.participant);
    }

    const participantCount = participants.length;

    if (
      bookingType === "group" &&
      (participantCount < 2 || participantCount > 5)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Een groep bestaat uit minimaal 2 en maximaal 5 leerlingen.",
        },
        { status: 400 }
      );
    }

    if (
      bookingType === "individual" &&
      participantCount !== 1
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bij individuele begeleiding kan slechts één leerling worden toegevoegd.",
        },
        { status: 400 }
      );
    }

    /*
     * De prijs wordt uitsluitend op de server berekend.
     */
    const pricePerParticipant =
      PRICE_CONFIG[bookingType][educationLevel];

    const totalAmount = roundCurrency(
      pricePerParticipant * participantCount
    );

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Het berekende bedrag is ongeldig.",
        },
        { status: 400 }
      );
    }

    const durationMinutes = 60;
    const checkoutId = crypto.randomUUID();

    const productName = getProductName({
      bookingType,
      educationLevel,
      participantCount,
    });

    const supabaseAdmin = getSupabaseAdmin();

    /*
     * Eerst de bestelling bewaren.
     */
    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("appointment_orders")
        .insert({
          checkout_id: checkoutId,
          mollie_payment_id: null,

          booking_type: bookingType,
          education_level: educationLevel,
          delivery_type: deliveryType,

          duration_minutes: durationMinutes,
          participant_count: participantCount,

          price_per_participant: pricePerParticipant,
          total_amount: totalAmount,

          purchaser_first_name: purchaserFirstName,
          purchaser_last_name: purchaserLastName,
          purchaser_email: purchaserEmail,
          purchaser_phone: purchaserPhone,

          purchaser_address:
            deliveryType === "home"
              ? purchaserAddress
              : null,

          payment_status: "creating",
          booking_status: "awaiting_payment",

          introduction_allowed: false,

          updated_at: new Date().toISOString(),
        })
        .select("id, checkout_id")
        .single();

    if (orderError || !order?.id) {
      console.error(
        "APPOINTMENT ORDER INSERT ERROR:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            orderError?.message ||
            "De bestelling kon niet opgeslagen worden.",
        },
        { status: 500 }
      );
    }

    createdOrderId = String(order.id);

    /*
     * Iedere leerling afzonderlijk bewaren.
     */
    const participantRows = participants.map(
      (participant) => ({
        order_id: createdOrderId,

        student_id: null,
        parent_profile_id: null,

        first_names: participant.firstNames,
        last_names: participant.lastNames,
        birth_date: participant.birthDate,

        education_level: educationLevel,
        grade: participant.grade,

        study_program:
          participant.studyProgram || null,

        school: participant.school,

        school_contact_name:
          participant.schoolContactName,

        school_contact_email:
          participant.schoolContactEmail || null,

        school_contact_phone:
          participant.schoolContactPhone || null,

        learning_goal: participant.learningGoal,

        parent_first_name:
          participant.parentFirstName,

        parent_last_name:
          participant.parentLastName,

        parent_email: participant.parentEmail,
        parent_phone: participant.parentPhone,
      })
    );

    const { error: participantsInsertError } =
      await supabaseAdmin
        .from("appointment_order_participants")
        .insert(participantRows);

    if (participantsInsertError) {
      console.error(
        "APPOINTMENT PARTICIPANTS INSERT ERROR:",
        participantsInsertError
      );

      await deleteOrder({
        supabaseAdmin,
        orderId: createdOrderId,
      });

      return NextResponse.json(
        {
          success: false,
          error:
            participantsInsertError.message ||
            "De leerlinggegevens konden niet opgeslagen worden.",
        },
        { status: 500 }
      );
    }

    const mollieApiKey = clean(
      process.env.MOLLIE_API_KEY
    );

    if (!mollieApiKey) {
      await updateOrderStatus({
        supabaseAdmin,
        orderId: createdOrderId,
        paymentStatus: "configuration_error",
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "De betaalomgeving is momenteel niet correct ingesteld.",
        },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl(request);

    const paymentBody = {
      amount: {
        currency: "EUR",
        value: moneyValue(totalAmount),
      },

      description: productName,

      redirectUrl: `${baseUrl}/betaling/bedankt?checkoutId=${encodeURIComponent(
        checkoutId
      )}`,

      webhookUrl: `${baseUrl}/api/mollie/webhook`,

      locale: "nl_BE",

      metadata: {
        orderType: "appointment",
        appointmentOrderId: createdOrderId,
        checkoutId,
        bookingType,
        educationLevel,
        deliveryType,
        participantCount,
        purchaserEmail,
      },
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

        body: JSON.stringify(paymentBody),

        cache: "no-store",
      }
    );

    let payment: MolliePaymentResponse;

    try {
      payment =
        (await mollieResponse.json()) as MolliePaymentResponse;
    } catch {
      payment = {
        detail:
          "Mollie heeft geen geldig antwoord teruggestuurd.",
      };
    }

    if (!mollieResponse.ok) {
      console.error(
        "APPOINTMENT MOLLIE PAYMENT CREATE ERROR:",
        {
          status: mollieResponse.status,
          payment,
        }
      );

      await updateOrderStatus({
        supabaseAdmin,
        orderId: createdOrderId,
        paymentStatus: "payment_error",
      });

      return NextResponse.json(
        {
          success: false,
          error:
            payment.detail ||
            payment.title ||
            "De Mollie-betaling kon niet gestart worden.",
        },
        {
          status:
            mollieResponse.status >= 400
              ? mollieResponse.status
              : 500,
        }
      );
    }

    if (!payment.id) {
      await updateOrderStatus({
        supabaseAdmin,
        orderId: createdOrderId,
        paymentStatus: "payment_error",
      });

      throw new Error(
        "Mollie heeft geen geldig betalingsnummer teruggestuurd."
      );
    }

    const checkoutUrl =
      payment._links?.checkout?.href;

    if (!checkoutUrl) {
      await updateOrderStatus({
        supabaseAdmin,
        orderId: createdOrderId,
        paymentStatus: "payment_error",
      });

      throw new Error(
        "Mollie heeft geen geldige betaalpagina teruggegeven."
      );
    }

    /*
     * Mollie-payment-ID en huidige status opslaan.
     */
    const { error: paymentUpdateError } =
      await supabaseAdmin
        .from("appointment_orders")
        .update({
          mollie_payment_id: payment.id,

          payment_status: String(
            payment.status || "open"
          ),

          updated_at: new Date().toISOString(),
        })
        .eq("id", createdOrderId);

    if (paymentUpdateError) {
      console.error(
        "APPOINTMENT ORDER PAYMENT UPDATE ERROR:",
        paymentUpdateError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "De betaling werd aangemaakt, maar kon niet volledig aan de bestelling gekoppeld worden. Neem contact op met Studio SaGo.",
          paymentId: payment.id,
          checkoutId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,

        orderId: createdOrderId,
        checkoutId,
        paymentId: payment.id,

        checkoutUrl,
        redirectUrl: checkoutUrl,
        url: checkoutUrl,

        bookingType,
        educationLevel,
        deliveryType,

        participantCount,
        pricePerParticipant,
        totalAmount,

        formattedAmount: moneyValue(totalAmount),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "APPOINTMENT ORDER CHECKOUT ERROR:",
      error
    );

    if (createdOrderId) {
      try {
        const supabaseAdmin = getSupabaseAdmin();

        await updateOrderStatus({
          supabaseAdmin,
          orderId: createdOrderId,
          paymentStatus: "payment_error",
        });
      } catch (updateError) {
        console.error(
          "APPOINTMENT ORDER ERROR STATUS UPDATE FAILED:",
          updateError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Er ging iets mis bij het starten van de betaling.",
      },
      { status: 500 }
    );
  }
}