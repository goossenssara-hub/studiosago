"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fallbackServices, StudioService } from "@/lib/services";
import { ArrowRight } from "lucide-react";

function mapSupabaseService(item: any, index: number): StudioService {
  const fallback = fallbackServices[index % fallbackServices.length];

  return {
    id: item.id,
    name: item.name || fallback.name,
    category: item.category || "",
    description: item.description || fallback.description,
    duration: item.duration,
    price: item.price,
    max_participants: item.max_participants,
    icon: fallback.icon,
    color: fallback.color,
    href: `/boek-nu?service=${item.id}`,
  };
}

export default function ServiceCards() {
  const [services, setServices] = useState<StudioService[]>(fallbackServices);

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id,name,category,description,duration,price,max_participants,active")
        .eq("active", true)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setServices(data.map(mapSupabaseService));
      }
    }

    loadServices();
  }, []);

  return (
    <section className="services-section" id="aanbod" aria-label="Educatief aanbod">
      <div className="section-heading">
        <p className="eyebrow">Aanbod</p>
        <h2>Een warme plek voor elke leerfase.</h2>
      </div>

      <div className="services-grid">
        {services.slice(0, 6).map((service) => (
          <article
            className={`service-card ${service.color}`}
            key={service.id ?? `${service.name}-${service.category}`}
          >
            <div className="service-icon" aria-hidden="true">
              <Image src={service.icon} alt="" width={110} height={110} />
            </div>

            <div className="service-content">
              <h3 className="service-title">
                {service.name}

                {service.category && (
                  <>
                    <br />
                    <span className={`service-category ${service.color}`}>
                      {service.category}
                    </span>
                  </>
                )}
              </h3>

              <p>{service.description}</p>
            </div>

            {service.href.startsWith("http") ? (
              <a
                className="service-arrow"
                href={service.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${service.name} ${service.category} bekijken`}
              >
                <ArrowRight size={32} strokeWidth={3} />
              </a>
            ) : (
              <Link
                className="service-arrow"
                href={service.href}
                aria-label={`${service.name} ${service.category} bekijken`}
              >
                <ArrowRight size={32} strokeWidth={3} />
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}