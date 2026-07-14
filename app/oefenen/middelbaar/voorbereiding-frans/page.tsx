import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import VoorbereidingFransClient from "@/components/oefenen/middelbaar/VoorbereidingFransClient";

export const metadata: Metadata = {
  title: "Voorbereiding Frans voor het middelbaar | Studio SaGo",
  description:
    "Franse oefeningen voor leerlingen uit het vijfde en zesde leerjaar als voorbereiding op het eerste middelbaar.",
};

export default function VoorbereidingFransPage() {
  return (
    <PageShell>
      <VoorbereidingFransClient />
    </PageShell>
  );
}
