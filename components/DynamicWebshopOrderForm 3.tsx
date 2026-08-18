"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
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

type TextAnalysisResponse = {
  success?: boolean;
  fileName?: string;
  wordCount?: number;
  price?: number;
  analysisToken?: string;
  error?: string;
};

type CheckoutResponse = {
  success?: boolean;
  checkoutUrl?: string;
  redirectUrl?: string;
  error?: string;
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
] as const;

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
] as const;

function money(value: number) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("nl-BE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isTextCorrectionService(service: DynamicService) {
  const haystack = normalize(
    [
      service.slug,
      service.title,
      service.category,
      service.product_type,
      service.href,
    ].join(" ")
  );

  return (
    normalize(service.slug) === "tekstcorrectie" ||
    normalize(service.product_type) === "text" ||
    haystack.includes("tekstcorrectie") ||
    haystack.includes("teksten nalezen") ||
    haystack.includes("correctie van teksten")
  );
}

function isPassService(service: DynamicService) {
  const haystack = normalize(
    [service.slug, service.title, service.product_type].join(" ")
  );

  return (
    haystack.includes("beurtenkaart") ||
    haystack.includes("pass") ||
    haystack.includes("subscription")
  );
}

export default function DynamicWebshopOrderForm({
  service,
}: {
  service: DynamicService;
}) {
  const isTextCorrection = isTextCorrectionService(service);
  const isAuthorModule = normalize(service.slug).includes("auteur") || normalize(service.title).includes("auteur");
  const isPass = isPassService(service);

  const [purchaserFirstName, setPurchaserFirstName] = useState("");
  const [purchaserLastName, setPurchaserLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [bookingType, setBookingType] = useState<"individual" | "group">(
    "individual"
  );
  const [deliveryType, setDeliveryType] = useState<"digital" | "home">(
    service.allows_digital ? "digital" : "home"
  );
  const [address, setAddress] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    emptyParticipant(),
  ]);
  const [notes, setNotes] = useState("");

  const [textType, setTextType] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [textAnalysisToken, setTextAnalysisToken] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [textPrice, setTextPrice] = useState(20);
  const [analysingFile, setAnalysingFile] = useState(false);
  const [authorCode, setAuthorCode] = useState("");
  const [authorDiscountPercent, setAuthorDiscountPercent] = useState(0);
  const [authorDiscountMessage, setAuthorDiscountMessage] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const group =
    !isTextCorrection &&
    !isPass &&
    service.allows_group &&
    bookingType === "group";

  const grades =
    service.education_level === "secondary"
      ? secondaryGrades
      : primaryGrades;

  const unitPrice = group
    ? service.price_per_participant ?? service.price
    : service.price;

  const total = useMemo(() => {
    if (isTextCorrection) return Math.round(textPrice * (1 - authorDiscountPercent / 100) * 100) / 100;
    return unitPrice * participants.length;
  }, [isTextCorrection, textPrice, authorDiscountPercent, unitPrice, participants.length]);

  function setParticipantCount(value: number) {
    const minimum = group ? Math.max(2, service.min_participants) : 1;
    const maximum = group ? service.max_participants : 1;
    const safe = Math.max(minimum, Math.min(maximum, value));

    setParticipants((current) =>
      Array.from(
        { length: safe },
        (_, index) => current[index] ?? emptyParticipant()
      )
    );
  }

  function setParticipantField(
    index: number,
    key: keyof Participant,
    value: string
  ) {
    setParticipants((current) =>
      current.map((participant, currentIndex) =>
        currentIndex === index
          ? { ...participant, [key]: value }
          : participant
      )
    );
  }

  async function analyseFile(file: File) {
    setError("");
    setAnalysingFile(true);
    setSelectedFileName("");
    setTextAnalysisToken("");
    setWordCount(0);
    setTextPrice(20);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/webshop/analyse-text-file", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as TextAnalysisResponse;

      if (!response.ok) {
        throw new Error(
          result.error || "Het document kon niet worden geanalyseerd."
        );
      }

      if (
        !result.analysisToken ||
        !result.fileName ||
        !Number.isFinite(Number(result.wordCount)) ||
        !Number.isFinite(Number(result.price))
      ) {
        throw new Error("De documentanalyse gaf geen geldig resultaat terug.");
      }

      setSelectedFileName(result.fileName);
      setTextAnalysisToken(result.analysisToken);
      setWordCount(Number(result.wordCount));
      setTextPrice(Number(result.price));
      setAuthorDiscountPercent(0);
      setAuthorDiscountMessage("");
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Het document kon niet worden geanalyseerd."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setAnalysingFile(false);
    }
  }

  function validateStandardForm() {
    if (!purchaserFirstName.trim() || !purchaserLastName.trim()) {
      return "Vul de naam van de koper volledig in.";
    }

    if (!email.trim() || !email.includes("@")) {
      return "Vul een geldig e-mailadres in.";
    }

    if (deliveryType === "home" && !address.trim()) {
      return "Vul het adres voor de begeleiding aan huis in.";
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
      return "Vul voor iedere leerling de verplichte gegevens in.";
    }

    return null;
  }

  function validateTextForm() {
    if (!purchaserFirstName.trim() || !purchaserLastName.trim()) {
      return "Vul je naam volledig in.";
    }

    if (!email.trim() || !email.includes("@")) {
      return "Vul een geldig e-mailadres in.";
    }

    if (!textAnalysisToken) {
      return "Upload eerst het document dat je wilt laten nalezen.";
    }

    return null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError = isTextCorrection
      ? validateTextForm()
      : validateStandardForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);

    try {
      const payload = isTextCorrection
        ? {
            serviceId: service.id,
            slug: service.slug,
            purchaserFirstName: purchaserFirstName.trim(),
            purchaserLastName: purchaserLastName.trim(),
            purchaserEmail: email.trim().toLowerCase(),
            purchaserPhone: phone.trim(),
            textType: textType.trim(),
            notes: notes.trim(),
            textAnalysisToken,
            authorDiscountCode: isAuthorModule ? authorCode.trim() : "",
          }
        : {
            serviceId: service.id,
            slug: service.slug,
            purchaserFirstName: purchaserFirstName.trim(),
            purchaserLastName: purchaserLastName.trim(),
            purchaserEmail: email.trim().toLowerCase(),
            purchaserPhone: phone.trim(),
            bookingType: group ? "group" : "individual",
            deliveryType,
            customerAddress: deliveryType === "home" ? address.trim() : "",
            participants,
            notes: notes.trim(),
          };

      const response = await fetch("/api/checkout/webshop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(result.error || "Checkout mislukt.");
      }

      const checkoutUrl = result.checkoutUrl || result.redirectUrl;

      if (!checkoutUrl) {
        throw new Error("Mollie gaf geen betaallink terug.");
      }

      window.location.assign(checkoutUrl);
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Checkout mislukt."
      );
      setBusy(false);
    }
  }

  if (isTextCorrection) {
    return (
      <section className="webshop-order-section">
        <div className="webshop-order-card">
          <form className="webshop-order-form" onSubmit={submit}>
            <div className="webshop-form-grid">
              <label className="webshop-field">
                <span>Voornaam *</span>
                <input
                  value={purchaserFirstName}
                  onChange={(event) =>
                    setPurchaserFirstName(event.target.value)
                  }
                  required
                />
              </label>

              <label className="webshop-field">
                <span>Familienaam *</span>
                <input
                  value={purchaserLastName}
                  onChange={(event) =>
                    setPurchaserLastName(event.target.value)
                  }
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

              <label className="webshop-field webshop-field-full">
                <span>Document uploaden *</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.txt"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void analyseFile(file);
                  }}
                  required={!textAnalysisToken}
                />
                <small>
                  Toegestaan: Word (.docx), PDF en TXT. Maximaal 15 MB.
                </small>
              </label>

              {analysingFile ? (
                <div className="webshop-field webshop-field-full">
                  <p className="webshop-message">
                    Document analyseren en woorden tellen…
                  </p>
                </div>
              ) : null}

              {textAnalysisToken ? (
                <div className="webshop-field webshop-field-full">
                  <div
                    style={{
                      padding: 18,
                      border: "1px solid rgba(40,185,170,.22)",
                      borderRadius: 18,
                      background: "rgba(40,185,170,.07)",
                    }}
                  >
                    <strong style={{ display: "block", color: "#033663" }}>
                      {selectedFileName}
                    </strong>
                    <span style={{ display: "block", marginTop: 8 }}>
                      {wordCount.toLocaleString("nl-BE")} woorden ·{" "}
                      {money(textPrice)}
                    </span>
                  </div>
                </div>
              ) : null}

              {isAuthorModule ? (
                <div className="webshop-field webshop-field-full" style={{padding:18,borderRadius:18,background:"rgba(155,129,184,.09)"}}>
                  <strong style={{color:"#033663"}}>Instagramkorting voor auteurs</strong>
                  <p style={{margin:"6px 0 12px"}}>Geldig vanaf 10.000 woorden. Gebruik de code die bij de Instagramactie staat.</p>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <input value={authorCode} onChange={e=>{setAuthorCode(e.target.value);setAuthorDiscountPercent(0);setAuthorDiscountMessage("")}} placeholder="Instagramcode" style={{flex:"1 1 220px"}}/>
                    <button type="button" onClick={async()=>{setAuthorDiscountMessage("");try{const r=await fetch("/api/webshop/author-discount",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:authorCode,wordCount})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Code ongeldig");setAuthorDiscountPercent(Number(d.discountPercent||0));setAuthorDiscountMessage(`${d.discountPercent}% auteurskorting toegepast.`)}catch(e){setAuthorDiscountPercent(0);setAuthorDiscountMessage(e instanceof Error?e.message:"Code ongeldig")}}} disabled={!textAnalysisToken || !authorCode.trim()}>Code toepassen</button>
                  </div>
                  {authorDiscountMessage ? <small style={{display:"block",marginTop:10,fontWeight:800}}>{authorDiscountMessage}</small> : null}
                </div>
              ) : null}

              <label className="webshop-field webshop-field-full">
                <span>Soort tekst</span>
                <input
                  value={textType}
                  onChange={(event) => setTextType(event.target.value)}
                  placeholder="Bijvoorbeeld scriptie, cursus, artikel…"
                />
              </label>

              <label className="webshop-field webshop-field-full">
                <span>Opmerkingen over de tekst</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Vertel waarop ik extra moet letten."
                />
              </label>
            </div>

            {error ? (
              <p className="webshop-message webshop-message-error">
                {error}
              </p>
            ) : null}

            <button
              className="webshop-submit-button"
              disabled={busy || analysingFile || !textAnalysisToken}
            >
              {busy
                ? "Even geduld…"
                : `Veilig betalen – ${money(textPrice)}`}
            </button>
          </form>

          <aside className="webshop-order-summary">
            <p className="eyebrow">Bestelling</p>
            <h2>{service.title}</h2>

            <div className="webshop-price-overview">
              <div className="webshop-price-row">
                <span>Document</span>
                <strong>{selectedFileName || "Nog niet gekozen"}</strong>
              </div>

              <div className="webshop-price-row">
                <span>Aantal woorden</span>
                <strong>
                  {wordCount > 0
                    ? wordCount.toLocaleString("nl-BE")
                    : "—"}
                </strong>
              </div>

              <div className="webshop-price-row webshop-total-row">
                <span>Prijs</span>
                <strong>{money(textPrice)}</strong>
              </div>
            </div>

            <p className="webshop-payment-note">
              €20 tot en met 2000 woorden. Daarna €8 per begonnen schijf
              van 1000 extra woorden.
            </p>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="webshop-order-section">
      <div className="webshop-order-card">
        <form className="webshop-order-form" onSubmit={submit}>
          <div className="webshop-form-grid">
            <label className="webshop-field">
              <span>Voornaam koper *</span>
              <input
                value={purchaserFirstName}
                onChange={(event) =>
                  setPurchaserFirstName(event.target.value)
                }
                required
              />
            </label>

            <label className="webshop-field">
              <span>Familienaam koper *</span>
              <input
                value={purchaserLastName}
                onChange={(event) =>
                  setPurchaserLastName(event.target.value)
                }
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

            {!isPass && service.allows_group ? (
              <label className="webshop-field">
                <span>Soort begeleiding</span>
                <select
                  value={bookingType}
                  onChange={(event) => {
                    const value =
                      event.target.value === "group"
                        ? "group"
                        : "individual";
                    setBookingType(value);
                    setParticipantCount(
                      value === "group"
                        ? Math.max(2, service.min_participants)
                        : 1
                    );
                  }}
                >
                  <option value="individual">Individueel</option>
                  <option value="group">In groep</option>
                </select>
              </label>
            ) : null}

            {group ? (
              <label className="webshop-field">
                <span>Aantal deelnemers</span>
                <select
                  value={participants.length}
                  onChange={(event) =>
                    setParticipantCount(Number(event.target.value))
                  }
                >
                  {Array.from(
                    {
                      length:
                        service.max_participants -
                        Math.max(2, service.min_participants) +
                        1,
                    },
                    (_, index) =>
                      index + Math.max(2, service.min_participants)
                  ).map((amount) => (
                    <option key={amount} value={amount}>
                      {amount}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {service.allows_digital || service.allows_home ? (
              <label className="webshop-field">
                <span>Vorm</span>
                <select
                  value={deliveryType}
                  onChange={(event) =>
                    setDeliveryType(
                      event.target.value === "home" ? "home" : "digital"
                    )
                  }
                >
                  {service.allows_digital ? (
                    <option value="digital">Digitaal</option>
                  ) : null}
                  {service.allows_home ? (
                    <option value="home">Aan huis</option>
                  ) : null}
                </select>
              </label>
            ) : null}

            {deliveryType === "home" ? (
              <label className="webshop-field webshop-field-full">
                <span>
                  {group
                    ? "Gezamenlijk adres (max. 15 km van Peer) *"
                    : "Adres begeleiding aan huis (max. 15 km van Peer) *"}
                </span>
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Straat, nummer, postcode en gemeente"
                  required
                />
              </label>
            ) : null}

            {service.requires_student_data
              ? participants.map((participant, index) => (
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
                        {group ? `Deelnemer ${index + 1}` : "Leerling"}
                      </strong>
                    </legend>

                    <div className="webshop-form-grid">
                      <label className="webshop-field">
                        <span>Voornamen *</span>
                        <input
                          value={participant.firstNames}
                          onChange={(event) =>
                            setParticipantField(
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
                            setParticipantField(
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
                            setParticipantField(
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
                            setParticipantField(
                              index,
                              "grade",
                              event.target.value
                            )
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
                            setParticipantField(
                              index,
                              "school",
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <label className="webshop-field">
                        <span>Studierichting</span>
                        <input
                          value={participant.studyProgram}
                          onChange={(event) =>
                            setParticipantField(
                              index,
                              "studyProgram",
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <label className="webshop-field webshop-field-full">
                        <span>Leerdoel</span>
                        <textarea
                          value={participant.learningGoal}
                          onChange={(event) =>
                            setParticipantField(
                              index,
                              "learningGoal",
                              event.target.value
                            )
                          }
                        />
                      </label>

                      {group ? (
                        <>
                          <label className="webshop-field">
                            <span>Voornaam ouder/contact</span>
                            <input
                              value={participant.parentFirstName}
                              onChange={(event) =>
                                setParticipantField(
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
                                setParticipantField(
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
                                setParticipantField(
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
                                setParticipantField(
                                  index,
                                  "parentPhone",
                                  event.target.value
                                )
                              }
                            />
                          </label>
                        </>
                      ) : (
                        <input
                          type="hidden"
                          value={email}
                          readOnly
                          onChange={() => undefined}
                        />
                      )}
                    </div>
                  </fieldset>
                ))
              : null}

            <label className="webshop-field webshop-field-full">
              <span>Opmerkingen</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>

          {error ? (
            <p className="webshop-message webshop-message-error">
              {error}
            </p>
          ) : null}

          <button className="webshop-submit-button" disabled={busy}>
            {busy ? "Even geduld…" : `Veilig betalen – ${money(total)}`}
          </button>
        </form>

        <aside className="webshop-order-summary">
          <p className="eyebrow">Bestelling</p>
          <h2>{service.title}</h2>

          <div className="webshop-price-overview">
            <div className="webshop-price-row">
              <span>
                {group
                  ? `${participants.length} deelnemers`
                  : isPass
                    ? "Beurtenkaart voor één leerling"
                    : "Prijs"}
              </span>
              <strong>{money(total)}</strong>
            </div>
          </div>

          <p className="webshop-payment-note">
            {group
              ? "Bij digitale groepsbegeleiding ontvangen alle opgegeven e-mailadressen dezelfde Google Agenda-uitnodiging en Meet-link."
              : "Na je bestelling nemen we contact op om de begeleiding in te plannen."}
          </p>
        </aside>
      </div>
    </section>
  );
}
