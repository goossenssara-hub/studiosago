"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminRequests from "@/components/admin/AdminRequests";
import AdminPlaceholder from "@/components/admin/AdminPlaceholder";
import AdminLessonCards from "@/components/AdminLessonCards";
import AdminAgenda from "@/components/admin/AdminAgenda";
import AdminWorkshops from "@/components/admin/AdminWorkshops";
import AdminManualAdd from "@/components/admin/AdminManualAdd";
import AdminAvailability from "@/components/admin/AdminAvailability";

export default function AdminPage() {
  const [tab, setTab] = useState("dashboard");

  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Admin</p>
        <h1>Studio SaGo Beheer</h1>
        <p>Beheer aanvragen, leerlingen, lessen, betalingen en beurtenkaarten.</p>
      </section>

      <section className="admin-layout">
        <aside className="admin-sidebar">
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>📊 Dashboard</button>
          <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>📥 Nieuwe aanvragen</button>
          <button className={tab === "agenda" ? "active" : ""} onClick={() => setTab("agenda")}>📅 Agenda</button>
          <button className={tab === "students" ? "active" : ""} onClick={() => setTab("students")}>👨‍🎓 Leerlingen</button>
          <button className={tab === "parents" ? "active" : ""} onClick={() => setTab("parents")}>👨‍👩‍👧 Ouders</button>
          <button className={tab === "cards" ? "active" : ""} onClick={() => setTab("cards")}>🎟️ Beurtenkaarten</button>
          <button className={tab === "invoices" ? "active" : ""} onClick={() => setTab("invoices")}>📄 Facturen</button>
          <button className={tab === "payments" ? "active" : ""} onClick={() => setTab("payments")}>💶 Betalingen</button>
          <button className={tab === "workshops" ? "active" : ""} onClick={() => setTab("workshops")}>🏕️ Workshops</button>
        <button
  className={tab === "availability" ? "active" : ""}
  onClick={() => setTab("availability")}
>
  🕒 Beschikbaarheden
</button>
        </aside>

        <main className="admin-content">
          {tab === "dashboard" && <AdminDashboard />}
          {tab === "requests" && <AdminRequests />}
          {tab === "agenda" && <AdminAgenda />}
          {tab === "availability" && <AdminAvailability />}
          {tab === "students" && (
            <AdminPlaceholder title="Leerlingen" text="Hier komt je leerlingenbestand." />
          )}
          {tab === "parents" && (
            <AdminPlaceholder title="Ouders" text="Hier beheer je oudergegevens." />
          )}
          {tab === "cards" && <AdminLessonCards />}
          {tab === "invoices" && (
            <AdminPlaceholder title="Facturen" text="Hier komen facturen en documenten." />
          )}
          {tab === "payments" && (
            <AdminPlaceholder title="Betalingen" text="Hier volg je betalingen op." />
          )}
          {tab === "workshops" && <AdminWorkshops />}
        </main>
      </section>
    </PageShell>
  );
}