import PageShell from "@/components/PageShell";
import BookingForm from "@/components/BookingForm";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Boeken</p>
        <h1>Plan je afspraak</h1>
        <p>Kies je aanbod en laat je gegevens achter. Ik neem zo snel mogelijk contact met je op.</p>
      </section>

      <BookingForm />
    </PageShell>
  );
}