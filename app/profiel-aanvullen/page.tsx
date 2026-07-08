export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import { createClient } from "@/lib/supabase/server";
import CustomerProfileForm from "@/components/CustomerProfileForm";

export default async function ProfielAanvullenPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  return (
    <PageShell>
      <main className="profile-complete-page">
        <section className="subpage-hero">
          <p className="eyebrow">Klantprofiel</p>
          <h1>Vul je profiel aan</h1>
          <p>
            Vul eerst je profiel volledig aan voor je toegang krijgt tot je
            klantendashboard.
          </p>
        </section>

        <section className="info-grid single">
          <div className="info-card">
            <CustomerProfileForm
              initialEmail={user.email}
              redirectAfterSave="/dashboard"
            />
          </div>
        </section>
      </main>
    </PageShell>
  );
}