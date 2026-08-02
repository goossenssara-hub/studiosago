import PageShell from "@/components/PageShell";
import OefenpaginaLagerClient from "@/components/oefenen/OefenpaginaLagerClient";

export default function ZesdeLeerjaarPage() {
  return (
    <PageShell>
      <OefenpaginaLagerClient grade={6} />
    </PageShell>
  );
}
