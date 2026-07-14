"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminRequests from "@/components/admin/AdminRequests";
import AdminLessonCards from "@/components/AdminLessonCards";
import AdminAgenda from "@/components/admin/AdminAgenda";
import AdminParents from "@/components/admin/AdminParents";
import AdminStudents from "@/components/admin/AdminStudents";
import DiscountCodesAdmin from "@/components/DiscountCodesAdmin";
import AdminPlaceholder from "@/components/admin/AdminPlaceholder";
import LogoutButton from "@/components/admin/LogoutButton";

type AdminTab = "dashboard" | "requests" | "agenda" | "students" | "parents" | "cards" | "payments" | "discounts";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "requests", label: "Aanvragen", icon: "📥" },
  { id: "agenda", label: "Agenda", icon: "📅" },
  { id: "students", label: "Leerlingen", icon: "🎓" },
  { id: "parents", label: "Ouders", icon: "👨‍👩‍👧" },
  { id: "cards", label: "Beurtenkaarten", icon: "🎟️" },
  { id: "payments", label: "Betalingen", icon: "💶" },
  { id: "discounts", label: "Kortingscodes", icon: "🏷️" },
] as const;

export default function AdminClient() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  return <PageShell>
    <section className="admin-hero"><div className="admin-hero__content"><p className="admin-hero__eyebrow">Adminomgeving</p><h1>Studio SaGo Beheer</h1><p className="admin-hero__description">Beheer aanvragen, lessen, klanten, betalingen en beurtenkaarten vanuit één overzichtelijke omgeving.</p></div><div className="admin-hero__actions"><LogoutButton /></div></section>
    <section className="admin-shell"><aside className="admin-sidebar-clean"><div className="admin-sidebar-header"><span>Menu</span></div><nav className="admin-sidebar-nav" aria-label="Adminmenu">{tabs.map(item=><button key={item.id} type="button" className={tab===item.id?"active":""} onClick={()=>setTab(item.id)}><span className="admin-menu-icon">{item.icon}</span><span>{item.label}</span></button>)}</nav></aside>
      <main className="admin-content-clean">
        {tab==="dashboard" && <AdminDashboard setTab={next=>setTab(next as AdminTab)} />}
        {tab==="requests" && <AdminRequests />}{tab==="agenda" && <AdminAgenda />}{tab==="students" && <AdminStudents />}{tab==="parents" && <AdminParents />}{tab==="cards" && <AdminLessonCards />}
        {tab==="payments" && <AdminPlaceholder title="Betalingen" text="Hier volg je Mollie-betalingen en terugbetalingen op." />}
        {tab==="discounts" && <DiscountCodesAdmin />}
      </main></section>
  </PageShell>;
}
