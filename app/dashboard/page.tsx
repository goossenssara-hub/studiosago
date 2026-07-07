import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Klantendashboard</p>

        <h1>Welkom bij Studio SaGo</h1>

        <p>Ingelogd als {user.email}</p>
      </section>

      <section className="dashboard-grid">

        <article className="dashboard-card">
          <h2>📅 Mijn afspraken</h2>

          <p>
            Er staan momenteel geen actieve afspraken in je dashboard.
          </p>
        </article>

        <article className="dashboard-card">
          <h2>🎟️ Mijn beurtenkaarten</h2>

          <div className="lesson-card-mini">

            <h3>10-beurtenkaart Lager onderwijs</h3>

            <p>Nog 10 van de 10 beurten beschikbaar.</p>

            <div className="lesson-progress">
              <span style={{ width: "100%" }} />
            </div>

            <a
              href="/dashboard/afspraak-plannen"
              className="orange-button"
            >
              Afspraak plannen
            </a>

          </div>
        </article>

        <article className="dashboard-card">
          <h2>📄 Mijn documenten</h2>

          <p>
            Hier verschijnen later facturen, afspraken en downloads.
          </p>
        </article>

      </section>
    </PageShell>
  );
}