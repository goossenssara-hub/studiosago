"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="login-page">
      <Link href="/" className="login-back-button">
        ← Terug naar homepage
      </Link>

      <section className="login-card">
        <div className="login-brand">
          <img src="/logo.png" alt="Studio SaGo" />
        </div>

        <h1>Welkom terug!</h1>

        <p className="login-subtitle">
          Log in om verder te gaan met jouw leesavontuur.
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <label>
            E-mailadres
            <input
              type="email"
              placeholder="jouw@email.be"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Wachtwoord
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage && <p className="login-error">{errorMessage}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Bezig met aanmelden..." : "Inloggen →"}
          </button>
        </form>

        <div className="login-divider">
          <span></span>
          <p>of</p>
          <span></span>
        </div>

        <Link href="/register" className="register-button">
          Account aanmaken
        </Link>

        <Link href="/forgot-password" className="forgot-password">
          Wachtwoord vergeten?
        </Link>
      </section>
    </main>
  );
}