"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/klantdashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage("De inloglink kon niet verzonden worden.");
      return;
    }

    setMessage("Check je mailbox. Je inloglink is verzonden.");
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

      <button className="primary-action" type="submit" disabled={loading}>
        {loading ? "Verzenden..." : "Stuur inloglink"}
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  );
}