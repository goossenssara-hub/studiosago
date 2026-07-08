import PageShell from "@/components/PageShell";
import OefenpaginaClient from "@/components/oefenen/OefenpaginaClient";

export default function ZesdeLeerjaarPage() {
  return (
    <PageShell>
      <OefenpaginaClient leerjaar="zesde" />
    </PageShell>
  );
}