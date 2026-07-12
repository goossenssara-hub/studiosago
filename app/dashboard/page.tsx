export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";

import PageShell from "@/components/PageShell";
import CustomerAppointments from "@/components/CustomerAppointments";
import CustomerPassCards from "@/components/dashboard/CustomerPassCards";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

import "@/app/styles/dashboard.css";

const dashboardSections = [
  {
    id: "overzicht",
    title: "Overzicht",
    icon: "⌂",
  },
  {
    id: "afspraken",
    title: "Afspraken",
    icon: "📅",
  },
  {
    id: "beurtenkaarten",
    title: "Beurtenkaarten",
    icon: "🎟️",
  },
  {
    id: "kinderen",
    title: "Kinderen",
    icon: "👧",
  },
  {
    id: "documenten",
    title: "Documenten",
    icon: "📄",
  },
  {
    id: "webshop",
    title: "Webshop",
    icon: "🛒",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const email = user.email
    .trim()
    .toLowerCase();

  const supabaseAdmin =
    getSupabaseAdmin();

  const { data: profile } =
    await supabaseAdmin
      .from("customer_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

  if (!profile) {
    redirect("/profiel-aanvullen");
  }

  const { data: studentsData } =
    await supabaseAdmin
      .from("students")
      .select("*")
      .eq("parent_email", email)
      .eq("active", true)
      .order("name", {
        ascending: true,
      });

  const { data: passesData } =
    await supabaseAdmin
      .from("passes")
      .select("*")
      .eq("customer_email", email)
      .eq("status", "active")
      .order("created_at", {
        ascending: false,
      });

  const students =
    studentsData ?? [];

  const passes =
    passesData ?? [];

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

  const firstPassId =
    passes[0]?.id;

  const appointmentLink =
    firstPassId
      ? `/afspraak-maken?passId=${firstPassId}`
      : "/webshop";

  return (
    <PageShell>
      <main className="customer-dashboard">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">
              Klantendashboard
            </p>

            <h1>
              Welkom,{" "}
              {firstName ||
                displayName}
            </h1>

            <p>
              Beheer hier je afspraken,
              beurtenkaarten, kinderen en
              documenten.
            </p>
          </div>

          <div className="dashboard-welcome-actions">
            <Link
              href={appointmentLink}
              className="dashboard-main-button"
            >
              <span>＋</span>

              {firstPassId
                ? "Afspraak plannen"
                : "Beurtenkaart bekijken"}
            </Link>

            <Link
              href="/profiel-aanvullen"
              className="dashboard-secondary-button"
            >
              Profiel beheren
            </Link>
          </div>
        </section>

        <section className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <div className="dashboard-sidebar-profile">
              <div className="dashboard-avatar">
                {firstName
                  ? firstName
                      .charAt(0)
                      .toUpperCase()
                  : "S"}
              </div>

              <div>
                <strong>
                  {displayName}
                </strong>

                <span>
                  {profile.email}
                </span>
              </div>
            </div>

            <nav
              className="dashboard-navigation"
              aria-label="Dashboardnavigatie"
            >
              {dashboardSections.map(
                (section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                  >
                    <span
                      aria-hidden="true"
                    >
                      {section.icon}
                    </span>

                    {section.title}
                  </a>
                )
              )}
            </nav>

            <Link
              href="/webshop"
              className="dashboard-sidebar-shop"
            >
              <span>🛒</span>
              Naar de webshop
            </Link>
          </aside>

          <div className="dashboard-content">
            <section
              id="overzicht"
              className="dashboard-summary-grid"
            >
              <article className="dashboard-summary-card dashboard-summary-card--profile">
                <div className="dashboard-card-heading">
                  <span className="dashboard-card-icon">
                    👤
                  </span>

                  <div>
                    <p>Persoonlijke gegevens</p>
                    <h2>Mijn profiel</h2>
                  </div>
                </div>

                <div className="dashboard-profile-details">
                  <strong>
                    {displayName}
                  </strong>

                  <span>
                    {profile.email}
                  </span>

                  {addressParts.length >
                    0 && (
                    <span>
                      {addressParts.join(
                        ", "
                      )}
                    </span>
                  )}
                </div>

                <Link
                  href="/profiel-aanvullen"
                  className="dashboard-card-link"
                >
                  Profiel beheren
                  <span>→</span>
                </Link>
              </article>

              <article
                id="kinderen"
                className="dashboard-summary-card dashboard-summary-card--children"
              >
                <div className="dashboard-card-heading">
                  <span className="dashboard-card-icon">
                    👧
                  </span>

                  <div>
                    <p>
                      Gekoppelde leerlingen
                    </p>

                    <h2>
                      Mijn kinderen
                    </h2>
                  </div>
                </div>

                {students.length > 0 ? (
                  <div className="dashboard-children-list">
                    {students
                      .slice(0, 3)
                      .map((student) => (
                        <div
                          key={
                            student.id
                          }
                          className="dashboard-child-row"
                        >
                          <div className="dashboard-child-avatar">
                            {String(
                              student.name ||
                                "L"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                student.name
                              }
                            </strong>

                            <span>
                              {[
                                student.grade,
                                student.school,
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(" · ")}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="dashboard-muted">
                    Er zijn nog geen
                    leerlingen toegevoegd.
                  </p>
                )}

                <Link
                  href="/profiel-aanvullen"
                  className="dashboard-card-link"
                >
                  Gegevens aanpassen
                  <span>→</span>
                </Link>
              </article>
            </section>

            <section
              id="afspraken"
              className="dashboard-section-card dashboard-section-card--wide"
            >
              <div className="dashboard-section-header">
                <div className="dashboard-card-heading">
                  <span className="dashboard-card-icon dashboard-card-icon--orange">
                    📅
                  </span>

                  <div>
                    <p>
                      Planning en begeleiding
                    </p>

                    <h2>
                      Mijn afspraken
                    </h2>
                  </div>
                </div>

                <Link
                  href={appointmentLink}
                  className="dashboard-small-button"
                >
                  Nieuwe afspraak
                </Link>
              </div>

              <CustomerAppointments />
            </section>

            <section
              id="beurtenkaarten"
              className="dashboard-section-card dashboard-section-card--passes"
            >
              <CustomerPassCards
                passes={passes}
              />
            </section>

            <section className="dashboard-bottom-grid">
              <article
                id="documenten"
                className="dashboard-summary-card dashboard-summary-card--documents"
              >
                <div className="dashboard-card-heading">
                  <span className="dashboard-card-icon dashboard-card-icon--purple">
                    📄
                  </span>

                  <div>
                    <p>
                      Facturen en bestanden
                    </p>

                    <h2>
                      Mijn documenten
                    </h2>
                  </div>
                </div>

                <p className="dashboard-muted">
                  Hier verschijnen je
                  facturen, downloads en
                  andere documenten.
                </p>

                <span className="dashboard-coming-soon">
                  Binnenkort beschikbaar
                </span>
              </article>

              <article
                id="webshop"
                className="dashboard-summary-card dashboard-summary-card--shop"
              >
                <div className="dashboard-card-heading">
                  <span className="dashboard-card-icon dashboard-card-icon--teal">
                    🛒
                  </span>

                  <div>
                    <p>
                      Begeleiding en aanbod
                    </p>

                    <h2>Webshop</h2>
                  </div>
                </div>

                <p className="dashboard-muted">
                  Bekijk beurtenkaarten,
                  workshops en educatieve
                  materialen.
                </p>

                <Link
                  href="/webshop"
                  className="dashboard-card-link"
                >
                  Naar de webshop
                  <span>→</span>
                </Link>
              </article>
            </section>
          </div>
        </section>
      </main>
    </PageShell>
  );
}