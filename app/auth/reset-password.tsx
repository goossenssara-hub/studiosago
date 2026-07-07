"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Supabase is niet geconfigureerd.");
      return;
    }

    if (password !== repeatPassword) {
      setMessage("De wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("Je wachtwoord kon niet aangepast worden.");
      return;
    }

    setMessage("Je wachtwoord is aangepast. Je wordt doorgestuurd...");

    setTimeout(() => {
      router.replace("/dashboard");
    }, 1200);
  }

  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Wachtwoord resetten</p>
        <h1>Kies een nieuw wachtwoord.</h1>
        <p>Vul hieronder je nieuwe wachtwoord in.</p>
      </section>

      <form className="form-card login-card" onSubmit={handleReset}>
        <label>
          Nieuw wachtwoord
          <input
            type="password"
            placeholder="Nieuw wachtwoord"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <label>
          Herhaal wachtwoord
          <input
            type="password"
            placeholder="Herhaal wachtwoord"
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
            required
          />
        </label>

        <button className="primary-action" type="submit" disabled={loading}>
          {loading ? "Opslaan..." : "Nieuw wachtwoord opslaan"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </PageShell>
  );
}