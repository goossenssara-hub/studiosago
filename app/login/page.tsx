"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/app/styles/loginpagina.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("E-mailadres of wachtwoord is niet correct.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="login-page">
      <Link href="/" className="back-home-button">
        <span>←</span>
        Terug naar home
      </Link>

      <section className="login-shell">
        <div className="login-left">
          <div className="login-pill">Studio SaGo Leerlingportaal</div>

          <h1>
            Welkom
            <br />
            terug!
          </h1>

          <p className="login-subtitle">
            Meld je aan om je planner, huistaken en to-do’s te bekijken.
          </p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Gebruikersnaam</label>

              <div className="input-shell">
                <span className="input-icon">♡</span>

                <input
                  id="email"
                  type="email"
                  placeholder="voornaam.achternaam@studiosago.be"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Wachtwoord</label>

              <div className="input-shell">
                <span className="input-icon">✣</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Wachtwoord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="show-password-button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Verberg" : "Toon"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-check">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Onthoud mij</span>
              </label>

              <Link href="/forgot-password">Wachtwoord vergeten?</Link>
            </div>

            {errorMessage && <p className="login-error">{errorMessage}</p>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Bezig met aanmelden..." : "Aanmelden →"}
            </button>
          </form>

          <p className="login-help">
            Nog geen account? Vraag je account aan bij Studio SaGo.
          </p>
        </div>

        <div className="login-right">
          <div className="right-logo">
            <div className="mountain-icon">⌃</div>
            <span>Studio <strong>SaGo</strong></span>
            <small>Leerlingportaal</small>
          </div>

          <div className="illustration-circle">
            <div className="book-shape"></div>
            <div className="star star-one">✦</div>
            <div className="star star-two">✦</div>
            <div className="star star-three">✦</div>
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>
          </div>

          <div className="floating-card today-card">
            <strong>Vandaag</strong>
            <span>3 taken klaar</span>
          </div>

          <div className="floating-card planner-card">
            <strong>Planner</strong>
            <span>Weekoverzicht</span>
          </div>
        </div>
      </section>
    </main>
  );
}