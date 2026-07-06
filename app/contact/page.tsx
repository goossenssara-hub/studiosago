import PageShell from "@/components/PageShell";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Contact</p>
        <h1>Heb je een vraag?</h1>
        <p>
          Laat je gegevens achter en ik neem zo snel mogelijk contact met je op.
        </p>
      </section>

      <ContactForm />
    </PageShell>
  );
}