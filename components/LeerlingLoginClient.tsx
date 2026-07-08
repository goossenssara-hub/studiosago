"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const leerlingAccounts: Record<string, string> = {
  "victor.koolen": "victor.koolen@leerlingen.studiosago.local",
  "victor.koolen@leerlingen.studiosago.local":
    "victor.koolen@leerlingen.studiosago.local",
};

export default function LeerlingLoginClient() {
  const router = useRouter();
  const supabase = createClient();

  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const key = gebruikersnaam.toLowerCase().trim();
    const email = leerlingAccounts[key];

    if (!email) {
      setError("Deze gebruikersnaam bestaat niet.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    });

    if (error) {
      setError("Gebruikersnaam of wachtwoord is niet juist.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/oefenen");
  }

  return (
    <form onSubmit={handleLogin} className="leerling-login-card">
      <h1>Leerling aanmelden</h1>

      <label>
        Gebruikersnaam
        <input
          value={gebruikersnaam}
          onChange={(e) => setGebruikersnaam(e.target.value)}
          placeholder="victor.koolen"
          autoComplete="username"
        />
      </label>

      <label>
        Wachtwoord
        <input
          type="password"
          value={wachtwoord}
          onChange={(e) => setWachtwoord(e.target.value)}
          placeholder="Wachtwoord"
          autoComplete="current-password"
        />
      </label>

      {error && <p className="login-error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Aanmelden..." : "Aanmelden"}
      </button>
    </form>
  );
}