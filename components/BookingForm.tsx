"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

const GOOGLE_CALENDAR_EMBED =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3WJPmozNx50TOG5q9aODtgqNb2zBEnVO15NK6WTbYrNm5YWLwDqmJ6edb83qz-llOLh9Jk_959?gv=true";

const GOOGLE_CALENDAR_LINK = "https://calendar.app.google/9UCRsaVW2goDPDsT6";

const lowerSchoolOptions = [
  { value: "huiswerkbegeleiding", label: "Huiswerkbegeleiding", amount: 35, calendar: true },
  { value: "mini-groep", label: "Mini-groep", amount: null, calendar: false },
  { value: "10-beurtenkaart", label: "10-beurtenkaart", amount: 320, calendar: false },
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
  const isTenBeurtenkaart = mainService === "lager" && subService === "10-beurtenkaart";

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
    !isTenBeurtenkaart &&
    (mainService === "afspraak" ||
      mainService === "secundair" ||
      mainService === "hoger" ||
      mainService === "zorgaanbod" ||
      (mainService === "lager" && selectedLower?.calendar));

  const showForm =
    mainService &&
    mainService !== "photography" &&
    mainService !== "workshop" &&
    !showCalendar &&
    !isTenBeurtenkaart;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (showCalendar) return;

    setLoading(true);
    setMessage("");
    setDebugError("");

    const form = new FormData(event.currentTarget);

    if (isTenBeurtenkaart) {
      const response = await fetch("/api/checkout/ten-beurtenkaart", {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        setLoading(false);
        setMessage("De betaling kon niet gestart worden.");
        setDebugError(data.error ?? "Geen checkout-url ontvangen.");
        return;
      }

      window.location.href = data.url;
      return;
    }

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
        ? `Wekelijkse begeleiding: ${weeklyPlan === "1x" ? "1x per week" : "2x per week"}`
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
      setDebugError(contactError?.message ?? "Geen contact teruggekregen van Supabase.");
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
      setDebugError(bookingError.message);
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
        </div>

        {isTenBeurtenkaart && (
          <section className="booking-calendar-panel">
            <p className="eyebrow">10-beurtenkaart</p>
            <h2>Gegevens leerling</h2>
            <p>Vul de gegevens in. Daarna kun je meteen online betalen.</p>

            <div className="form-grid">
              <label>
                Naam leerling
                <input name="student_name" required />
              </label>

              <label>
                Leeftijd leerling
                <input name="student_age" type="number" min="5" max="19" required />
              </label>

              <label>
                Studiejaar
                <select name="school_year" required>
                  <option value="">Kies studiejaar</option>
                  <option value="1e leerjaar">1e leerjaar</option>
                  <option value="2e leerjaar">2e leerjaar</option>
                  <option value="3e leerjaar">3e leerjaar</option>
                  <option value="4e leerjaar">4e leerjaar</option>
                  <option value="5e leerjaar">5e leerjaar</option>
                  <option value="6e leerjaar">6e leerjaar</option>
                  <option value="1e middelbaar">1e middelbaar</option>
                  <option value="2e middelbaar">2e middelbaar</option>
                  <option value="3e middelbaar">3e middelbaar</option>
                  <option value="4e middelbaar">4e middelbaar</option>
                  <option value="5e middelbaar">5e middelbaar</option>
                  <option value="6e middelbaar">6e middelbaar</option>
                </select>
              </label>

              <label>
                Naam ouder
                <input name="parent_name" required />
              </label>

              <label>
                E-mail
                <input name="email" type="email" required />
              </label>

              <label>
                Telefoon
                <input name="phone" type="tel" required />
              </label>
            </div>

            <label>
              Opmerking
              <textarea
                name="notes"
                rows={5}
                placeholder="Zijn er zaken waarmee ik rekening mag houden?"
              />
            </label>

            <input type="hidden" name="product" value="10-beurtenkaart" />
            <input type="hidden" name="amount" value="320" />

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? "Betaling starten..." : "Betaal 10-beurtenkaart · €320"}
            </button>
          </section>
        )}

        {showCalendar && (
          <section className="booking-calendar-panel">
            <p className="eyebrow">Online afspraak</p>
            <h2>Kies zelf een beschikbaar moment</h2>
            <p>
              Selecteer hieronder een vrij moment in mijn agenda. Na het bevestigen ontvang je
              automatisch een bevestigingsmail.
            </p>

            <iframe src={GOOGLE_CALENDAR_EMBED} loading="lazy" title="Afspraak inplannen Studio SaGo" />

            <p className="calendar-fallback">
              Werkt de agenda niet?{" "}
              <a href={GOOGLE_CALENDAR_LINK} target="_blank" rel="noopener noreferrer">
                Open de agenda in een nieuw tabblad.
              </a>
            </p>
          </section>
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