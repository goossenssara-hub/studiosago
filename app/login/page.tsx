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
        ← Home
      </Link>

      <section className="login-card">
        <h1>Welkom terug</h1>

        <p>Meld je aan om je dashboard te openen.</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {errorMessage && <div className="login-error">{errorMessage}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Bezig met aanmelden..." : "Inloggen"}
          </button>
        </form>

        <div className="login-divider">
          <span></span>
          <p>OF</p>
          <span></span>
        </div>

        <Link href="/register" className="create-account-button">
          Account aanmaken
        </Link>

        <Link href="/forgot-password" className="forgot-password-link">
          Wachtwoord vergeten?
        </Link>
      </section>
    </main>
  );
}