import PageShell from "@/components/PageShell";
import OefenpaginaLagerClient from "@/components/oefenen/OefenpaginaLagerClient";

export default function VierdeLeerjaarPage() {
  return (
    <PageShell>
      <OefenpaginaLagerClient grade={4} />
    </PageShell>
  );
}
