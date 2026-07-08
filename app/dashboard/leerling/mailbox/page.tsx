import PageShell from "@/components/PageShell";
import LeerlingMailboxClient from "@/components/leerling/LeerlingMailboxClient";

export default function LeerlingMailboxPage() {
  return (
    <PageShell>
      <LeerlingMailboxClient />
    </PageShell>
  );
}