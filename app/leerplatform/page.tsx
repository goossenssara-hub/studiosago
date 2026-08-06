import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import LeerplatformSignup from "./LeerplatformSignup";
import "./leerplatform.css";

export const metadata: Metadata = {
  title: "Word pionier van het Studio SaGo-leerplatform",
  description:
    "Meld je aan voor nieuws over het Studio SaGo-leerplatform en ontvang als pionier levenslang gratis toegang tot het platform en alle extra's.",
};

export default function LeerplatformPage() {
  return (
    <PageShell>
      <LeerplatformSignup />
    </PageShell>
  );
}
