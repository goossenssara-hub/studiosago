"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Pass = {
  id: string;
  user_id: string;
  type?: string | null;
  title?: string | null;
  remaining_sessions?: number | null;
  total_sessions?: number | null;
  status?: string | null;
};

export default function AfspraakMakenClient() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const service = searchParams.get("service") || "";
  const passIdFromUrl = searchParams.get("pass") || "";

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [passes, setPasses] = useState<Pass[]>([]);
  const [selectedPassId, setSelectedPassId] = useState(passIdFromUrl);
  const [error, setError] = useState("");

  async function loadPass() {
    setLoading(true);
    setError("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setError("Sessie kon niet geladen worden.");
      setLoading(false);
      return;
    }

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Gebruiker kon niet geladen worden.");
      setLoading(false);
      return;
    }

    setUserEmail(user.email || "");

    const { data, error: passError } = await supabase
      .from("passes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (passError) {
      setError("Beurtenkaarten konden niet geladen worden.");
      setLoading(false);
      return;
    }

    setPasses(data || []);

    if (!selectedPassId && data && data.length > 0) {
      setSelectedPassId(data[0].id);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <p>Beurtenkaarten worden geladen...</p>;
  }

  if (error) {
    return (
      <div className="dashboard-card">
        <p>{error}</p>
        <button type="button" onClick={loadPass} className="primary-action">
          Opnieuw proberen
        </button>
      </div>
    );
  }

  return (
    <section className="dashboard-card">
      <h2>Afspraak maken</h2>

      {userEmail && <p>Ingelogd als: {userEmail}</p>}

      {service && (
        <p>
          Gekozen dienst: <strong>{service}</strong>
        </p>
      )}

      {passes.length === 0 ? (
        <p>Je hebt momenteel geen actieve beurtenkaart.</p>
      ) : (
        <div className="form-group">
          <label htmlFor="pass">Kies je beurtenkaart</label>

          <select
            id="pass"
            value={selectedPassId}
            onChange={(event) => setSelectedPassId(event.target.value)}
          >
            {passes.map((pass) => (
              <option key={pass.id} value={pass.id}>
                {pass.title || pass.type || "Beurtenkaart"} —{" "}
                {pass.remaining_sessions ?? 0}/{pass.total_sessions ?? 10} beurten
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <p>
          Kies hieronder een moment via de agenda. De afspraak wordt gekoppeld
          aan je account.
        </p>

        <a
          href="https://calendar.app.google/RoRLnZ7ThsSkn6fx5"
          target="_blank"
          rel="noreferrer"
          className="primary-action"
        >
          Moment kiezen
        </a>
      </div>
    </section>
  );
}