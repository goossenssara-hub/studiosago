import PageShell from "@/components/PageShell";
import ServiceCards from "@/components/ServiceCards";

export default function AanbodPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Aanbod</p>
        <h1>Educatief aanbod voor elke leerfase.</h1>
        <p>Kleuters, basisschool, middelbaar, hoger onderwijs en zorgaanbod op maat.</p>
      </section>
      <ServiceCards />
    </PageShell>
  );
}
