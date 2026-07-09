"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LeerlingLoginClient() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError("");
  setLoading(true);

  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: wachtwoord,
    });

    console.log("LEERLING LOGIN DATA:", data);
    console.log("LEERLING LOGIN ERROR:", error);

    if (error) {
      setError(error.message || "Gebruikersnaam of wachtwoord is niet juist.");
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Geen geldige sessie ontvangen.");
      setLoading(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem("studio-sago-remember-leerling", email);
    }

window.location.href = "/leerling-portaal";  } catch (err) {
    console.error("LEERLING LOGIN CATCH:", err);
    setError("Er ging iets mis bij het aanmelden.");
    setLoading(false);
  }
}
  return (
    <main className="leerling-login-page">
      <section className="leerling-login-card">
        <div className="leerling-login-left">
          <p className="leerling-login-badge">Studio SaGo leerlingportaal</p>

          <h1>Welkom terug!</h1>

          <p className="leerling-login-text">
            Meld je aan om je planner, huistaken en to-do’s te bekijken.
          </p>

          <form className="leerling-login-form" onSubmit={handleLogin}>
            <label>
              Gebruikersnaam
              <div className="leerling-input">
                <span>✉️</span>
                <input
                  type="email"
                  placeholder="voornaam.achternaam@studiosago.be"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label>
              Wachtwoord
              <div className="leerling-input">
                <span>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Wachtwoord"
                  value={wachtwoord}
                  onChange={(e) => setWachtwoord(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Verberg" : "Toon"}
                </button>
              </div>
            </label>

            <div className="leerling-options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Onthoud mij
              </label>

              <a href="/forgot-password">Wachtwoord vergeten?</a>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button className="leerling-submit" type="submit" disabled={loading}>
              {loading ? "Aanmelden..." : "Aanmelden →"}
            </button>
          </form>

          <p className="leerling-help">
            Nog geen account? Vraag je account aan bij Studio SaGo.
          </p>
        </div>

        <div className="leerling-login-right">
          <div className="leerling-logo">
            <Image
              src="public/assets/LLportaal.png"
              alt="Studio SaGo Leerlingportaal"
              width={260}
              height={260}
              priority
            />
          </div>

          <div className="leerling-mini-card">
            <strong>Vandaag</strong>
            <span>3 taken klaar</span>
          </div>

          <div className="leerling-mini-card second">
            <strong>Planner</strong>
            <span>Weekoverzicht</span>
          </div>
        </div>
      </section>
    </main>
  );
}