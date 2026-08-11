"use client";

import { useState } from "react";
import Link from "next/link";
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
import AdminNewsletterLeads from "@/components/admin/AdminNewsletterLeads";
import AdminLearningPlatform from "@/components/admin/AdminLearningPlatform";

type AdminTab = "dashboard" | "requests" | "agenda" | "students" | "parents" | "cards" | "payments" | "discounts" | "learning-platform" | "newsletter";
type AdminLanguage = "nl" | "en";

const nlTabs = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "requests", label: "Aanvragen", icon: "📥" },
  { id: "agenda", label: "Agenda", icon: "📅" },
  { id: "students", label: "Leerlingen", icon: "🎓" },
  { id: "parents", label: "Ouders", icon: "👨‍👩‍👧" },
  { id: "cards", label: "Beurtenkaarten", icon: "🎟️" },
  { id: "payments", label: "Betalingen", icon: "💶" },
  { id: "discounts", label: "Kortingscodes", icon: "🏷️" },
  { id: "learning-platform", label: "Leerplatform", icon: "📚" },
  { id: "newsletter", label: "Nieuwsbrief", icon: "📧" },
] as const;

const enTabs = [
  { id: "dashboard", label: "Overview", icon: "📊" },
  { id: "newsletter", label: "Newsletter", icon: "📧" },
] as const;

export default function AdminClient() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [language, setLanguage] = useState<AdminLanguage>("nl");
  const isEnglish = language === "en";
  const tabs = isEnglish ? enTabs : nlTabs;

  function switchLanguage(next: AdminLanguage) {
    setLanguage(next);
    setTab("dashboard");
  }

  const directLinks = isEnglish
    ? [
        { href: "/webshop-EN", label: "View English shop", icon: "🛒" },
        { href: "/webshop", label: "View Dutch shop", icon: "🇳🇱" },
      ]
    : [
        { href: "/admin/diensten", label: "Diensten beheren", icon: "🛍️" },
        { href: "/admin/aanvragen/tekstcorrectie", label: "Tekstcorrecties", icon: "📝" },
        { href: "/webshop", label: "Webshop bekijken", icon: "🛒" },
        { href: "/webshop-EN", label: "Engelse webshop bekijken", icon: "🇬🇧" },
        { href: "/dashboard/oefenen", label: "Oefenplatform", icon: "🏔️" },
        { href: "/admin/mailbox", label: "Interne mailbox", icon: "✉️" },
      ];

  return <PageShell>
    <section className="admin-hero">
      <div className="admin-hero__content">
        <p className="admin-hero__eyebrow">{isEnglish ? "English workspace" : "Adminomgeving"}</p>
        <h1>Studio SaGo Beheer</h1>
        <p className="admin-hero__description">{isEnglish ? "English shop contacts and newsletter permissions are kept separate from the Dutch environment." : "Beheer aanvragen, diensten, leerlingen, betalingen en communicatie vanuit één omgeving."}</p>
        <div style={{ display: "inline-flex", gap: 8, padding: 6, marginTop: 14, borderRadius: 999, background: "rgba(255,255,255,.78)", boxShadow: "0 8px 24px rgba(3,54,99,.10)" }} aria-label="Taalweergave admin">
          <button type="button" onClick={() => switchLanguage("nl")} aria-pressed={language === "nl"} style={{ border: 0, borderRadius: 999, padding: "9px 15px", fontWeight: 850, cursor: "pointer", background: language === "nl" ? "#033663" : "transparent", color: language === "nl" ? "white" : "#033663" }}>🇳🇱 Nederlands</button>
          <button type="button" onClick={() => switchLanguage("en")} aria-pressed={language === "en"} style={{ border: 0, borderRadius: 999, padding: "9px 15px", fontWeight: 850, cursor: "pointer", background: language === "en" ? "#033663" : "transparent", color: language === "en" ? "white" : "#033663" }}>🇬🇧 English</button>
        </div>
      </div>
      <div className="admin-hero__actions"><LogoutButton /></div>
    </section>

    <section className="admin-shell">
      <aside className="admin-sidebar-clean">
        <div className="admin-sidebar-header"><span>{isEnglish ? "Menu" : "Menu"}</span></div>
        <nav className="admin-sidebar-nav" aria-label="Adminmenu">
          {tabs.map(item => <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id as AdminTab)}><span className="admin-menu-icon">{item.icon}</span><span>{item.label}</span></button>)}
          <div className="admin-sidebar-header" style={{ marginTop: 18 }}><span>{isEnglish ? "Quick links" : "Snelle links"}</span></div>
          {directLinks.map(item => <Link key={item.href} href={item.href} className="admin-direct-link"><span className="admin-menu-icon">{item.icon}</span><span>{item.label}</span></Link>)}
        </nav>
      </aside>

      <main className="admin-content-clean">
        {isEnglish ? (
          <>
            {tab === "dashboard" && <section style={{ display: "grid", gap: 18 }}>
              <div style={{ padding: 28, borderRadius: 28, background: "rgba(255,255,255,.9)", boxShadow: "0 18px 44px rgba(3,54,99,.10)" }}>
                <p style={{ margin: 0, color: "#28b9aa", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", fontSize: 12 }}>English environment</p>
                <h2 style={{ margin: "8px 0 10px", color: "#033663" }}>Digital products & newsletter</h2>
                <p style={{ margin: 0, color: "#42617d", lineHeight: 1.6 }}>This workspace only shows English-facing Studio SaGo data. The current English shop contains the Discovery Board and Memory Game. Dutch contacts and Dutch newsletter consent are not included here.</p>
              </div>
              <AdminNewsletterLeads language="en" />
            </section>}
            {tab === "newsletter" && <AdminNewsletterLeads language="en" />}
          </>
        ) : (
          <>
            {tab === "dashboard" && <AdminDashboard setTab={next => setTab(next as AdminTab)} />}
            {tab === "requests" && <AdminRequests />}
            {tab === "agenda" && <AdminAgenda />}
            {tab === "students" && <AdminStudents />}
            {tab === "parents" && <AdminParents />}
            {tab === "cards" && <AdminLessonCards />}
            {tab === "payments" && <AdminPlaceholder title="Betalingen" text="Hier volg je Mollie-betalingen en terugbetalingen op." />}
            {tab === "discounts" && <DiscountCodesAdmin />}
            {tab === "learning-platform" && <AdminLearningPlatform />}
            {tab === "newsletter" && <AdminNewsletterLeads language="nl" />}
          </>
        )}
      </main>
    </section>
  </PageShell>;
}
