"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";
import CustomerAppointments from "@/components/CustomerAppointments";
import SessionTimeout from "@/components/SessionTimeout";

export default function KlantDashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/login");
          return;
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.replace("/login");
          return;
        }

        setEmail(user.email ?? null);
      } catch (err) {
        console.error(err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <PageShell>
        <section className="subpage-hero">
          <h1>Dashboard laden...</h1>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SessionTimeout />
      <section className="subpage-hero">
        <p className="eyebrow">Klantdashboard</p>
        <h1>Welkom bij Studio SaGo</h1>
        <p>
          Ingelogd als <strong>{email}</strong>
        </p>
      </section>

      <section className="info-grid">
        <div className="info-card">
          <h2>📅 Mijn afspraken</h2>
          {email && <CustomerAppointments email={email} />}
        </div>

        <div className="info-card">
          <h2>🎟️ Mijn beurtenkaart</h2>
          <p>Hier zie je later het aantal resterende beurten.</p>
        </div>

        <div className="info-card">
          <h2>📄 Mijn documenten</h2>
          <p>Hier verschijnen later facturen, afspraken en downloads.</p>
        </div>
      </section>

      <section className="info-grid single">
        <div className="info-card cta-card">
          <h2>Afmelden</h2>
          <p>Wil je uitloggen uit je klantdashboard?</p>

          <div className="dashboard-buttons">
            <button className="primary-action" onClick={logout}>
              Uitloggen
            </button>

            <Link href="/" className="secondary-action">
              Terug naar home
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}