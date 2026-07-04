"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";
import CustomerAppointments from "@/components/CustomerAppointments";
import SessionTimeout from "@/components/SessionTimeout";

type Pass = {
  id: string;
  customer_email: string;
  title: string;
  total_credits: number;
  remaining_credits: number;
  product?: string | null;
  level?: string | null;
  total_sessions?: number | null;
  remaining_sessions?: number | null;
  status?: string | null;
  created_at?: string | null;
};

export default function KlantendashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [passes, setPasses] = useState<Pass[]>([]);
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

        if (error || !user?.email) {
          router.replace("/login");
          return;
        }

        setEmail(user.email);

        const { data: userPasses, error: passesError } = await supabase
          .from("passes")
          .select("*")
          .eq("customer_email", user.email)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (passesError) {
          console.error("Beurtenkaarten ophalen mislukt:", passesError);
          setPasses([]);
          return;
        }

        setPasses(userPasses || []);
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
        <p className="eyebrow">Klantendashboard</p>
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
          <h2>🎟️ Mijn beurtenkaarten</h2>

          {passes.length === 0 ? (
            <>
              <p>Je hebt momenteel geen actieve beurtenkaart.</p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 24,
                }}
              >
                <Link href="/webshop" className="primary-action">
                  Beurtenkaart kopen
                </Link>
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {passes.map((pass) => {
                const total = pass.total_sessions ?? pass.total_credits;
                const remaining =
                  pass.remaining_sessions ?? pass.remaining_credits;
                const title = pass.product ?? pass.title;
                const percentage = total > 0 ? (remaining / total) * 100 : 0;

                return (
                  <div
                    key={pass.id}
                    style={{
                      padding: 20,
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      background: "#fff",
                    }}
                  >
                    <h3 style={{ color: "#033663", marginBottom: 8 }}>
                      {title}
                    </h3>

                    <p>
                      Nog <strong>{remaining}</strong> van de{" "}
                      <strong>{total}</strong> beurten beschikbaar.
                    </p>

                    <div
                      style={{
                        height: 12,
                        background: "#e5e7eb",
                        borderRadius: 999,
                        overflow: "hidden",
                        marginTop: 14,
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          background: "#28b9aa",
                          height: "100%",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 20,
                      }}
                    >
                      <Link
                        href={`/afspraak-maken?passId=${pass.id}`}
                        className="primary-action"
                      >
                        Afspraak plannen
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="info-card">
          <h2>📄 Mijn documenten</h2>
          <p>Hier verschijnen later facturen, afspraken en downloads.</p>
        </div>
      </section>

      <section className="info-grid single">
        <div className="info-card cta-card">
          <h2>Afmelden</h2>
          <p>Wil je uitloggen uit je klantendashboard?</p>

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