"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setErrorMessage("Onjuist e-mailadres of wachtwoord.");
      setLoading(false);
      return;
    }

    if (data.user.email !== "goossens.saraa@gmail.com") {
      await supabase.auth.signOut();
      setErrorMessage("Je hebt geen toegang tot het beheerpaneel.");
      setLoading(false);
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

        {errorMessage && <p className="login-error">{errorMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Bezig..." : "Inloggen"}
        </button>
      </form>
    </main>
  );
}