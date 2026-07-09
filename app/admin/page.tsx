"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminRequests from "@/components/admin/AdminRequests";
import AdminPlaceholder from "@/components/admin/AdminPlaceholder";
import AdminLessonCards from "@/components/AdminLessonCards";
import AdminAgenda from "@/components/admin/AdminAgenda";
import AdminWorkshops from "@/components/admin/AdminWorkshops";
import AdminAvailability from "@/components/admin/AdminAvailability";
import AdminParents from "@/components/admin/AdminParents";
import AdminStudents from "@/components/admin/AdminStudents";
import LogoutButton from "@/components/admin/LogoutButton";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "requests", label: "Aanvragen", icon: "📥" },
  { id: "agenda", label: "Agenda", icon: "📅" },
  { id: "availability", label: "Beschikbaarheden", icon: "🕒" },
  { id: "students", label: "Leerlingen", icon: "🎓" },
  { id: "parents", label: "Ouders", icon: "👨‍👩‍👧" },
  { id: "cards", label: "Beurtenkaarten", icon: "🎟️" },
  { id: "invoices", label: "Facturen", icon: "📄" },
  { id: "payments", label: "Betalingen", icon: "💶" },
  { id: "workshops", label: "Workshops", icon: "🏕️" },
];

export default function AdminClient() {
  const [tab, setTab] = useState("dashboard");

  return (
    <PageShell>
      <section className="admin-hero-clean">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Studio SaGo Beheer</h1>
          <p>Een duidelijk overzicht van aanvragen, lessen, betalingen en beurtenkaarten.</p>
        </div>
        <LogoutButton />
      </section>

      <section className="admin-shell">
        <aside className="admin-sidebar-clean">
          <div className="admin-sidebar-title">Menu</div>

          {tabs.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              onClick={() => setTab(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </aside>

        <main className="admin-content-clean">
          {tab === "dashboard" && <AdminDashboard setTab={setTab} />}
          {tab === "requests" && <AdminRequests />}
          {tab === "agenda" && <AdminAgenda />}
          {tab === "availability" && <AdminAvailability />}
          {tab === "students" && <AdminStudents />}
          {tab === "parents" && <AdminParents />}
          {tab === "cards" && <AdminLessonCards />}
          {tab === "invoices" && <AdminPlaceholder title="Facturen" text="Hier komen facturen en documenten." />}
          {tab === "payments" && <AdminPlaceholder title="Betalingen" text="Hier volg je betalingen op." />}
          {tab === "workshops" && <AdminWorkshops />}
        </main>
      </section>
    </PageShell>
  );
}