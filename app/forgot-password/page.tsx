"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMessage("Er ging iets mis. Controleer je e-mailadres.");
      setLoading(false);
      return;
    }

    setMessage("We hebben je een e-mail gestuurd om je wachtwoord te resetten.");
    setLoading(false);
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Wachtwoord vergeten?</h1>
        <p className="login-subtitle">
          Vul je e-mailadres in. Je krijgt een link om een nieuw wachtwoord in te stellen.
        </p>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {errorMessage && <p className="login-error">{errorMessage}</p>}
          {message && <p className="login-success">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Verzenden..." : "Resetlink verzenden"}
          </button>
        </form>

        <Link href="/login" className="forgot-password">
          Terug naar inloggen
        </Link>
      </div>
    </main>
  );
}