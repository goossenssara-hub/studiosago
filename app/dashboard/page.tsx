export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";

import PageShell from "@/components/PageShell";
import CustomerAppointments from "@/components/CustomerAppointments";
import CustomerPassCards from "@/components/dashboard/CustomerPassCards";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const dashboardSections = [
  { id: "profiel", title: "Mijn profiel" },
  { id: "afspraken", title: "Mijn afspraken" },
  { id: "beurtenkaarten", title: "Mijn beurtenkaarten" },
  { id: "kinderen", title: "Mijn kinderen" },
  { id: "documenten", title: "Mijn documenten" },
  { id: "webshop", title: "Webshop" },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const email = user.email.trim().toLowerCase();
  const supabaseAdmin = getSupabaseAdmin();

  const { data: profile } = await supabaseAdmin
    .from("customer_profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    redirect("/profiel-aanvullen");
  }

  const { data: students } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("parent_email", email)
    .eq("active", true)
    .order("name", {
      ascending: true,
    });

  /*
   * Dit zijn de echte beurtenkaarten uit Supabase.
   * Je hoeft dus geen tijdelijke const passes = [...] toe te voegen.
   */
  const { data: passesData } = await supabaseAdmin
    .from("passes")
    .select("*")
    .eq("customer_email", email)
    .eq("status", "active")
    .order("created_at", {
      ascending: false,
    });

  /*
   * We zetten null om naar een lege array.
   * Daardoor kunnen we overal veilig passes.length gebruiken.
   */
  const passes = passesData ?? [];

  const firstName =
    profile.first_name ||
    profile.parent1_first_name ||
    "";

  const lastName =
    profile.last_name ||
    profile.parent1_last_name ||
    "";

  const displayName =
    profile.full_name ||
    `${firstName} ${lastName}`.trim() ||
    profile.parent_name ||
    "je profiel";

  const addressParts = [
    profile.address,
    [profile.postcode, profile.city]
      .filter(Boolean)
      .join(" "),
  ].filter(Boolean);

  return (
    <PageShell>
      <main className="legal-page dashboard-page">
        <section className="subpage-hero">
          <p className="eyebrow">
            Klantendashboard
          </p>

          <h1>
            Welkom bij Studio SaGo
          </h1>

          <p>
            Ingelogd als:{" "}
            <strong>{displayName}</strong>
          </p>
        </section>

        <section className="legal-hub">
          <aside className="legal-menu">
            <p>Dashboard</p>

            {dashboardSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
              >
                {section.title}
              </a>
            ))}
          </aside>

          <div className="legal-documents">
            <article
              id="profiel"
              className="legal-card"
            >
              <p className="legal-date">
                Mijn gegevens
              </p>

              <h2>
                👤 Mijn profiel
              </h2>

              <p>
                <strong>{displayName}</strong>

                <br />

                {profile.email}
              </p>

              {addressParts.length > 0 && (
                <p>{addressParts.join(", ")}</p>
              )}

              <Link
                href="/profiel-aanvullen"
                className="primary-action"
              >
                Profiel beheren
              </Link>
            </article>

            <article
              id="afspraken"
              className="legal-card"
            >
              <h2>
                📅 Mijn afspraken
              </h2>

              <CustomerAppointments />

              <div className="dashboard-card-actions">
                <Link
                  href={
                    passes.length > 0
                      ? `/afspraak-maken?passId=${passes[0].id}`
                      : "/webshop"
                  }
                  className="primary-action"
                >
                  {passes.length > 0
                    ? "Nieuwe afspraak plannen"
                    : "Beurtenkaart bekijken"}
                </Link>
              </div>
            </article>

            <section
              id="beurtenkaarten"
              className="legal-card dashboard-passes-card"
            >
              <CustomerPassCards passes={passes} />
            </section>

            <article
              id="kinderen"
              className="legal-card"
            >
              <h2>
                👧 Mijn kinderen
              </h2>

              {students?.length ? (
                <div className="dashboard-list">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="mini-profile-card"
                    >
                      <h3>{student.name}</h3>

                      <p>
                        {student.grade}

                        {student.school
                          ? ` · ${student.school}`
                          : ""}
                      </p>

                      {student.education_level && (
                        <p>
                          Niveau:{" "}
                          {student.education_level}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>
                  Er zijn nog geen leerlingen
                  toegevoegd.
                </p>
              )}

              <br />

              <Link
                href="/profiel-aanvullen"
                className="primary-action"
              >
                Gegevens aanpassen
              </Link>
            </article>

            <article
              id="documenten"
              className="legal-card"
            >
              <h2>
                📄 Mijn documenten
              </h2>

              <p>
                Hier verschijnen later facturen,
                afspraken en downloads.
              </p>
            </article>

            <article
              id="webshop"
              className="legal-card"
            >
              <h2>
                🛒 Webshop
              </h2>

              <p>
                Bekijk beurtenkaarten, workshops,
                digitale producten en andere
                educatieve materialen.
              </p>

              <Link
                href="/webshop"
                className="primary-action"
              >
                Naar webshop
              </Link>
            </article>
          </div>
        </section>
      </main>
    </PageShell>
  );
}