"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAIL = "creativestudiosago@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || data.user.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setErrorMessage("Geen toegang tot het adminpaneel.");
      return;
    }

    router.refresh();
    router.push("/admin");
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Studio SaGo Admin</h1>
        <p>Meld je aan als beheerder.</p>

        <input
          type="email"
          value={email}
          readOnly
        />

        <input
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {errorMessage && <p className="login-error">{errorMessage}</p>}

        <button type="submit">Inloggen als admin</button>
      </form>
    </main>
  );
}