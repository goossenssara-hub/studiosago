"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

console.log("LOGIN DATA:", data);
console.log("LOGIN ERROR:", error);

if (error) {
  setErrorMessage(error.message);
  setLoading(false);
  return;
}
    router.refresh();
    router.push("/dashboard");
  }

  return (
    <main className="login-page">
      <div className="login-card">

        <h1>Welkom terug</h1>

        <p className="login-subtitle">
          Meld je aan om je dashboard te openen.
        </p>

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
            <p className="login-error">{errorMessage}</p>
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

        <Link href="/register" className="register-button">
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