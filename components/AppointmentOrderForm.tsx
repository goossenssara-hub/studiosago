"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

type BookingType =
  | "individual"
  | "group";

type EducationLevel =
  | "primary"
  | "secondary";

type DeliveryType =
  | "digital"
  | "home";

type Props = {
  bookingType: BookingType;
  educationLevel: EducationLevel;
};

type PurchaserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

type ParticipantData = {
  id: string;

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

  usePurchaserData: boolean;
};

type CheckoutResponse = {
  success?: boolean;
  checkoutUrl?: string;
  redirectUrl?: string;
  url?: string;
  error?: string;
};

const PRIMARY_GRADES = [
  "1e leerjaar",
  "2e leerjaar",
  "3e leerjaar",
  "4e leerjaar",
  "5e leerjaar",
  "6e leerjaar",
] as const;

const SECONDARY_GRADES = [
  "1e middelbaar",
  "2e middelbaar",
  "3e middelbaar",
  "4e middelbaar",
  "5e middelbaar",
  "6e middelbaar",
] as const;

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

function createEmptyParticipant(
  index: number
): ParticipantData {
  return {
    id: `${Date.now()}-${index}-${Math.random()}`,

    firstNames: "",
    lastNames: "",
    birthDate: "",

    grade: "",
    studyProgram: "",
    school: "",

    schoolContactName: "",
    schoolContactEmail: "",
    schoolContactPhone: "",

    learningGoal: "",

    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhone: "",

    usePurchaserData:
      index === 0,
  };
}

function cleanAliasPart(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /['’`]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      ""
    );
}

function makeStudentAliasPreview(
  participant: ParticipantData
): string {
  const firstName =
    cleanAliasPart(
      participant.firstNames
        .trim()
        .split(/\s+/)[0] ?? ""
    );

  const lastNames =
    participant.lastNames
      .trim()
      .split(/\s+/)
      .map(cleanAliasPart)
      .filter(Boolean)
      .join("");

  if (
    !firstName ||
    !lastNames
  ) {
    return "";
  }

  return `${firstName}.${lastNames}@leerling.studiosago.be`;
}

function makeParentAliasPreview({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}): string {
  const first =
    cleanAliasPart(
      firstName
    );

  const last =
    lastName
      .trim()
      .split(/\s+/)
      .map(cleanAliasPart)
      .filter(Boolean)
      .join("");

  if (!first || !last) {
    return "";
  }

  return `${first}.${last}@ouder.studiosago.be`;
}

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "nl-BE",
    {
      style: "currency",
      currency: "EUR",
    }
  ).format(value);
}

function isValidEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

async function readJson<T>(
  response: Response
): Promise<T> {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    throw new Error(
      "De server gaf geen geldig antwoord terug."
    );
  }

  return (
    await response.json()
  ) as T;
}

export default function AppointmentOrderForm({
  bookingType,
  educationLevel,
}: Props) {
  const isGroup =
    bookingType === "group";

  const isSecondary =
    educationLevel ===
    "secondary";

  const [
    participantCount,
    setParticipantCount,
  ] = useState(
    isGroup ? 2 : 1
  );

  const [
    participants,
    setParticipants,
  ] = useState<
    ParticipantData[]
  >(() =>
    Array.from(
      {
        length:
          isGroup ? 2 : 1,
      },
      (_, index) =>
        createEmptyParticipant(
          index
        )
    )
  );

  const [
    purchaser,
    setPurchaser,
  ] = useState<PurchaserData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [
    deliveryType,
    setDeliveryType,
  ] = useState<DeliveryType>(
    "digital"
  );

  const [
    radiusAccepted,
    setRadiusAccepted,
  ] = useState(false);

  const [
    termsAccepted,
    setTermsAccepted,
  ] = useState(false);

  const [
    privacyAccepted,
    setPrivacyAccepted,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const pricePerParticipant =
    PRICE_CONFIG[
      bookingType
    ][educationLevel];

  const totalAmount =
    pricePerParticipant *
    participantCount;

  const title = isGroup
    ? "Begeleiding in kleine groep"
    : "Individuele begeleiding";

  const levelLabel =
    isSecondary
      ? "Secundair onderwijs"
      : "Lager onderwijs";

  const gradeOptions =
    isSecondary
      ? SECONDARY_GRADES
      : PRIMARY_GRADES;

  const purchaserAlias =
    useMemo(
      () =>
        makeParentAliasPreview({
          firstName:
            purchaser.firstName,
          lastName:
            purchaser.lastName,
        }),
      [
        purchaser.firstName,
        purchaser.lastName,
      ]
    );

  function updatePurchaser<
    Key extends keyof PurchaserData,
  >(
    key: Key,
    value: PurchaserData[Key]
  ) {
    setPurchaser(
      (current) => ({
        ...current,
        [key]: value,
      })
    );

    setParticipants(
      (current) =>
        current.map(
          (participant) => {
            if (
              !participant.usePurchaserData
            ) {
              return participant;
            }

            return {
              ...participant,

              parentFirstName:
                key ===
                "firstName"
                  ? String(value)
                  : purchaser.firstName,

              parentLastName:
                key ===
                "lastName"
                  ? String(value)
                  : purchaser.lastName,

              parentEmail:
                key === "email"
                  ? String(value)
                  : purchaser.email,

              parentPhone:
                key === "phone"
                  ? String(value)
                  : purchaser.phone,
            };
          }
        )
    );
  }

  function updateParticipant<
    Key extends keyof ParticipantData,
  >(
    participantId: string,
    key: Key,
    value: ParticipantData[Key]
  ) {
    setParticipants(
      (current) =>
        current.map(
          (participant) =>
            participant.id ===
            participantId
              ? {
                  ...participant,
                  [key]: value,
                }
              : participant
        )
    );
  }

  function togglePurchaserData(
    participantId: string,
    checked: boolean
  ) {
    setParticipants(
      (current) =>
        current.map(
          (participant) => {
            if (
              participant.id !==
              participantId
            ) {
              return participant;
            }

            if (!checked) {
              return {
                ...participant,
                usePurchaserData:
                  false,
              };
            }

            return {
              ...participant,
              usePurchaserData:
                true,

              parentFirstName:
                purchaser.firstName,

              parentLastName:
                purchaser.lastName,

              parentEmail:
                purchaser.email,

              parentPhone:
                purchaser.phone,
            };
          }
        )
    );
  }

  function changeParticipantCount(
    nextCount: number
  ) {
    const safeCount =
      Math.max(
        2,
        Math.min(
          5,
          nextCount
        )
      );

    setParticipantCount(
      safeCount
    );

    setParticipants(
      (current) => {
        if (
          current.length ===
          safeCount
        ) {
          return current;
        }

        if (
          current.length >
          safeCount
        ) {
          return current.slice(
            0,
            safeCount
          );
        }

        const additions =
          Array.from(
            {
              length:
                safeCount -
                current.length,
            },
            (_, index) =>
              createEmptyParticipant(
                current.length +
                  index
              )
          );

        return [
          ...current,
          ...additions,
        ];
      }
    );
  }

  function validateForm():
    | string
    | null {
    if (
      !purchaser.firstName.trim() ||
      !purchaser.lastName.trim()
    ) {
      return "Vul de voornaam en familienaam van de koper in.";
    }

    if (
      !isValidEmail(
        purchaser.email
      )
    ) {
      return "Vul een geldig e-mailadres van de koper in.";
    }

    if (
      !purchaser.phone.trim()
    ) {
      return "Vul het telefoonnummer van de koper in.";
    }

    if (
      deliveryType ===
        "home" &&
      !purchaser.address.trim()
    ) {
      return "Vul het volledige adres voor begeleiding aan huis in.";
    }

    if (
      deliveryType ===
        "home" &&
      !radiusAccepted
    ) {
      return "Bevestig dat het adres binnen 15 km rond Peer ligt.";
    }

    if (
      isGroup &&
      (
        participantCount < 2 ||
        participantCount > 5
      )
    ) {
      return "Een groep bestaat uit minimaal 2 en maximaal 5 leerlingen.";
    }

    for (
      let index = 0;
      index <
      participants.length;
      index += 1
    ) {
      const participant =
        participants[index];

      const number =
        index + 1;

      if (
        !participant.firstNames.trim() ||
        !participant.lastNames.trim()
      ) {
        return `Vul de volledige naam van leerling ${number} in.`;
      }

      if (
        !participant.birthDate
      ) {
        return `Vul de geboortedatum van leerling ${number} in.`;
      }

      if (
        !participant.grade
      ) {
        return `Kies het leerjaar van leerling ${number}.`;
      }

      if (
        isSecondary &&
        !participant.studyProgram.trim()
      ) {
        return `Vul de studierichting van leerling ${number} in.`;
      }

      if (
        !participant.school.trim()
      ) {
        return `Vul de school van leerling ${number} in.`;
      }

      if (
        !participant.schoolContactName.trim()
      ) {
        return `Vul de naam van de betrokken leerkracht of schoolcontactpersoon van leerling ${number} in.`;
      }

      if (
        participant.schoolContactEmail.trim() &&
        !isValidEmail(
          participant.schoolContactEmail
        )
      ) {
        return `Vul een geldig e-mailadres in voor de schoolcontactpersoon van leerling ${number}.`;
      }

      if (
        !participant.learningGoal.trim()
      ) {
        return `Vul de hulpvraag of het leerdoel van leerling ${number} in.`;
      }

      if (
        !participant.parentFirstName.trim() ||
        !participant.parentLastName.trim()
      ) {
        return `Vul de naam van de ouder of voogd van leerling ${number} in.`;
      }

      if (
        !isValidEmail(
          participant.parentEmail
        )
      ) {
        return `Vul een geldig e-mailadres van de ouder van leerling ${number} in.`;
      }

      if (
        !participant.parentPhone.trim()
      ) {
        return `Vul het telefoonnummer van de ouder van leerling ${number} in.`;
      }
    }

    if (!termsAccepted) {
      return "Je moet akkoord gaan met de boekings- en annuleringsvoorwaarden.";
    }

    if (!privacyAccepted) {
      return "Je moet akkoord gaan met de verwerking van de ingevulde gegevens.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setErrorMessage(
        validationError
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/appointment-orders/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                bookingType,
                educationLevel,

                deliveryType,

                durationMinutes:
                  60,

                participantCount,

                pricePerParticipant,

                totalAmount,

                purchaser: {
                  firstName:
                    purchaser.firstName.trim(),

                  lastName:
                    purchaser.lastName.trim(),

                  email:
                    purchaser.email
                      .trim()
                      .toLowerCase(),

                  phone:
                    purchaser.phone.trim(),

                  address:
                    deliveryType ===
                    "home"
                      ? purchaser.address.trim()
                      : "",
                },

                participants:
                  participants.map(
                    (participant) => ({
                      firstNames:
                        participant.firstNames.trim(),

                      lastNames:
                        participant.lastNames.trim(),

                      birthDate:
                        participant.birthDate,

                      grade:
                        participant.grade,

                      studyProgram:
                        isSecondary
                          ? participant.studyProgram.trim()
                          : "",

                      school:
                        participant.school.trim(),

                      schoolContactName:
                        participant.schoolContactName.trim(),

                      schoolContactEmail:
                        participant.schoolContactEmail
                          .trim()
                          .toLowerCase(),

                      schoolContactPhone:
                        participant.schoolContactPhone.trim(),

                      learningGoal:
                        participant.learningGoal.trim(),

                      parentFirstName:
                        participant.parentFirstName.trim(),

                      parentLastName:
                        participant.parentLastName.trim(),

                      parentEmail:
                        participant.parentEmail
                          .trim()
                          .toLowerCase(),

                      parentPhone:
                        participant.parentPhone.trim(),
                    })
                  ),

                radiusAccepted:
                  deliveryType ===
                  "home"
                    ? radiusAccepted
                    : true,

                termsAccepted,
                privacyAccepted,
              }),
          }
        );

      const result =
        await readJson<CheckoutResponse>(
          response
        );

      if (!response.ok) {
        throw new Error(
          result.error ||
            "De betaling kon niet gestart worden."
        );
      }

      const checkoutUrl =
        result.checkoutUrl ||
        result.redirectUrl ||
        result.url;

      if (!checkoutUrl) {
        throw new Error(
          "Er werd geen geldige betaalpagina ontvangen."
        );
      }

      window.location.href =
        checkoutUrl;
    } catch (error) {
      console.error(
        "APPOINTMENT ORDER CHECKOUT ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Er ging iets mis bij het verwerken van de aanvraag."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="appointment-order-page">
      <section className="appointment-order-shell">
        <header className="appointment-order-header">
          <div>
            <p className="appointment-order-eyebrow">
              Gegevens invullen
            </p>

            <h1>{title}</h1>

            <p>
              {levelLabel} ·
              60 minuten
            </p>
          </div>

          <aside className="appointment-order-price-card">
            <span>
              {isGroup
                ? "Totaalprijs"
                : "Prijs per sessie"}
            </span>

            <strong>
              {formatCurrency(
                totalAmount
              )}
            </strong>

            {isGroup && (
              <small>
                {participantCount} ×{" "}
                {formatCurrency(
                  pricePerParticipant
                )}
              </small>
            )}
          </aside>
        </header>

        {errorMessage && (
          <div
            className="appointment-order-error"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <form
          className="appointment-order-form"
          onSubmit={
            handleSubmit
          }
        >
          <section className="appointment-order-card">
            <div className="appointment-order-section-heading">
              <span>1</span>

              <div>
                <h2>
                  Gegevens van de koper
                </h2>

                <p>
                  Dit e-mailadres wordt
                  gebruikt voor de
                  betaling, bevestiging en
                  beveiligde
                  accountactivatie.
                </p>
              </div>
            </div>

            <div className="appointment-order-grid">
              <label className="appointment-order-field">
                <span>
                  Voornaam *
                </span>

                <input
                  type="text"
                  value={
                    purchaser.firstName
                  }
                  onChange={(
                    event
                  ) =>
                    updatePurchaser(
                      "firstName",
                      event.target.value
                    )
                  }
                  autoComplete="given-name"
                  required
                />
              </label>

              <label className="appointment-order-field">
                <span>
                  Familienaam *
                </span>

                <input
                  type="text"
                  value={
                    purchaser.lastName
                  }
                  onChange={(
                    event
                  ) =>
                    updatePurchaser(
                      "lastName",
                      event.target.value
                    )
                  }
                  autoComplete="family-name"
                  required
                />
              </label>

              <label className="appointment-order-field">
                <span>
                  Echt e-mailadres *
                </span>

                <input
                  type="email"
                  value={
                    purchaser.email
                  }
                  onChange={(
                    event
                  ) =>
                    updatePurchaser(
                      "email",
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  required
                />
              </label>

              <label className="appointment-order-field">
                <span>
                  Telefoonnummer *
                </span>

                <input
                  type="tel"
                  value={
                    purchaser.phone
                  }
                  onChange={(
                    event
                  ) =>
                    updatePurchaser(
                      "phone",
                      event.target.value
                    )
                  }
                  autoComplete="tel"
                  required
                />
              </label>

              {purchaserAlias && (
                <div className="appointment-order-alias-preview appointment-order-full">
                  <span>
                    Intern ouderadres
                  </span>

                  <strong>
                    {purchaserAlias}
                  </strong>

                  <small>
                    Dit wordt later
                    automatisch aangemaakt.
                    Bij een dubbele naam
                    wordt een nummer
                    toegevoegd.
                  </small>
                </div>
              )}
            </div>
          </section>

          <section className="appointment-order-card">
            <div className="appointment-order-section-heading">
              <span>2</span>

              <div>
                <h2>
                  Type begeleiding
                </h2>

                <p>
                  Kies digitaal of
                  begeleiding aan huis.
                </p>
              </div>
            </div>

            <div className="appointment-order-choice-grid">
              <button
                type="button"
                className={`appointment-order-choice ${
                  deliveryType ===
                  "digital"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setDeliveryType(
                    "digital"
                  );

                  setRadiusAccepted(
                    false
                  );
                }}
              >
                <span aria-hidden="true">
                  💻
                </span>

                <strong>
                  Digitaal
                </strong>

                <small>
                  Begeleiding via
                  Google Meet.
                </small>
              </button>

              <button
                type="button"
                className={`appointment-order-choice ${
                  deliveryType ===
                  "home"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setDeliveryType(
                    "home"
                  )
                }
              >
                <span aria-hidden="true">
                  🏠
                </span>

                <strong>
                  Aan huis
                </strong>

                <small>
                  Binnen 15 km rond
                  Peer.
                </small>
              </button>
            </div>

            {deliveryType ===
              "home" && (
              <div className="appointment-order-home-fields">
                <label className="appointment-order-field">
                  <span>
                    Volledig adres *
                  </span>

                  <input
                    type="text"
                    value={
                      purchaser.address
                    }
                    onChange={(
                      event
                    ) =>
                      updatePurchaser(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="Straat, nummer, postcode en gemeente"
                    autoComplete="street-address"
                    required
                  />
                </label>

                <label className="appointment-order-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      radiusAccepted
                    }
                    onChange={(
                      event
                    ) =>
                      setRadiusAccepted(
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    Ik bevestig dat dit
                    adres binnen 15 km
                    rond Peer ligt.
                  </span>
                </label>
              </div>
            )}
          </section>

          {isGroup && (
            <section className="appointment-order-card">
              <div className="appointment-order-section-heading">
                <span>3</span>

                <div>
                  <h2>
                    Aantal leerlingen
                  </h2>

                  <p>
                    Een groep bestaat
                    uit minimaal 2 en
                    maximaal 5
                    leerlingen.
                  </p>
                </div>
              </div>

              <div className="appointment-order-count-options">
                {[2, 3, 4, 5].map(
                  (count) => (
                    <button
                      key={count}
                      type="button"
                      className={
                        participantCount ===
                        count
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        changeParticipantCount(
                          count
                        )
                      }
                    >
                      {count}
                    </button>
                  )
                )}
              </div>

              <div className="appointment-order-total-box">
                <span>
                  {participantCount}{" "}
                  leerlingen ×{" "}
                  {formatCurrency(
                    pricePerParticipant
                  )}
                </span>

                <strong>
                  {formatCurrency(
                    totalAmount
                  )}
                </strong>
              </div>
            </section>
          )}

          <section className="appointment-order-participants">
            {participants.map(
              (
                participant,
                index
              ) => {
                const studentAlias =
                  makeStudentAliasPreview(
                    participant
                  );

                const parentAlias =
                  makeParentAliasPreview({
                    firstName:
                      participant.parentFirstName,
                    lastName:
                      participant.parentLastName,
                  });

                return (
                  <article
                    key={
                      participant.id
                    }
                    className="appointment-order-card appointment-order-student-card"
                  >
                    <div className="appointment-order-section-heading">
                      <span>
                        {isGroup
                          ? index + 4
                          : 3}
                      </span>

                      <div>
                        <h2>
                          {isGroup
                            ? `Leerling ${
                                index +
                                1
                              }`
                            : "Gegevens van de leerling"}
                        </h2>

                        <p>
                          Vul de
                          leerling-,
                          school- en
                          oudergegevens
                          volledig in.
                        </p>
                      </div>
                    </div>

                    <div className="appointment-order-subheading">
                      <h3>
                        Leerling
                      </h3>
                    </div>

                    <div className="appointment-order-grid">
                      <label className="appointment-order-field">
                        <span>
                          Voornaam en
                          eventuele tweede
                          voornamen *
                        </span>

                        <input
                          type="text"
                          value={
                            participant.firstNames
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "firstNames",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder=""
                          required
                        />
                      </label>

                      <label className="appointment-order-field">
                        <span>
                          Familienaam of
                          familienamen *
                        </span>

                        <input
                          type="text"
                          value={
                            participant.lastNames
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "lastNames",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder=""
                          required
                        />
                      </label>

                      <label className="appointment-order-field">
                        <span>
                          Geboortedatum *
                        </span>

                        <input
                          type="date"
                          value={
                            participant.birthDate
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "birthDate",
                              event
                                .target
                                .value
                            )
                          }
                          max={new Date()
                            .toISOString()
                            .split(
                              "T"
                            )[0]}
                          required
                        />
                      </label>

                      <label className="appointment-order-field">
                        <span>
                          {isSecondary
                            ? "Studiejaar *"
                            : "Leerjaar *"}
                        </span>

                        <select
                          value={
                            participant.grade
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "grade",
                              event
                                .target
                                .value
                            )
                          }
                          required
                        >
                          <option value="">
                            Kies een
                            studiejaar
                          </option>

                          {gradeOptions.map(
                            (
                              grade
                            ) => (
                              <option
                                key={
                                  grade
                                }
                                value={
                                  grade
                                }
                              >
                                {grade}
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      {isSecondary && (
                        <label className="appointment-order-field appointment-order-full">
                          <span>
                            Studierichting *
                          </span>

                          <input
                            type="text"
                            value={
                              participant.studyProgram
                            }
                            onChange={(
                              event
                            ) =>
                              updateParticipant(
                                participant.id,
                                "studyProgram",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Bijvoorbeeld Moderne talen en wetenschappen"
                            required
                          />
                        </label>
                      )}

                      <label className="appointment-order-field appointment-order-full">
                        <span>
                          School *
                        </span>

                        <input
                          type="text"
                          value={
                            participant.school
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "school",
                              event
                                .target
                                .value
                            )
                          }
                          required
                        />
                      </label>

                      {studentAlias && (
                        <div className="appointment-order-alias-preview appointment-order-full">
                          <span>
                            Intern
                            leerlingadres
                          </span>

                          <strong>
                            {studentAlias}
                          </strong>

                          <small>
                            Voorbeeld:
                            Emma Charlotte
                            Gielen Goossens
                            wordt
                            emma.gielengoossens@leerling.studiosago.be.
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="appointment-order-subheading">
                      <h3>
                        Betrokken
                        leerkracht of
                        schoolcontactpersoon
                      </h3>
                    </div>

                    <div className="appointment-order-grid">
                      <label className="appointment-order-field">
                        <span>
                          Naam *
                        </span>

                        <input
                          type="text"
                          value={
                            participant.schoolContactName
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "schoolContactName",
                              event
                                .target
                                .value
                            )
                          }
                          required
                        />
                      </label>

                      <label className="appointment-order-field">
                        <span>
                          E-mailadres
                        </span>

                        <input
                          type="email"
                          value={
                            participant.schoolContactEmail
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "schoolContactEmail",
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </label>

                      <label className="appointment-order-field">
                        <span>
                          Telefoonnummer
                        </span>

                        <input
                          type="tel"
                          value={
                            participant.schoolContactPhone
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "schoolContactPhone",
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </label>

                      <label className="appointment-order-field appointment-order-full">
                        <span>
                          Hulpvraag of
                          leerdoel *
                        </span>

                        <textarea
                          rows={4}
                          value={
                            participant.learningGoal
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "learningGoal",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Waarbij heeft deze leerling ondersteuning nodig?"
                          required
                        />
                      </label>
                    </div>

                    <div className="appointment-order-subheading">
                      <h3>
                        Ouder of voogd
                      </h3>
                    </div>

                    <label className="appointment-order-checkbox appointment-order-purchaser-toggle">
                      <input
                        type="checkbox"
                        checked={
                          participant.usePurchaserData
                        }
                        onChange={(
                          event
                        ) =>
                          togglePurchaserData(
                            participant.id,
                            event
                              .target
                              .checked
                          )
                        }
                      />

                      <span>
                        Gebruik de gegevens
                        van de koper voor
                        deze leerling.
                      </span>
                    </label>

                    <div className="appointment-order-grid">
                      <label className="appointment-order-field">
                        <span>
                          Voornaam ouder *
                        </span>

                        <input
                          type="text"
                          value={
                            participant.parentFirstName
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "parentFirstName",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            participant.usePurchaserData
                          }
                          required
                        />
                      </label>

                      <label className="appointment-order-field">
                        <span>
                          Familienaam
                          ouder *
                        </span>

                        <input
                          type="text"
                          value={
                            participant.parentLastName
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "parentLastName",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            participant.usePurchaserData
                          }
                          required
                        />
                      </label>

                      <label className="appointment-order-field">
                        <span>
                          Echt e-mailadres
                          ouder *
                        </span>

                        <input
                          type="email"
                          value={
                            participant.parentEmail
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "parentEmail",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            participant.usePurchaserData
                          }
                          required
                        />
                      </label>

                      <label className="appointment-order-field">
                        <span>
                          Telefoonnummer
                          ouder *
                        </span>

                        <input
                          type="tel"
                          value={
                            participant.parentPhone
                          }
                          onChange={(
                            event
                          ) =>
                            updateParticipant(
                              participant.id,
                              "parentPhone",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            participant.usePurchaserData
                          }
                          required
                        />
                      </label>

                      {parentAlias && (
                        <div className="appointment-order-alias-preview appointment-order-full">
                          <span>
                            Intern
                            ouderadres
                          </span>

                          <strong>
                            {parentAlias}
                          </strong>

                          <small>
                            Dit interne adres
                            wordt na betaling
                            automatisch
                            geregistreerd.
                          </small>
                        </div>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </section>

<section className="appointment-order-card appointment-order-introduction-note">
  <span aria-hidden="true">
    💻
  </span>

  <div>
    <h2>
      Eenmalige digitale kennismaking inbegrepen
    </h2>

    <p>
      Iedere klant kan éénmalig een gratis digitaal
      kennismakingsgesprek van 30 minuten inplannen.
      Dit blijft éénmalig, ook wanneer later opnieuw
      een losse les, beurtenkaart of groepsbegeleiding
      wordt aangekocht.
    </p>

    <p>
      Bij een groep ontvangen alle unieke echte
      e-mailadressen van de betrokken ouders
      dezelfde Google Meet-uitnodiging.
    </p>
  </div>
</section>

          <section className="appointment-order-card appointment-order-agreements">
            <label className="appointment-order-checkbox">
              <input
                type="checkbox"
                checked={
                  termsAccepted
                }
                onChange={(
                  event
                ) =>
                  setTermsAccepted(
                    event.target.checked
                  )
                }
                required
              />

              <span>
                Ik ga akkoord met de
                boekings- en
                annuleringsvoorwaarden.
                Een afspraak wordt
                enkel kosteloos
                geannuleerd of
                verplaatst wanneer dit
                minstens 72 uur vooraf
                gebeurt.
              </span>
            </label>

            <label className="appointment-order-checkbox">
              <input
                type="checkbox"
                checked={
                  privacyAccepted
                }
                onChange={(
                  event
                ) =>
                  setPrivacyAccepted(
                    event.target.checked
                  )
                }
                required
              />

              <span>
                Ik geef toestemming om
                de ingevulde gegevens
                te verwerken voor
                begeleiding,
                accountbeheer,
                communicatie en
                planning.
              </span>
            </label>
          </section>

          <section className="appointment-order-checkout">
            <div>
              <span>
                Te betalen
              </span>

              <strong>
                {formatCurrency(
                  totalAmount
                )}
              </strong>

              <small>
                {isGroup
                  ? `${participantCount} leerlingen × ${formatCurrency(
                      pricePerParticipant
                    )}`
                  : `${levelLabel} · 60 minuten`}
              </small>
            </div>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Betaalpagina laden..."
                : `Veilig betalen – ${formatCurrency(
                    totalAmount
                  )}`}
            </button>
          </section>

          <div className="appointment-order-back">
            <Link href="/afspraak">
              ← Terug naar het
              overzicht
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}