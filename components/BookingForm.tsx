"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

const GOOGLE_CALENDAR_EMBED =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3WJPmozNx50TOG5q9aODtgqNb2zBEnVO15NK6WTbYrNm5YWLwDqmJ6edb83qz-llOLh9Jk_959?gv=true";

const GOOGLE_CALENDAR_LINK =
  "https://calendar.app.google/9UCRsaVW2goDPDsT6";

const lowerSchoolOptions = [
  { value: "huiswerkbegeleiding", label: "Huiswerkbegeleiding", amount: 35, calendar: true },
  { value: "mini-groep", label: "Mini-groep", amount: null, calendar: false },
  { value: "10-beurtenkaart", label: "10-beurtenkaart", amount: 320, calendar: true },
  { value: "wekelijkse-begeleiding", label: "Wekelijkse begeleiding", amount: null, calendar: true },
  { value: "tekstcorrectie", label: "Correctie van teksten tot 1500 woorden", amount: 15, calendar: false },
];

export default function BookingForm() {
  const [mainService, setMainService] = useState("");
  const [subService, setSubService] = useState("");
  const [miniGroupSize, setMiniGroupSize] = useState("");
  const [weeklyPlan, setWeeklyPlan] = useState("");
  const [message, setMessage] = useState("");
  const [debugError, setDebugError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedLower = lowerSchoolOptions.find((item) => item.value === subService);

  const amount =
    subService === "mini-groep"
      ? Number(miniGroupSize || 0) * 22 || null
      : subService === "wekelijkse-begeleiding"
      ? weeklyPlan === "1x"
        ? 135
        : weeklyPlan === "2x"
        ? 250
        : null
      : selectedLower?.amount ?? null;

  const showCalendar =
    mainService === "afspraak" ||
    mainService === "secundair" ||
    mainService === "hoger" ||
    mainService === "zorgaanbod" ||
    (mainService === "lager" && selectedLower?.calendar);

  const showForm =
    mainService &&
    mainService !== "photography" &&
    mainService !== "workshop" &&
    !showCalendar;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (showCalendar) return;

    setLoading(true);
    setMessage("");
    setDebugError("");

    if (mainService === "photography") {
      window.open("https://www.sagophotography.be", "_blank", "noopener,noreferrer");
      setLoading(false);
      return;
    }

    const form = new FormData(event.currentTarget);

    const firstName = String(form.get("first_name") || "");
    const lastName = String(form.get("last_name") || "");
    const email = String(form.get("email") || "");
    const phone = String(form.get("phone") || "");
    const notes = String(form.get("notes") || "");

    const serviceText = [
      `Hoofdaanbod: ${mainService}`,
      subService ? `Keuze lager onderwijs: ${selectedLower?.label}` : "",
      miniGroupSize ? `Mini-groep: ${miniGroupSize} leerlingen` : "",
      weeklyPlan
        ? `Wekelijkse begeleiding: ${
            weeklyPlan === "1x" ? "1x per week" : "2x per week"
          }`
        : "",
      amount ? `Richtprijs: €${amount}` : "",
      notes ? `Bericht: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        notes: serviceText,
        active: true,
      })
      .select("id")
      .single();

    if (contactError || !contact) {
      setLoading(false);
      setMessage("Je aanvraag kon niet worden opgeslagen.");
      setDebugError(
        contactError
          ? `${contactError.message} ${contactError.details ?? ""} ${contactError.hint ?? ""}`
          : "Geen contact teruggekregen van Supabase."
      );
      return;
    }

    const { error: bookingError } = await supabase.from("bookings").insert({
      contact_id: contact.id,
      service_id: null,
      availability_id: null,
      status: "pending",
      payment_status: "unpaid",
      amount,
      notes: serviceText,
    });

    setLoading(false);

    if (bookingError) {
      setMessage("Contact opgeslagen, maar boeking lukte niet.");
      setDebugError(
        `${bookingError.message} ${bookingError.details ?? ""} ${bookingError.hint ?? ""}`
      );
      return;
    }

    setMessage("Je aanvraag werd verzonden. Je ontvangt binnenkort bevestiging.");
    event.currentTarget.reset();
    setMainService("");
    setSubService("");
    setMiniGroupSize("");
    setWeeklyPlan("");
  }

  return (
    <form className="form-card booking-form-with-calendar" onSubmit={handleSubmit}>
      <div className="booking-fields">
        <div className="form-grid booking-choice-grid">
          <label>
            Aanbod
            <select
              value={mainService}
              onChange={(event) => {
                setMainService(event.target.value);
                setSubService("");
                setMiniGroupSize("");
                setWeeklyPlan("");
                setMessage("");
                setDebugError("");
              }}
              required
            >
              <option value="">Kies een aanbod</option>
              <option value="afspraak">Afspraak inplannen</option>
              <option value="lager">Lager onderwijs</option>
              <option value="workshop">Workshop / kamp</option>
              <option value="secundair">Secundair onderwijs</option>
              <option value="hoger">Hoger onderwijs</option>
              <option value="zorgaanbod">Zorgaanbod</option>
              <option value="photography">SaGo Photography</option>
            </select>
          </label>

          {mainService === "lager" && (
            <label>
              Kies binnen lager onderwijs
              <select
                value={subService}
                onChange={(event) => {
                  setSubService(event.target.value);
                  setMiniGroupSize("");
                  setWeeklyPlan("");
                  setMessage("");
                  setDebugError("");
                }}
                required
              >
                <option value="">Kies een dienst</option>
                {lowerSchoolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {subService === "mini-groep" && (
            <label>
              Aantal leerlingen
              <select
                value={miniGroupSize}
                onChange={(event) => setMiniGroupSize(event.target.value)}
                required
              >
                <option value="">Kies aantal leerlingen</option>
                <option value="2">2 leerlingen · €44</option>
                <option value="3">3 leerlingen · €66</option>
                <option value="4">4 leerlingen · €88</option>
                <option value="5">5 leerlingen · €110</option>
              </select>
            </label>
          )}

          {subService === "wekelijkse-begeleiding" && (
            <label>
              Formule
              <select
                value={weeklyPlan}
                onChange={(event) => setWeeklyPlan(event.target.value)}
                required
              >
                <option value="">Kies formule</option>
                <option value="1x">1x per week · €135/maand</option>
                <option value="2x">2x per week · €250/maand</option>
              </select>
            </label>
          )}
        </div>

        {showCalendar && (
          <section className="booking-calendar-panel">
            <p className="eyebrow">Online afspraak</p>
            <h2>Kies zelf een beschikbaar moment</h2>
            <p>
              Selecteer hieronder een vrij moment in mijn agenda. Na het bevestigen ontvang je
              automatisch een bevestigingsmail.
            </p>

            <iframe
              src={GOOGLE_CALENDAR_EMBED}
              loading="lazy"
              title="Afspraak inplannen Studio SaGo"
            />

            <p className="calendar-fallback">
              Werkt de agenda niet?{" "}
              <a href={GOOGLE_CALENDAR_LINK} target="_blank" rel="noopener noreferrer">
                Open de agenda in een nieuw tabblad.
              </a>
            </p>
          </section>
        )}

        {mainService === "workshop" && (
          <p className="form-message">
            Workshops en kampen verlopen via het inschrijvingssysteem. Kies de gewenste workshop
            op de aanbodpagina.
          </p>
        )}

        {mainService === "photography" && (
          <a
            className="primary-action"
            href="https://www.sagophotography.be"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ga naar SaGo Photography
          </a>
        )}

        {showForm && (
          <>
            <div className="form-grid">
              <label>
                Voornaam
                <input name="first_name" required />
              </label>

              <label>
                Achternaam
                <input name="last_name" required />
              </label>

              <label>
                E-mail
                <input name="email" type="email" required />
              </label>

              <label>
                Telefoon
                <input name="phone" type="tel" />
              </label>
            </div>

            {amount && <p className="form-message">Richtprijs: €{amount}</p>}

            <label>
              Bericht
              <textarea
                name="notes"
                rows={5}
                placeholder="Vertel kort waar je hulp bij zoekt."
              />
            </label>

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? "Verzenden..." : "Aanvraag verzenden"}
            </button>
          </>
        )}

        {message && <p className="form-message">{message}</p>}

        {debugError && (
          <p className="form-message" style={{ color: "#fe2020" }}>
            Technische fout: {debugError}
          </p>
        )}
      </div>
    </form>
  );
}