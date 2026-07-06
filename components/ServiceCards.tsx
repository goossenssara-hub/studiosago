import Image from "next/image";
import Link from "next/link";
import { fallbackServices } from "@/lib/services";

export default function ServiceCards() {
  return (
    <section className="services-section" id="aanbod">
      <div className="section-heading">
        <p className="eyebrow">Aanbod</p>
        <h2>Een warme plek voor elke leerfase.</h2>
      </div>

      <div className="services-grid">
        {fallbackServices.map((service) => (
          <Link
            key={`${service.name}-${service.category}`}
            href={service.href}
            className={`service-card ${service.color}`}
          >
            <div className="service-main">
              <div className="service-icon" aria-hidden="true">
                <Image src={service.icon} alt="" width={92} height={92} />
              </div>

              <div className="service-content">
                <h2>
                  {service.name}
                  {service.category && <span>{service.category}</span>}
                </h2>

                <p>{service.description}</p>
              </div>
            </div>

            <div className="service-arrow" aria-hidden="true">
              →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
