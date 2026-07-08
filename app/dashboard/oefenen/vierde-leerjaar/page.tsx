import PageShell from "@/components/PageShell";
import OefenpaginaClient from "@/components/oefenen/OefenpaginaClient";

export default function VierdeLeerjaarPage() {
  return (
    <PageShell>
      <OefenpaginaClient leerjaar="vierde" />
    </PageShell>
  );
}