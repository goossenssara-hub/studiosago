import PageShell from "@/components/PageShell";
import BookingForm from "@/components/BookingForm";

export default function BoekNuPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Boek nu</p>
        <h1>Kies je aanbod en vraag je moment aan.</h1>
        <p>De aanvraag wordt opgeslagen in Supabase. Daarna kun jij ze bevestigen in je adminomgeving.</p>
      </section>
      <BookingForm />
    </PageShell>
  );
}
