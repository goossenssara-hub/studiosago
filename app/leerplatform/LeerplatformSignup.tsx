"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Gift,
  Heart,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type FormState = {
  firstName: string;
  email: string;
  role: string;
  childrenAges: string;
  privacyConsent: boolean;
  updatesConsent: boolean;
  website: string;
};

const initialState: FormState = {
  firstName: "",
  email: "",
  role: "",
  childrenAges: "",
  privacyConsent: false,
  updatesConsent: false,
  website: "",
};

export default function LeerplatformSignup() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/leerplatform-aanmelden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Je aanmelding kon niet worden verwerkt.");
      }

      setStatus("success");
      setMessage(result.message || "Je staat op de pionierslijst!");
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Er ging iets mis. Probeer het opnieuw.");
    }
  }

  return (
    <div className="lp-page">
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <span className="lp-kicker"><Sparkles size={17} /> Een nieuwe leerwereld groeit</span>
          <h1>Groei vanaf het allereerste begin met ons mee.</h1>
          <p className="lp-intro">
            Studio SaGo bouwt aan een warm en doordacht leerplatform waar kinderen
            op hun eigen tempo kunnen oefenen, ontdekken en groeien. Zonder
            prestatiedruk.
          </p>

          <div className="lp-lifetime-card">
            <span className="lp-gift-icon"><Gift size={28} /></span>
            <div>
              <span className="lp-small-label">Exclusief voor vroege inschrijvers</span>
              <strong>Levenslang gratis toegang</strong>
              <p>
                Meld je via deze pagina aan en ontvang bij de lancering levenslang
                gratis toegang tot het leerplatform én alle extra&apos;s binnen het platform.
              </p>
            </div>
          </div>

          <ul className="lp-benefits" aria-label="Voordelen">
            <li><Check size={19} /> Als eerste nieuws en previews ontvangen</li>
            <li><Check size={19} /> Meedenken tijdens de ontwikkeling</li>
            <li><Check size={19} /> Geen abonnementskosten, nu of later</li>
          </ul>
        </div>

        <div className="lp-form-wrap" id="aanmelden">
          <div className="lp-form-heading">
            <span className="lp-form-icon"><Mail size={23} /></span>
            <div>
              <p className="lp-eyebrow">Pionierslijst</p>
              <h2>Reserveer je gratis toegang</h2>
            </div>
          </div>

          {status === "success" ? (
            <div className="lp-success" role="status">
              <span><Heart size={30} /></span>
              <h3>Welkom bij de pioniers!</h3>
              <p>{message}</p>
              <p className="lp-success-note">
                Bewaar het e-mailadres waarmee je je hebt aangemeld. Daaraan wordt je
                levenslange gratis toegang gekoppeld.
              </p>
              <button type="button" onClick={() => setStatus("idle")}>
                Nog iemand aanmelden
              </button>
            </div>
          ) : (
            <form className="lp-form" onSubmit={handleSubmit} noValidate>
              <label>
                Voornaam <span>*</span>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Jouw voornaam"
                  required
                />
              </label>

              <label>
                E-mailadres <span>*</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jij@voorbeeld.be"
                  required
                />
              </label>

              <div className="lp-field-row">
                <label>
                  Ik ben...
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="">Maak een keuze</option>
                    <option value="ouder">Ouder</option>
                    <option value="leerkracht">Leerkracht</option>
                    <option value="thuisonderwijs">Betrokken bij thuisonderwijs</option>
                    <option value="begeleider">Begeleider of zorgprofessional</option>
                    <option value="anders">Anders</option>
                  </select>
                </label>

                <label>
                  Leeftijd kind(eren)
                  <input
                    type="text"
                    value={form.childrenAges}
                    onChange={(e) => setForm({ ...form, childrenAges: e.target.value })}
                    placeholder="Bijv. 4 en 7 jaar"
                  />
                </label>
              </div>

              <div className="lp-honeypot" aria-hidden="true">
                <label>
                  Website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </label>
              </div>

              <label className="lp-check">
                <input
                  type="checkbox"
                  checked={form.updatesConsent}
                  onChange={(e) => setForm({ ...form, updatesConsent: e.target.checked })}
                  required
                />
                <span>
                  Ik wil updates ontvangen over de ontwikkeling en lancering van het
                  Studio SaGo-leerplatform. <b>*</b>
                </span>
              </label>

              <label className="lp-check">
                <input
                  type="checkbox"
                  checked={form.privacyConsent}
                  onChange={(e) => setForm({ ...form, privacyConsent: e.target.checked })}
                  required
                />
                <span>
                  Ik ga akkoord met de verwerking van mijn gegevens zoals beschreven in
                  het <Link href="/algemene-voorwaarden#privacy">privacybeleid</Link>. <b>*</b>
                </span>
              </label>

              {status === "error" && <p className="lp-error" role="alert">{message}</p>}

              <button className="lp-submit" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Aanmelding verwerken..." : "Ja, reserveer mijn gratis toegang"}
                {status !== "loading" && <ArrowRight size={20} />}
              </button>

              <p className="lp-trust"><ShieldCheck size={16} /> Geen spam. Uitschrijven kan op elk moment.</p>
            </form>
          )}
        </div>
      </section>

      <section className="lp-vision">
        <p className="lp-eyebrow">Samen groeien, elke dag</p>
        <h2>Een leerplatform dat verder kijkt dan punten.</h2>
        <div className="lp-vision-grid">
          <article>
            <span>🌱</span>
            <h3>Op eigen tempo</h3>
            <p>Oefenen met ruimte voor herhaling, differentiatie en kleine succeservaringen.</p>
          </article>
          <article>
            <span>🧭</span>
            <h3>Zonder prestatiedruk</h3>
            <p>Geen onderlinge vergelijking, maar formatieve feedback die toont wat al lukt.</p>
          </article>
          <article>
            <span>🏔️</span>
            <h3>Een wereld die meegroeit</h3>
            <p>Nieuwe leerinhouden en extra&apos;s worden stap voor stap aan het platform toegevoegd.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
