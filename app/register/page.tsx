"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      },
    });

    if (error) {
      setErrorMessage("Account aanmaken is niet gelukt.");
      setLoading(false);
      return;
    }

    if (data.user) {
      setMessage("Account aangemaakt. Je kan nu inloggen.");
      setTimeout(() => router.push("/login"), 1500);
    }

    setLoading(false);
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Account aanmaken</h1>
        <p className="login-subtitle">
          Maak een account aan om je lessen, afspraken en beurtenkaarten te beheren.
        </p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Voornaam"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Familienaam"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Telefoonnummer"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

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
            minLength={6}
            required
          />

          {errorMessage && <p className="login-error">{errorMessage}</p>}
          {message && <p className="login-success">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Account wordt aangemaakt..." : "Account aanmaken"}
          </button>
        </form>

        <Link href="/login" className="forgot-password">
          Ik heb al een account
        </Link>
      </div>
    </main>
  );
}