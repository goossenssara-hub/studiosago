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

function AfspraakMakenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passId = searchParams.get("passId");

  const [pass, setPass] = useState<Pass | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPass() {
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

    if (passId) loadPass();
  }, [passId, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/appointments/pass-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passId,
        email,
        date: formData.get("date"),
        time: formData.get("time"),
        appointmentType: formData.get("appointmentType"),
        customerAddress: formData.get("customerAddress"),
        notes: formData.get("notes"),
        cancellationPolicyAccepted:
          formData.get("cancellationPolicyAccepted") === "on",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Afspraak kon niet ingepland worden.");
      setSaving(false);
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
            <form onSubmit={handleSubmit} className="booking-form-with-calendar">
              <div className="form-grid">
                <label>
                  Datum
                  <input name="date" type="date" required />
                </label>

                <label>
                  Tijdstip
                  <select name="time" required>
                    <option value="">Kies tijdstip</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                </label>

                <label>
                  Type afspraak
                  <select name="appointmentType" required>
                    <option value="">Kies type afspraak</option>
                    <option value="digital">Digitaal</option>
                    <option value="home">Fysiek bij mij thuis</option>
                  </select>
                </label>

                <label>
                  Adres klant
                  <input
                    name="customerAddress"
                    placeholder="Straat, nummer, postcode en gemeente"
                  />
                </label>
              </div>

              <label style={{ display: "block", marginTop: 20 }}>
                Opmerking
                <textarea
                  name="notes"
                  rows={5}
                  placeholder="Waarmee mag ik rekening houden?"
                />
              </label>

              <label
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  marginTop: 24,
                  lineHeight: 1.5,
                }}
              >
                <input
                  name="cancellationPolicyAccepted"
                  type="checkbox"
                  required
                  style={{ marginTop: 6 }}
                />
                <span>
                  Ik ga akkoord dat een beurt enkel terug toegevoegd wordt
                  wanneer ik minstens 72 uur op voorhand annuleer. Bij
                  laattijdige annulatie blijft de beurt aangerekend.
                </span>
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 24,
                }}
              >
                <button className="primary-action" disabled={saving}>
                  {saving ? "Afspraak opslaan..." : "Afspraak bevestigen"}
                </button>
              </div>
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