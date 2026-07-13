import {
  addNumberToInternalEmail,
  createInternalEmailBase,
  InternalAccountType,
} from "@/lib/accountAliases";
import {
  ensureParentAccountActivation,
} from "@/lib/parentAccountActivation";

type SupabaseAdmin = any;

type AppointmentPaymentMetadata = {
  orderType?: string;
  appointmentOrderId?: string;
  checkoutId?: string;
  bookingType?: string;
  educationLevel?: string;
  deliveryType?: string;
  participantCount?: number | string;
  purchaserEmail?: string;
};

type FulfillAppointmentOrderArguments = {
  supabaseAdmin: SupabaseAdmin;
  paymentId: string;
  metadata: AppointmentPaymentMetadata;
};

type ParticipantRow = {
  id: string;
  order_id: string;

  first_names: string | null;
  last_names: string | null;
  birth_date: string | null;

  education_level: string | null;
  grade: string | null;
  study_program: string | null;
  school: string | null;

  school_contact_name: string | null;
  school_contact_email: string | null;
  school_contact_phone: string | null;

  learning_goal: string | null;

  parent_first_name: string | null;
  parent_last_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;

  student_id: string | null;
  parent_profile_id: string | null;
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function fullName(
  firstNames: unknown,
  lastNames: unknown
): string {
  return [
    clean(firstNames),
    clean(lastNames),
  ]
    .filter(Boolean)
    .join(" ");
}

async function getUniqueInternalEmail({
  supabaseAdmin,
  firstNames,
  lastNames,
  type,
  currentProfileId,
}: {
  supabaseAdmin: SupabaseAdmin;
  firstNames: string;
  lastNames: string;
  type: InternalAccountType;
  currentProfileId?: string | null;
}): Promise<string> {
  const baseEmail =
    createInternalEmailBase({
      firstNames,
      lastNames,
      type,
    });

  for (
    let number = 1;
    number <= 999;
    number += 1
  ) {
    const candidate =
      addNumberToInternalEmail(
        baseEmail,
        number
      );

    const { data, error } =
      await supabaseAdmin
        .from("internal_email_registry")
        .select(
          "profile_id, internal_email"
        )
        .ilike(
          "internal_email",
          candidate
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Het interne e-mailadres kon niet gecontroleerd worden: ${error.message}`
      );
    }

    if (!data) {
      return candidate;
    }

    if (
      currentProfileId &&
      data.profile_id === currentProfileId
    ) {
      return candidate;
    }
  }

  throw new Error(
    "Er kon geen uniek intern e-mailadres worden gemaakt."
  );
}

async function registerInternalEmail({
  supabaseAdmin,
  internalEmail,
  profileType,
  profileId,
}: {
  supabaseAdmin: SupabaseAdmin;
  internalEmail: string;
  profileType: InternalAccountType;
  profileId: string;
}): Promise<void> {
  const { error } =
    await supabaseAdmin
      .from("internal_email_registry")
      .upsert(
        {
          internal_email:
            internalEmail,
          profile_type:
            profileType,
          profile_id:
            profileId,
        },
        {
          onConflict:
            "internal_email",
        }
      );

  if (error) {
    throw new Error(
      `Het interne e-mailadres kon niet geregistreerd worden: ${error.message}`
    );
  }
}

async function ensureParentProfile({
  supabaseAdmin,
  firstName,
  lastName,
  email,
  phone,
  address,
}: {
  supabaseAdmin: SupabaseAdmin;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string | null;
}) {
  const normalizedEmail =
    normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error(
      "Het e-mailadres van de ouder ontbreekt."
    );
  }

  const { data: existingProfile, error: lookupError } =
    await supabaseAdmin
      .from("customer_profiles")
      .select("*")
      .ilike(
        "email",
        normalizedEmail
      )
      .maybeSingle();

  if (lookupError) {
    throw new Error(
      `Het ouderprofiel kon niet worden opgezocht: ${lookupError.message}`
    );
  }

  const parentFullName =
    fullName(
      firstName,
      lastName
    );

  if (existingProfile) {
    let internalEmail =
      clean(
        existingProfile.internal_email
      );

    if (!internalEmail) {
      internalEmail =
        await getUniqueInternalEmail({
          supabaseAdmin,
          firstNames:
            firstName,
          lastNames:
            lastName,
          type: "parent",
          currentProfileId:
            existingProfile.id,
        });
    }

    const { data: updatedProfile, error: updateError } =
      await supabaseAdmin
        .from("customer_profiles")
        .update({
          first_name:
            firstName || null,
          last_name:
            lastName || null,
          full_name:
            parentFullName || null,
          parent_name:
            parentFullName || null,
          phone:
            phone || existingProfile.phone || null,
          address:
            address ||
            existingProfile.address ||
            null,
          internal_email:
            internalEmail,
          account_status:
            existingProfile.auth_user_id
              ? "active"
              : "pending_activation",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          existingProfile.id
        )
        .select("*")
        .single();

    if (
      updateError ||
      !updatedProfile
    ) {
      throw new Error(
        `Het ouderprofiel kon niet worden bijgewerkt: ${
          updateError?.message ||
          "onbekende fout"
        }`
      );
    }

    await registerInternalEmail({
      supabaseAdmin,
      internalEmail,
      profileType: "parent",
      profileId:
        updatedProfile.id,
    });

    return updatedProfile;
  }

  const internalEmail =
    await getUniqueInternalEmail({
      supabaseAdmin,
      firstNames:
        firstName,
      lastNames:
        lastName,
      type: "parent",
    });

  const { data: createdProfile, error: insertError } =
    await supabaseAdmin
      .from("customer_profiles")
      .insert({
        email:
          normalizedEmail,
        first_name:
          firstName || null,
        last_name:
          lastName || null,
        full_name:
          parentFullName || null,
        parent_name:
          parentFullName || null,
        phone:
          phone || null,
        address:
          address || null,
        internal_email:
          internalEmail,
        account_status:
          "pending_activation",
        updated_at:
          new Date().toISOString(),
      })
      .select("*")
      .single();

  if (
    insertError ||
    !createdProfile
  ) {
    throw new Error(
      `Het ouderprofiel kon niet worden aangemaakt: ${
        insertError?.message ||
        "onbekende fout"
      }`
    );
  }

  await registerInternalEmail({
    supabaseAdmin,
    internalEmail,
    profileType: "parent",
    profileId:
      createdProfile.id,
  });

  return createdProfile;
}

async function findExistingStudent({
  supabaseAdmin,
  firstNames,
  lastNames,
  birthDate,
  parentEmail,
}: {
  supabaseAdmin: SupabaseAdmin;
  firstNames: string;
  lastNames: string;
  birthDate: string;
  parentEmail: string;
}) {
  const studentName =
    fullName(
      firstNames,
      lastNames
    );

  let query =
    supabaseAdmin
      .from("students")
      .select("*")
      .ilike(
        "parent_email",
        normalizeEmail(
          parentEmail
        )
      )
      .ilike(
        "name",
        studentName
      );

  if (birthDate) {
    query = query.eq(
      "birth_date",
      birthDate
    );
  }

  const { data, error } =
    await query.maybeSingle();

  if (error) {
    throw new Error(
      `De leerling kon niet worden opgezocht: ${error.message}`
    );
  }

  return data;
}

async function ensureStudent({
  supabaseAdmin,
  participant,
  parentProfile,
}: {
  supabaseAdmin: SupabaseAdmin;
  participant: ParticipantRow;
  parentProfile: any;
}) {
  const firstNames =
    clean(
      participant.first_names
    );

  const lastNames =
    clean(
      participant.last_names
    );

  const studentName =
    fullName(
      firstNames,
      lastNames
    );

  const parentEmail =
    normalizeEmail(
      participant.parent_email
    );

  const existingStudent =
    await findExistingStudent({
      supabaseAdmin,
      firstNames,
      lastNames,
      birthDate:
        clean(
          participant.birth_date
        ),
      parentEmail,
    });

  if (existingStudent) {
    let internalEmail =
      clean(
        existingStudent.internal_email
      );

    if (!internalEmail) {
      internalEmail =
        await getUniqueInternalEmail({
          supabaseAdmin,
          firstNames,
          lastNames,
          type: "student",
          currentProfileId:
            existingStudent.id,
        });
    }

    const { data: updatedStudent, error: updateError } =
      await supabaseAdmin
        .from("students")
        .update({
          name:
            studentName,
          first_names:
            firstNames,
          last_names:
            lastNames,
          birth_date:
            participant.birth_date ||
            null,
          parent_email:
            parentEmail,
          parent_profile_id:
            parentProfile.id,
          internal_email:
            internalEmail,
          school:
            participant.school ||
            null,
          grade:
            participant.grade ||
            null,
          education_level:
            participant.education_level ||
            null,
          secondary_track:
            participant.study_program ||
            null,
          study_program:
            participant.study_program ||
            null,
          school_contact_name:
            participant.school_contact_name ||
            null,
          school_contact_email:
            participant.school_contact_email ||
            null,
          school_contact_phone:
            participant.school_contact_phone ||
            null,
          learning_goal:
            participant.learning_goal ||
            null,
          goals:
            participant.learning_goal ||
            existingStudent.goals ||
            null,
          active: true,
          account_status:
            existingStudent.auth_user_id
              ? "active"
              : "pending_activation",
        })
        .eq(
          "id",
          existingStudent.id
        )
        .select("*")
        .single();

    if (
      updateError ||
      !updatedStudent
    ) {
      throw new Error(
        `De leerling kon niet worden bijgewerkt: ${
          updateError?.message ||
          "onbekende fout"
        }`
      );
    }

    await registerInternalEmail({
      supabaseAdmin,
      internalEmail,
      profileType: "student",
      profileId:
        updatedStudent.id,
    });

    return updatedStudent;
  }

  const internalEmail =
    await getUniqueInternalEmail({
      supabaseAdmin,
      firstNames,
      lastNames,
      type: "student",
    });

  const { data: createdStudent, error: insertError } =
    await supabaseAdmin
      .from("students")
      .insert({
        name:
          studentName,
        first_names:
          firstNames,
        last_names:
          lastNames,
        birth_date:
          participant.birth_date ||
          null,
        parent_email:
          parentEmail,
        parent_profile_id:
          parentProfile.id,
        internal_email:
          internalEmail,
        school:
          participant.school ||
          null,
        grade:
          participant.grade ||
          null,
        education_level:
          participant.education_level ||
          null,
        secondary_track:
          participant.study_program ||
          null,
        study_program:
          participant.study_program ||
          null,
        school_contact_name:
          participant.school_contact_name ||
          null,
        school_contact_email:
          participant.school_contact_email ||
          null,
        school_contact_phone:
          participant.school_contact_phone ||
          null,
        learning_goal:
          participant.learning_goal ||
          null,
        goals:
          participant.learning_goal ||
          null,
        active: true,
        account_status:
          "pending_activation",
      })
      .select("*")
      .single();

  if (
    insertError ||
    !createdStudent
  ) {
    throw new Error(
      `De leerling kon niet worden aangemaakt: ${
        insertError?.message ||
        "onbekende fout"
      }`
    );
  }

  await registerInternalEmail({
    supabaseAdmin,
    internalEmail,
    profileType: "student",
    profileId:
      createdStudent.id,
  });

  return createdStudent;
}

export async function fulfillAppointmentOrder({
  supabaseAdmin,
  paymentId,
  metadata,
}: FulfillAppointmentOrderArguments) {
  const appointmentOrderId =
    clean(
      metadata.appointmentOrderId
    );

  const checkoutId =
    clean(
      metadata.checkoutId
    );

  if (
    !appointmentOrderId &&
    !checkoutId
  ) {
    throw new Error(
      "De afspraakbestelling bevat geen geldige orderreferentie."
    );
  }

  let orderQuery =
    supabaseAdmin
      .from("appointment_orders")
      .select("*");

  if (appointmentOrderId) {
    orderQuery =
      orderQuery.eq(
        "id",
        appointmentOrderId
      );
  } else {
    orderQuery =
      orderQuery.eq(
        "checkout_id",
        checkoutId
      );
  }

  const { data: order, error: orderError } =
    await orderQuery.maybeSingle();

  if (
    orderError ||
    !order
  ) {
    throw new Error(
      `De afspraakbestelling werd niet gevonden: ${
        orderError?.message ||
        "onbekende bestelling"
      }`
    );
  }

  /*
   * Webhooks kunnen meermaals worden verstuurd.
   * Een reeds verwerkte bestelling mag niet dubbel
   * ouders of leerlingen aanmaken.
   */
  if (
    order.fulfilled_at &&
    order.payment_status ===
      "paid"
  ) {
    return {
      duplicate: true,
      orderId: order.id,
      purchaserProfileId:
        order.purchaser_profile_id ||
        null,
    };
  }

  const { data: participants, error: participantError } =
    await supabaseAdmin
      .from(
        "appointment_order_participants"
      )
      .select("*")
      .eq(
        "order_id",
        order.id
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

  if (participantError) {
    throw new Error(
      `De deelnemers konden niet geladen worden: ${participantError.message}`
    );
  }

  if (
    !participants ||
    participants.length === 0
  ) {
    throw new Error(
      "Er zijn geen leerlingen aan deze bestelling gekoppeld."
    );
  }

  /*
   * De koper wordt als hoofdklant aangemaakt.
   * De kennismaking wordt niet per order opnieuw toegekend.
   * De beschikbaarheid wordt later bepaald via:
   * customer_profiles.introduction_used_at IS NULL.
   */
  const purchaserProfile =
    await ensureParentProfile({
      supabaseAdmin,
      firstName:
        clean(
          order.purchaser_first_name
        ),
      lastName:
        clean(
          order.purchaser_last_name
        ),
      email:
        normalizeEmail(
          order.purchaser_email
        ),
      phone:
        clean(
          order.purchaser_phone
        ),
      address:
        clean(
          order.purchaser_address
        ) || null,
    });

  const processedStudents: any[] =
    [];

  const processedParents =
    new Map<string, any>();

  processedParents.set(
    normalizeEmail(
      purchaserProfile.email
    ),
    purchaserProfile
  );
  const accountActivationResults: Array<{
  profileId: string;
  email: string;
  invited: boolean;
  alreadyLinked: boolean;
  userId: string | null;
}> = [];

const purchaserActivation =
  await ensureParentAccountActivation({
    supabaseAdmin,
    profile: purchaserProfile,
  });

accountActivationResults.push({
  profileId: purchaserProfile.id,
  email: normalizeEmail(purchaserProfile.email),
  invited: purchaserActivation.invited,
  alreadyLinked: purchaserActivation.alreadyLinked,
  userId: purchaserActivation.userId,
});

  for (
    const participant of participants as ParticipantRow[]
  ) {
    const participantParentEmail =
      normalizeEmail(
        participant.parent_email
      );

    let parentProfile =
      processedParents.get(
        participantParentEmail
      );

if (!parentProfile) {
  parentProfile =
    await ensureParentProfile({
      supabaseAdmin,
      firstName: clean(
        participant.parent_first_name
      ),
      lastName: clean(
        participant.parent_last_name
      ),
      email: participantParentEmail,
      phone: clean(
        participant.parent_phone
      ),
      address: null,
    });

  processedParents.set(
    participantParentEmail,
    parentProfile
  );

  const parentActivation =
    await ensureParentAccountActivation({
      supabaseAdmin,
      profile: parentProfile,
    });

  accountActivationResults.push({
    profileId: parentProfile.id,
    email: normalizeEmail(parentProfile.email),
    invited: parentActivation.invited,
    alreadyLinked: parentActivation.alreadyLinked,
    userId: parentActivation.userId,
  });
}
    const student =
      await ensureStudent({
        supabaseAdmin,
        participant,
        parentProfile,
      });

    processedStudents.push(
      student
    );

    const {
      error:
        participantUpdateError,
    } = await supabaseAdmin
      .from(
        "appointment_order_participants"
      )
      .update({
        student_id:
          student.id,
        parent_profile_id:
          parentProfile.id,
        fulfilled_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        participant.id
      );

    if (
      participantUpdateError
    ) {
      throw new Error(
        `De koppeling met leerling ${student.name} kon niet worden opgeslagen: ${participantUpdateError.message}`
      );
    }
  }

  const now =
    new Date().toISOString();

  const {
    data: updatedOrder,
    error: orderUpdateError,
  } = await supabaseAdmin
    .from(
      "appointment_orders"
    )
    .update({
      mollie_payment_id:
        paymentId,
      payment_status:
        "paid",
      booking_status:
        "awaiting_booking",

      /*
       * Dit veld betekent alleen dat de aankoop
       * normaal recht geeft op de kennismakingsflow.
       * De definitieve controle gebeurt op klantniveau:
       * purchaserProfile.introduction_used_at.
       */
      introduction_allowed:
        !purchaserProfile.introduction_used_at,

      purchaser_profile_id:
        purchaserProfile.id,

      paid_at:
        order.paid_at || now,
      fulfilled_at:
        now,
      fulfillment_error:
        null,
      updated_at:
        now,
    })
    .eq(
      "id",
      order.id
    )
    .select("*")
    .single();

  if (
    orderUpdateError ||
    !updatedOrder
  ) {
    throw new Error(
      `De betaalde afspraakbestelling kon niet worden bijgewerkt: ${
        orderUpdateError?.message ||
        "onbekende fout"
      }`
    );
  }

  return {
    duplicate: false,
    orderId:
      updatedOrder.id,
    checkoutId:
      updatedOrder.checkout_id,
    purchaserProfileId:
      purchaserProfile.id,
    introductionAvailable:
      !purchaserProfile.introduction_used_at,
    students:
      processedStudents.map(
        (student) => ({
          id: student.id,
          name: student.name,
          internalEmail:
            student.internal_email,
          parentEmail:
            student.parent_email,
        })
      ),
    parents:
      Array.from(
        processedParents.values()
      ).map((parent) => ({
        id: parent.id,
        email: parent.email,
        internalEmail:
          parent.internal_email,
      })),
      accountActivations:
  accountActivationResults,
  };
}