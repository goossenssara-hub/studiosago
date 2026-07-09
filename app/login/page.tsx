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
      <div className="login-card">

        <div className="login-header">

          <Link href="/" className="back-home-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>

            <span>Terug naar homepage</span>
          </Link>

          <h1>Welkom terug</h1>

          <p className="login-subtitle">
            Meld je aan om je dashboard te openen.
          </p>

        </div>

        <form onSubmit={handleLogin}>
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

          {errorMessage && (
            <p className="login-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Bezig met aanmelden..." : "Inloggen"}
          </button>
        </form>

        <div className="login-divider">
          <span>OF</span>
        </div>

        <Link
          href="/register"
          className="register-button"
        >
          Account aanmaken
        </Link>

        <Link
          href="/forgot-password"
          className="forgot-password"
        >
          Wachtwoord vergeten?
        </Link>

      </div>
    </main>
  );
}