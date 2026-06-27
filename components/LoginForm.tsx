"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    setLoading(false);
    setMessage(error ? "Inloggen lukte niet. Controleer Supabase Auth." : "Check je mailbox voor de inloglink.");
  }

  return (
    <form className="form-card small" onSubmit={handleLogin}>
      <label>
        E-mail
        <input name="email" type="email" required placeholder="jij@email.be" />
      </label>
      <button className="primary-action" type="submit" disabled={loading}>{loading ? "Verzenden..." : "Stuur inloglink"}</button>
      {message && <p className="form-message">{message}</p>}
    </form>
  );
}
