"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

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

    if (error) {
      setLoading(false);
      setErrorMessage("Onjuist e-mailadres of wachtwoord.");
      return;
    }

    // Enkel jouw account toegang geven
    if (data.user?.email !== "goossens.saraa@gmail.com") {
      await supabase.auth.signOut();

      setLoading(false);
      setErrorMessage("Je hebt geen toegang tot het beheerpaneel.");
      return;
    }

    router.refresh();
    router.push("/admin");
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleLogin}>

        <h1>Studio SaGo Beheer</h1>

        <p>Meld je aan om verder te gaan.</p>

        <input
          type="email"
          placeholder="E-mailadres"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {errorMessage && (
          <p className="login-error">{errorMessage}</p>
        )}

        <button disabled={loading}>
          {loading ? "Bezig..." : "Inloggen"}
        </button>

      </form>
    </main>
  );
}