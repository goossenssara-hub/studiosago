import PageShell from "@/components/PageShell";
import LeerlingLoginClient from "@/components/LeerlingLoginClient";

export default function LeerlingLoginPage() {
  return (
    <PageShell>
      <main className="leerling-login-page">
        <LeerlingLoginClient />
      </main>
    </PageShell>
  );
}