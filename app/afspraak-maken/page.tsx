"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";

type Pass = {
  id: string;
  customer_email: string;
  title: string;
  total_credits: number;
  remaining_credits: number;
  status: string;
};

const GOOGLE_BEGELEIDING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0xYs93pgXTNQ64AMHTucW58L0dHnSGWXlSqcb5VupDfDXH1z6PNJkkGog_r0kcJ--csHso-STk?gv=true";

function AfspraakMakenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passId = searchParams.get("passId");

  const [pass, setPass] = useState<Pass | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [appointmentType, setAppointmentType] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [radiusAccepted, setRadiusAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadPass() {
      if (!passId) {
        setError("Geen beurtenkaart gevonden.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        router.replace("/login");
        return;
      }

      setEmail(user.email);

      const { data, error } = await supabase
        .from("passes")
        .select("*")
        .eq("id", passId)
        .eq("customer_email", user.email)
        .eq("status", "active")
        .single();

      if (error || !data) {
        setError("Geen geldige beurtenkaart gevonden.");
      } else {
        setPass(data);
      }

      setLoading(false);
    }

    loadPass();
  }, [passId, router]);

  const canShowCalendar =
    appointmentType === "digital" ||
    (appointmentType === "home" && customerAddress.trim() && radiusAccepted);

  async function handleConfirmBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pass) return;

    if (!appointmentType || !policyAccepted || !notes.trim()) {
      setError(
        "Kies een type afspraak, vul de inhoud van de bijles in en accepteer de voorwaarden."
      );
      return;
    }

    if (appointmentType === "home" && (!customerAddress.trim() || !radiusAccepted)) {
      setError("Vul je adres in en bevestig dat je binnen 15 km rond Peer woont.");
      return;
    }

    setSaving(true);
    setError("");

const response = await fetch("/api/appointments/pass-google-booking", {      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passId: pass.id,
        email,
        appointmentType,
        customerAddress,
        notes,
        cancellationPolicyAccepted: policyAccepted,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setSaving(false);
      setError(data.error || "De beurt kon niet afgeschreven worden.");
      return;
    }

    router.replace("/klantendashboard");
  }

  if (loading) {
    return (
      <PageShell>
        <section className="subpage-hero">
          <h1>Afspraak laden...</h1>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="info-grid single">
        <div className="info-card">
          {pass && (
            <>
              <h2>🎟️ {pass.title}</h2>
              <p>
                Nog <strong>{pass.remaining_credits}</strong> van de{" "}
                <strong>{pass.total_credits}</strong> beurten beschikbaar.
              </p>
            </>
          )}

          {error && (
            <p className="form-message" style={{ color: "#fe2020" }}>
              {error}
            </p>
          )}

          {pass && (
            <form onSubmit={handleConfirmBooking} className="booking-form-with-calendar">
              <div className="form-grid">
                <label>
                  Type afspraak
                  <select
                    required
                    value={appointmentType}
                    onChange={(event) => {
                      setAppointmentType(event.target.value);
                      setCustomerAddress("");
                      setRadiusAccepted(false);
                    }}
                  >
                    <option value="">Kies type afspraak</option>
                    <option value="digital">Digitaal</option>
                    <option value="home">Fysiek aan huis</option>
                  </select>
                </label>

                {appointmentType === "home" && (
                  <label>
                    Adres klant
                    <input
                      value={customerAddress}
                      onChange={(event) => setCustomerAddress(event.target.value)}
                      placeholder="Straat, nummer, postcode en gemeente"
                      required
                    />
                  </label>
                )}
              </div>

              {appointmentType === "home" && (
                <label style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <input
                    type="checkbox"
                    checked={radiusAccepted}
                    onChange={(event) => setRadiusAccepted(event.target.checked)}
                    required
                  />
                  <span>
                    Ik bevestig dat het adres binnen een straal van 15 km rond
                    Peer ligt. Fysieke begeleiding is enkel binnen deze straal
                    mogelijk.
                  </span>
                </label>
              )}

              <label style={{ display: "block", marginTop: 24 }}>
                Waarover gaat de bijles?
                <textarea
                  rows={5}
                  required
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Bijvoorbeeld: breuken, begrijpend lezen, toets Frans voorbereiden, planning maken..."
                />
              </label>

              <label style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <input
                  type="checkbox"
                  checked={policyAccepted}
                  onChange={(event) => setPolicyAccepted(event.target.checked)}
                  required
                />
                <span>
                  Ik ga akkoord dat een beurt enkel terug toegevoegd wordt
                  wanneer ik minstens 72 uur op voorhand annuleer. Bij
                  laattijdige annulatie blijft de beurt aangerekend.
                </span>
              </label>

              {canShowCalendar && policyAccepted && notes.trim() && (
                <section className="booking-calendar-panel" style={{ marginTop: 32 }}>
                  <p className="eyebrow">Google Agenda</p>
                  <h2>Kies je moment</h2>

                  <iframe
                    src={GOOGLE_BEGELEIDING_URL}
                    title="huiswerk/studiebegeleiding afspraak plannen"
                    loading="lazy"
                    className="google-booking-frame"
                    width="100%"
                    height="700"
                    style={{
                      border: 0,
                      borderRadius: "24px",
                      overflow: "hidden",
                    }}
                  />

                  <button className="primary-action" type="submit" disabled={saving}>
                    {saving
                      ? "Beurt afschrijven..."
                      : "Ik heb geboekt, schrijf 1 beurt af"}
                  </button>
                </section>
              )}
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}

export default function AfspraakMakenPage() {
  return (
    <Suspense fallback={null}>
      <AfspraakMakenContent />
    </Suspense>
  );
}