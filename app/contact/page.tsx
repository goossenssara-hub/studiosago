import PageShell from "@/components/PageShell";
import BookingForm from "@/components/BookingForm";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Contact</p>
        <h1>Neem contact op met Studio SaGo.</h1>
        <p>
          Heb je een vraag over workshops, studiecoaching, kampen, VR of
          zorgaanbod? Stuur een bericht of dien meteen een aanvraag in.
        </p>
      </section>

      <section className="info-grid single">
        <div className="info-card wide">
          <h2>Mail mij</h2>
          <p>
            <a href="mailto:creativestudiosago@gmail.com">
              creativestudiosago@gmail.com
            </a>
          </p>
          <p>
            Vul hieronder het formulier in. Ik neem zo snel mogelijk contact met
            je op.
          </p>
        </div>
      </section>

      <BookingForm />
    </PageShell>
  );
}