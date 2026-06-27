import PageShell from "@/components/PageShell";
import AdminBookings from "@/components/AdminBookings";

export default function AdminPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Admin</p>
        <h1>Beheer Studio SaGo.</h1>
        <p>Bekijk aanvragen, klanten en boekingen uit Supabase.</p>
      </section>
      <AdminBookings />
    </PageShell>
  );
}
