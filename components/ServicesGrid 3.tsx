import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./ServicesGrid.module.css";

type Service = {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  description: string | null;
  price: number;
  button_text: string;
  href: string;
  event_dates: string | null;
  image_url: string | null;
  sort_order: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export default async function ServicesGrid() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("services")
    .select(
      "id,title,subtitle,category,description,price,button_text,href,event_dates,image_url,sort_order"
    )
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Diensten laden mislukt:", error.message);
    return (
      <div className={styles.empty}>
        De diensten konden momenteel niet geladen worden.
      </div>
    );
  }

  if (!services?.length) {
    return null;
  }

  return (
    <section className={styles.grid} aria-label="Diensten">
      {(services as Service[]).map((service) => (
        <article
          key={service.id}
          className={styles.card}
          style={
            service.image_url
              ? {
                  backgroundImage: `linear-gradient(rgba(255,255,255,.84), rgba(255,255,255,.94)), url("${service.image_url}")`,
                }
              : undefined
          }
        >
          <div className={styles.content}>
            <span className={styles.category}>{service.category}</span>
            <h2>{service.title}</h2>

            {service.subtitle && (
              <p className={styles.subtitle}>{service.subtitle}</p>
            )}

            {service.event_dates && (
              <p className={styles.dates}>{service.event_dates}</p>
            )}

            {service.description && (
              <p className={styles.description}>{service.description}</p>
            )}
          </div>

          <div className={styles.footer}>
            <strong>{formatPrice(Number(service.price))}</strong>
            <Link href={service.href}>{service.button_text || "Bekijk"}</Link>
          </div>
        </article>
      ))}
    </section>
  );
}
