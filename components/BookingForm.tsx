"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

const GOOGLE_BOOKING = "https://calendar.app.google/9UCRsaVW2goDPDsT6";

const bookingLinks = {
  afspraak: GOOGLE_BOOKING,
  huiswerkbegeleiding: GOOGLE_BOOKING,
  "10-beurtenkaart": GOOGLE_BOOKING,
  "wekelijkse-begeleiding": GOOGLE_BOOKING,
  secundair: GOOGLE_BOOKING,
  hoger: GOOGLE_BOOKING,
  zorgaanbod: GOOGLE_BOOKING,
};

const lowerSchoolOptions = [
  { value: "huiswerkbegeleiding", label: "Huiswerkbegeleiding", amount: 35, booking: true },
  { value: "mini-groep", label: "Mini-groep", amount: null, booking: false },
  { value: "10-beurtenkaart", label: "10-beurtenkaart", amount: 320, booking: true },
  { value: "wekelijkse-begeleiding", label: "Wekelijkse begeleiding", amount: null, booking: true },
  { value: "tekstcorrectie", label: "Correctie van teksten tot 1500 woorden", amount: 15, booking: false },
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

  function getBookingLink() {
    if (mainService === "afspraak") return bookingLinks.afspraak;
    if (mainService === "secundair") return bookingLinks.secundair;
    if (mainService === "hoger") return bookingLinks.hoger;
    if (mainService === "zorgaanbod") return bookingLinks.zorgaanbod;

    if (mainService === "lager" && subService) {
      return bookingLinks[subService as keyof typeof bookingLinks] || "";
    }

    return "";
  }

  function openBookingLink() {
    const url = getBookingLink();

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    }

    return false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setDebugError("");

    if (
      mainService === "afspraak" ||
      mainService === "secundair" ||
      mainService === "hoger" ||
      mainService === "zorgaanbod" ||
      (mainService === "lager" && selectedLower?.booking)
    ) {
      openBookingLink();
      setLoading(false);
      setMessage("Je wordt doorgestuurd om een afspraak in te plannen.");
      return;
    }

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
      setDebugError(`${bookingError.message} ${bookingError.details ?? ""} ${bookingError.hint ?? ""}`);
      return;
    }

    setMessage("Je aanvraag werd verzonden. Je ontvangt binnenkort bevestiging.");
    event.currentTarget.reset();
    setMainService("");
    setSubService("");
    setMiniGroupSize("");
    setWeeklyPlan("");
  }

  const isBookingService =
    mainService === "afspraak" ||
    mainService === "secundair" ||
    mainService === "hoger" ||
    mainService === "zorgaanbod" ||
    (mainService === "lager" && selectedLower?.booking);

  const showForm =
    mainService &&
    mainService !== "photography" &&
    mainService !== "workshop" &&
    !isBookingService;

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
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
            <select value={miniGroupSize} onChange={(event) => setMiniGroupSize(event.target.value)} required>
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
            <select value={weeklyPlan} onChange={(event) => setWeeklyPlan(event.target.value)} required>
              <option value="">Kies formule</option>
              <option value="1x">1x per week · €135/maand</option>
              <option value="2x">2x per week · €250/maand</option>
            </select>
          </label>
        )}
      </div>

      {mainService === "workshop" && (
        <p className="form-message">
          Workshops en kampen verlopen via het inschrijvingssysteem. Kies de gewenste workshop op de aanbodpagina.
        </p>
      )}

      {mainService === "photography" && (
        <a className="primary-action" href="https://www.sagophotography.be" target="_blank" rel="noopener noreferrer">
          Ga naar SaGo Photography
        </a>
      )}

      {isBookingService && (
        <div className="booking-embed-card">
          <div>
            <p className="eyebrow">Online afspraak</p>
            <h2>Plan je afspraak meteen in</h2>
            <p>
              Kies zelf een vrij moment in de agenda. Bezettingen uit Google Agenda worden automatisch meegenomen.
            </p>
          </div>

          <a className="primary-action" href={getBookingLink()} target="_blank" rel="noopener noreferrer">
            Open agenda
          </a>

          <iframe
            src={getBookingLink()}
            className="booking-iframe"
            title="Afspraak inplannen Studio SaGo"
          />
        </div>
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
            <textarea name="notes" rows={5} placeholder="Vertel kort waar je hulp bij zoekt." />
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
    </form>
  );
}