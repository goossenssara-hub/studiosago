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
      setErrorMessage("E-mailadres of wachtwoord is niet juist.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="login-page">
      <Link href="/" className="login-back-button">
        <span>←</span>
        Terug naar homepage
      </Link>

      <section className="login-card">
        <div className="login-decoration login-decoration-top" />
        <div className="login-decoration login-decoration-bottom" />

        <div className="login-brand">
          <img src="/assets/logo-studio-sago.svg" alt="Studio SaGo" />
        </div>

        <h1>Welkom terug!</h1>

        <p className="login-subtitle">
          Log in om verder te gaan met jouw leesavontuur.
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <label>
            E-mailadres
            <div className="login-input-wrap">
              <span className="login-icon">✉</span>
              <input
                type="email"
                placeholder="jouw@email.be"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label>
            Wachtwoord
            <div className="login-input-wrap">
              <span className="login-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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
          </label>

          <div className="login-options">
            <Link href="/forgot-password">Wachtwoord vergeten?</Link>

            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Onthoud mij
            </label>
          </div>

          {errorMessage && <p className="login-error">{errorMessage}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Bezig met aanmelden..." : "Inloggen"}
            <span>→</span>
          </button>
        </form>

        <div className="login-divider">
          <span />
          <p>of</p>
          <span />
        </div>

        <Link href="/register" className="register-button">
          Account aanmaken
        </Link>
      </section>
    </main>
  );
}