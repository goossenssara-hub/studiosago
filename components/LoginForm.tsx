"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("E-mailadres of wachtwoord is niet juist.");
      return;
    }

    router.replace("/klantendashboard");
  }

  async function resetPassword() {
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setMessage("Wachtwoord resetten lukt niet.");
      return;
    }

    setMessage("Check je mailbox om je wachtwoord opnieuw in te stellen.");
  }

  return (
    <form className="form-card login-card" onSubmit={handleLogin}>
      <label>
        E-mail
        <input
          type="email"
          placeholder="jij@email.be"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
<br>
</br>
      <label>
        Wachtwoord
        <input
          type="password"
          placeholder="Je wachtwoord"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      <button className="primary-action" type="submit" disabled={loading}>
        {loading ? "Inloggen..." : "Inloggen"}
      </button>

      <button
        type="button"
        className="secondary-action"
        onClick={resetPassword}
      >
        Wachtwoord vergeten?
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  );
}