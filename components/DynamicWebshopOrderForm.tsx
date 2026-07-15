"use client";

import { FormEvent, useMemo, useState } from "react";
import type { DynamicService } from "@/lib/webshopService";

type Participant = {
  firstNames: string;
  lastNames: string;
  birthDate: string;
  grade: string;
  studyProgram: string;
  school: string;
  learningGoal: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
};

const emptyParticipant = (): Participant => ({
  firstNames: "",
  lastNames: "",
  birthDate: "",
  grade: "",
  studyProgram: "",
  school: "",
  learningGoal: "",
  parentFirstName: "",
  parentLastName: "",
  parentEmail: "",
  parentPhone: "",
});

const primaryGrades = [
  "1e leerjaar",
  "2e leerjaar",
  "3e leerjaar",
  "4e leerjaar",
  "5e leerjaar",
  "6e leerjaar",
];

const secondaryGrades = [
  "1A",
  "1B",
  "2A",
  "2B",
  "3e middelbaar",
  "4e middelbaar",
  "5e middelbaar",
  "6e middelbaar",
  "7e specialisatiejaar",
];

function formatMoney(value: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function DynamicWebshopOrderForm({
  service,
}: {
  service: DynamicService;
}) {
  const isPass = service.product_type === "pass";
  const isGroupService = service.allows_group === true && !isPass;
  const isSingleStudentProduct = !isGroupService;

  const initialParticipantCount = isGroupService
    ? Math.max(2, service.min_participants)
    : 1;

  const [purchaserFirstName, setPurchaserFirstName] = useState("");
  const [purchaserLastName, setPurchaserLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState(
    service.allows_digital ? "digital" : "home"
  );
  const [address, setAddress] = useState("");
  const [participants, setParticipants] = useState<Participant[]>(() =>
    Array.from({ length: initialParticipantCount }, emptyParticipant)
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const bookingType = isGroupService ? "group" : "individual";
  const unitPrice = isGroupService
    ? service.price_per_participant ?? service.price
    : service.price;

  const total = useMemo(
    () => unitPrice * participants.length,
    [unitPrice, participants.length]
  );

  const grades =
    service.education_level === "secondary"
      ? secondaryGrades
      : primaryGrades;

  function updateParticipantCount(requestedCount: number): void {
    if (!isGroupService) {
      setParticipants((current) => [current[0] ?? emptyParticipant()]);
      return;
    }

    const minimum = Math.max(2, service.min_participants);
    const maximum = Math.max(minimum, service.max_participants);
    const safeCount = Math.max(minimum, Math.min(maximum, requestedCount));

    setParticipants((current) =>
      Array.from(
        { length: safeCount },
        (_, index) => current[index] ?? emptyParticipant()
      )
    );
  }

  function updateParticipant(
    index: number,
    key: keyof Participant,
    value: string
  ): void {
    setParticipants((current) =>
      current.map((participant, participantIndex) =>
        participantIndex === index
          ? { ...participant, [key]: value }
          : participant
      )
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");

    if (!purchaserFirstName.trim() || !purchaserLastName.trim() || !email.trim()) {
      setError("Vul de gegevens van de koper volledig in.");
      return;
    }

    if (deliveryType === "home" && !address.trim()) {
      setError("Vul het adres voor de begeleiding aan huis in.");
      return;
    }

    if (
      service.requires_student_data &&
      participants.some(
        (participant) =>
          !participant.firstNames.trim() ||
          !participant.lastNames.trim() ||
          !participant.grade.trim() ||
          !participant.parentEmail.trim()
      )
    ) {
      setError(
        isGroupService
          ? "Vul voor iedere deelnemer de verplichte gegevens in."
          : "Vul de verplichte gegevens van de leerling in."
      );
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/checkout/webshop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
          slug: service.slug,
          purchaserFirstName: purchaserFirstName.trim(),
          purchaserLastName: purchaserLastName.trim(),
          purchaserEmail: email.trim().toLowerCase(),
          purchaserPhone: phone.trim(),
          bookingType,
          deliveryType,
          customerAddress: deliveryType === "home" ? address.trim() : "",
          participants: isSingleStudentProduct
            ? [participants[0]]
            : participants,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Betaling starten is mislukt.");
      }

      const redirectUrl = data.checkoutUrl || data.redirectUrl;

      if (!redirectUrl) {
        throw new Error("Er werd geen betaallink ontvangen.");
      }

      window.location.href = redirectUrl;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Er is een onbekende fout opgetreden."
      );
      setBusy(false);
    }
  }

  const participantLegend = isGroupService ? "Deelnemer" : "Leerling";
  const addressLabel = isGroupService
    ? "Gezamenlijk adres (max. 15 km van Peer) *"
    : "Adres begeleiding aan huis (max. 15 km van Peer) *";

  return (
    <section className="webshop-order-section">
      <div className="webshop-order-card">
        <form className="webshop-order-form" onSubmit={submit}>
          <div className="webshop-form-grid">
            <label className="webshop-field">
              <span>Voornaam koper *</span>
              <input
                value={purchaserFirstName}
                onChange={(event) => setPurchaserFirstName(event.target.value)}
                required
              />
            </label>

            <label className="webshop-field">
              <span>Familienaam koper *</span>
              <input
                value={purchaserLastName}
                onChange={(event) => setPurchaserLastName(event.target.value)}
                required
              />
            </label>

            <label className="webshop-field">
              <span>E-mailadres *</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="webshop-field">
              <span>Telefoonnummer</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>

            {isGroupService && (
              <label className="webshop-field">
                <span>Aantal deelnemers</span>
                <select
                  value={participants.length}
                  onChange={(event) =>
                    updateParticipantCount(Number(event.target.value))
                  }
                >
                  {Array.from(
                    {
                      length:
                        Math.max(
                          Math.max(2, service.min_participants),
                          service.max_participants
                        ) -
                        Math.max(2, service.min_participants) +
                        1,
                    },
                    (_, index) => index + Math.max(2, service.min_participants)
                  ).map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {(service.allows_digital || service.allows_home) && (
              <label className="webshop-field">
                <span>Vorm</span>
                <select
                  value={deliveryType}
                  onChange={(event) => setDeliveryType(event.target.value)}
                >
                  {service.allows_digital && (
                    <option value="digital">Digitaal</option>
                  )}
                  {service.allows_home && (
                    <option value="home">Aan huis</option>
                  )}
                </select>
              </label>
            )}

            {deliveryType === "home" && service.allows_home && (
              <label className="webshop-field webshop-field-full">
                <span>{addressLabel}</span>
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Straat, nummer, postcode en gemeente"
                  required
                />
              </label>
            )}

            {service.requires_student_data &&
              participants.map((participant, index) => (
                <fieldset
                  key={index}
                  className="webshop-field-full"
                  style={{
                    border: "1px solid rgba(3,54,99,.12)",
                    borderRadius: 18,
                    padding: 18,
                  }}
                >
                  <legend>
                    <strong>
                      {participantLegend}
                      {isGroupService ? ` ${index + 1}` : ""}
                    </strong>
                  </legend>

                  <div className="webshop-form-grid">
                    <label className="webshop-field">
                      <span>Voornamen *</span>
                      <input
                        value={participant.firstNames}
                        onChange={(event) =>
                          updateParticipant(
                            index,
                            "firstNames",
                            event.target.value
                          )
                        }
                        required
                      />
                    </label>

                    <label className="webshop-field">
                      <span>Familienaam *</span>
                      <input
                        value={participant.lastNames}
                        onChange={(event) =>
                          updateParticipant(
                            index,
                            "lastNames",
                            event.target.value
                          )
                        }
                        required
                      />
                    </label>

                    <label className="webshop-field">
                      <span>Geboortedatum</span>
                      <input
                        type="date"
                        value={participant.birthDate}
                        onChange={(event) =>
                          updateParticipant(
                            index,
                            "birthDate",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="webshop-field">
                      <span>Leerjaar *</span>
                      <select
                        value={participant.grade}
                        onChange={(event) =>
                          updateParticipant(index, "grade", event.target.value)
                        }
                        required
                      >
                        <option value="">Kies</option>
                        {grades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="webshop-field">
                      <span>School</span>
                      <input
                        value={participant.school}
                        onChange={(event) =>
                          updateParticipant(index, "school", event.target.value)
                        }
                      />
                    </label>

                    {service.education_level === "secondary" && (
                      <label className="webshop-field">
                        <span>Studierichting</span>
                        <input
                          value={participant.studyProgram}
                          onChange={(event) =>
                            updateParticipant(
                              index,
                              "studyProgram",
                              event.target.value
                            )
                          }
                        />
                      </label>
                    )}

                    <label className="webshop-field webshop-field-full">
                      <span>Leerdoel</span>
                      <textarea
                        value={participant.learningGoal}
                        onChange={(event) =>
                          updateParticipant(
                            index,
                            "learningGoal",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="webshop-field">
                      <span>Voornaam ouder/contact</span>
                      <input
                        value={participant.parentFirstName}
                        onChange={(event) =>
                          updateParticipant(
                            index,
                            "parentFirstName",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="webshop-field">
                      <span>Familienaam ouder/contact</span>
                      <input
                        value={participant.parentLastName}
                        onChange={(event) =>
                          updateParticipant(
                            index,
                            "parentLastName",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="webshop-field">
                      <span>E-mail ouder/contact *</span>
                      <input
                        type="email"
                        value={participant.parentEmail}
                        onChange={(event) =>
                          updateParticipant(
                            index,
                            "parentEmail",
                            event.target.value
                          )
                        }
                        required
                      />
                    </label>

                    <label className="webshop-field">
                      <span>Telefoon ouder/contact</span>
                      <input
                        value={participant.parentPhone}
                        onChange={(event) =>
                          updateParticipant(
                            index,
                            "parentPhone",
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </div>
                </fieldset>
              ))}

            <label className="webshop-field webshop-field-full">
              <span>Opmerkingen</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>

          {error && (
            <p className="webshop-message webshop-message-error">{error}</p>
          )}

          <button className="webshop-submit-button" disabled={busy}>
            {busy ? "Even geduld..." : `Veilig betalen – ${formatMoney(total)}`}
          </button>
        </form>

        <aside className="webshop-order-summary">
          <p className="eyebrow">Bestelling</p>
          <h2>{service.title}</h2>

          <div className="webshop-price-overview">
            <div className="webshop-price-row">
              <span>
                {isGroupService
                  ? `${participants.length} deelnemers`
                  : isPass
                    ? "Beurtenkaart voor één leerling"
                    : "Prijs"}
              </span>
              <strong>{formatMoney(total)}</strong>
            </div>
          </div>

          {isGroupService && deliveryType === "digital" ? (
            <p className="webshop-payment-note">
              Alle opgegeven e-mailadressen ontvangen dezelfde Google
              Agenda-uitnodiging en Meet-link.
            </p>
          ) : (
            <p className="webshop-payment-note">
              Na je bestelling nemen we contact met je op om de begeleiding in
              te plannen.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
