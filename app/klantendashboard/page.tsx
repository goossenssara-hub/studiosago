"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function KlantDashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setEmail(data.user.email ?? null);
      setLoading(false);
    }

    checkUser();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <PageShell>
        <section className="subpage-hero">
          <p>Dashboard laden...</p>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Klantdashboard</p>
        <h1>Welkom bij Studio SaGo.</h1>
        <p>Ingelogd als {email}</p>
      </section>

      <section className="info-grid">
        <div className="info-card">
          <h2>Mijn afspraken</h2>
          <p>Hier komen later de geplande afspraken.</p>
        </div>

        <div className="info-card">
          <h2>Mijn beurtenkaart</h2>
          <p>Hier komt later het aantal resterende beurten.</p>
        </div>

        <div className="info-card">
          <h2>Mijn documenten</h2>
          <p>Hier komen later facturen, afspraken en bestanden.</p>
        </div>
      </section>

      <section className="info-grid single">
        <div className="info-card cta-card">
          <h2>Afmelden</h2>
          <p>Wil je uitloggen uit je klantdashboard?</p>

          <button className="primary-action" onClick={logout}>
            Uitloggen
          </button>

          <br />
          <br />

          <Link href="/" className="secondary-action">
            Terug naar home
          </Link>
        </div>
      </section>
    </PageShell>
  );
}