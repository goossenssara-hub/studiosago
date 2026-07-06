"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("Wachtwoord kon niet aangepast worden.");
      return;
    }

    setMessage("Wachtwoord aangepast.");
    router.replace("/klantendashboard");
  }

  return (
    <PageShell>
      <section className="info-grid single">
        <div className="info-card">
          <h1>Wachtwoord aanpassen</h1>

          <form onSubmit={handleSubmit} className="booking-form-with-calendar">
            <label>
              Nieuw wachtwoord
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button className="primary-action" type="submit">
              Wachtwoord opslaan
            </button>

            {message && <p className="form-message">{message}</p>}
          </form>
        </div>
      </section>
    </PageShell>
  );
}