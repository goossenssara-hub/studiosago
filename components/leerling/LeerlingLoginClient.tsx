"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import "@/app/styles/leerling-login.css";
const leerlingAccounts: Record<string, string> = {
  "victor.koolen": "victor.koolen@studiosago.be",
  "victor.koolen@studiosago.be": "victor.koolen@studiosago.be",
  "lou.koolen": "lou.koolen@studiosago.be",
  "lou.koolen@studiosago.be": "lou.koolen@studiosago.be",
};

export default function LeerlingLoginClient() {
  const router = useRouter();
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [toonWachtwoord, setToonWachtwoord] = useState(false);
  const [onthoudMij, setOnthoudMij] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const key = gebruikersnaam.toLowerCase().trim();
    const email = leerlingAccounts[key];

    if (!email) {
      setError("Deze gebruikersnaam bestaat niet.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    });

    if (error) {
      setError("Gebruikersnaam of wachtwoord is niet juist.");
      setLoading(false);
      return;
    }

    if (onthoudMij) localStorage.setItem("studio-sago-leerling", key);
    router.push("/dashboard/oefenen");
    router.refresh();
  }

  return (
    <main className="leerling-login-page">

      <section className="leerling-login-shell" aria-label="Studio SaGo leerlingportaal">
        <div className="leerling-login-left">
          <Link href="/" className="back-home-button" aria-label="Terug naar homepagina">
            ← Terug naar home
          </Link>

          <form onSubmit={handleLogin} className="leerling-login-form">
            <p className="portal-pill">Studio SaGo leerlingportaal</p>
            <h1>Welkom<br />terug!</h1>
            <p className="login-subtitle">Meld je aan om je planner, huistaken en to-do’s te bekijken.</p>

            <label className="login-field">
              <span>Gebruikersnaam</span>
              <div className="login-input-wrap">
                <span aria-hidden="true" className="login-icon">♡</span>
                <input
                  value={gebruikersnaam}
                  onChange={(e) => setGebruikersnaam(e.target.value)}
                  placeholder="voornaam.achternaam@studiosago.be"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="login-field">
              <span>Wachtwoord</span>
              <div className="login-input-wrap">
                <span aria-hidden="true" className="login-icon">⌘</span>
                <input
                  type={toonWachtwoord ? "text" : "password"}
                  value={wachtwoord}
                  onChange={(e) => setWachtwoord(e.target.value)}
                  placeholder="Wachtwoord"
                  autoComplete="current-password"
                />
                <button type="button" className="show-password" onClick={() => setToonWachtwoord((v) => !v)}>
                  {toonWachtwoord ? "Verberg" : "Toon"}
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" checked={onthoudMij} onChange={(e) => setOnthoudMij(e.target.checked)} />
                <span>Onthoud mij</span>
              </label>
              <Link href="/wachtwoord-vergeten" className="forgot-password">Wachtwoord vergeten?</Link>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Aanmelden..." : "Aanmelden"}<span aria-hidden="true">→</span>
            </button>

            <p className="account-note">Nog geen account? Vraag je account aan bij Studio SaGo.</p>
          </form>
        </div>

        <aside className="leerling-login-right" aria-label="Leerlingportaal illustratie">
          <img className="portal-bg" src="/assets/leerling-login/portal-panel-bg.png" alt="" aria-hidden="true" />
          <img className="portal-logo" src="/assets/leerling-login/studio-sago-logo.png" alt="Studio SaGo Leerlingportaal" />
          <img className="student-circle" src="/assets/leerling-login/student-circle.png" alt="" aria-hidden="true" />

          <div className="portal-card portal-card-today">
            <img src="/assets/leerling-login/today-icon.png" alt="" aria-hidden="true" />
            <div><strong>Vandaag</strong><span>3 taken klaar</span></div>
            <span aria-hidden="true">→</span>
          </div>

          <div className="portal-card portal-card-planner">
            <img src="/assets/leerling-login/planner-icon.png" alt="" aria-hidden="true" />
            <div><strong>Planner</strong><span>Weekoverzicht</span></div>
            <span aria-hidden="true">→</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
