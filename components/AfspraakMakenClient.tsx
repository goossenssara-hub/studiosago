"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Pass = {
  id: string;
  user_id?: string | null;
  type?: string | null;
  title?: string | null;
  remaining_sessions?: number | null;
  total_sessions?: number | null;
  status?: string | null;
};

type AfspraakMakenClientProps = {
  pass?: Pass | null;
  email?: string | null;
};

export default function AfspraakMakenClient({
  pass,
  email,
}: AfspraakMakenClientProps) {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const service = searchParams.get("service") || "";
  const passIdFromUrl = searchParams.get("pass") || pass?.id || "";

  const [loading, setLoading] = useState(!pass);
  const [userEmail, setUserEmail] = useState(email || "");
  const [passes, setPasses] = useState<Pass[]>(pass ? [pass] : []);
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

    setUserEmail(user.email || email || "");

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

    const loadedPasses = data || [];
    setPasses(loadedPasses);

    if (!selectedPassId && loadedPasses.length > 0) {
      setSelectedPassId(loadedPasses[0].id);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!pass) {
      loadPass();
    }
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
            {passes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title || item.type || "Beurtenkaart"} —{" "}
                {item.remaining_sessions ?? 0}/{item.total_sessions ?? 10}{" "}
                beurten
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