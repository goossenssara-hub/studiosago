export type ProductType = "general" | "pass" | "workshop" | "text" | "parent_support" | "appointment";
export type EducationLevel = "primary" | "secondary" | null;

export type DynamicService = {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  description: string | null;
  price: number;
  button_text: string | null;
  href: string | null;
  slug: string;
  event_dates: string | null;
  image_url: string | null;
  is_visible: boolean;
  sort_order: number | null;
  product_type: ProductType;
  education_level: EducationLevel;
  requires_student_data: boolean;
  allows_group: boolean;
  min_participants: number;
  max_participants: number;
  price_per_participant: number | null;
  allows_digital: boolean;
  allows_home: boolean;
  external_url: string | null;
};

export function slugify(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

export function normalizeService(row: Record<string, unknown>): DynamicService {
  const title = String(row.title ?? row.name ?? "Dienst").trim();
  const slug = String(row.slug ?? "").trim() || slugify(title);
  return {
    id: String(row.id), title,
    subtitle: row.subtitle ? String(row.subtitle) : null,
    category: row.category ? String(row.category) : null,
    description: row.description ? String(row.description) : null,
    price: Number(row.price ?? 0), button_text: row.button_text ? String(row.button_text) : "Bekijk",
    href: row.external_url ? String(row.external_url) : `/webshop/${slug}`, slug,
    event_dates: row.event_dates ? String(row.event_dates) : null,
    image_url: row.image_url ? String(row.image_url) : null,
    is_visible: row.is_visible !== false && row.active !== false,
    sort_order: Number(row.sort_order ?? 0),
    product_type: (String(row.product_type ?? "general") as ProductType),
    education_level: row.education_level === "primary" || row.education_level === "secondary" ? row.education_level : null,
    requires_student_data: row.requires_student_data !== false,
    allows_group: row.allows_group === true,
    min_participants: Math.max(1, Number(row.min_participants ?? 1)),
    max_participants: Math.max(1, Number(row.max_participants ?? 1)),
    price_per_participant: row.price_per_participant == null ? null : Number(row.price_per_participant),
    allows_digital: row.allows_digital !== false,
    allows_home: row.allows_home === true,
    external_url: row.external_url ? String(row.external_url) : null,
  };
}

const builtInServices: Record<string, Omit<DynamicService, "id">> = {
  "teksten-nalezen-auteurs": {
    title: "Teksten nalezen voor auteurs",
    subtitle: "Redactie en taalcorrectie voor manuscripten",
    category: "Correctie van teksten",
    description: "Voor auteurs en manuscripten. Instagramkorting is geldig vanaf 10.000 woorden.",
    price: 20,
    button_text: "Upload je manuscript",
    href: "/webshop/teksten-nalezen-auteurs",
    slug: "teksten-nalezen-auteurs",
    event_dates: null, image_url: null, is_visible: true, sort_order: 11,
    product_type: "text", education_level: null, requires_student_data: false,
    allows_group: false, min_participants: 1, max_participants: 1,
    price_per_participant: null, allows_digital: true, allows_home: false, external_url: null,
  },

  "tekstcorrectie": {
    title: "Tekstcorrectie",
    subtitle: "Spelling, grammatica en formulering",
    category: "Correctie van teksten",
    description: "€20 tot en met 2000 woorden. Daarna €8 per begonnen 1000 extra woorden.",
    price: 20,
    button_text: "Laat je tekst nakijken",
    href: "/webshop/tekstcorrectie",
    slug: "tekstcorrectie",
    event_dates: null, image_url: null, is_visible: true, sort_order: 10,
    product_type: "text", education_level: null, requires_student_data: false,
    allows_group: false, min_participants: 1, max_participants: 1,
    price_per_participant: null, allows_digital: true, allows_home: false, external_url: null,
  },

  "individuele-begeleiding-lager": {
    title: "Individuele begeleiding Lager onderwijs",
    subtitle: "Persoonlijke begeleiding",
    category: "Lager onderwijs",
    description: "Individuele begeleiding van één uur, digitaal of aan huis binnen 15 km rond Peer.",
    price: 35,
    button_text: "Boek begeleiding",
    href: "/webshop/individuele-begeleiding-lager",
    slug: "individuele-begeleiding-lager",
    event_dates: null,
    image_url: null,
    is_visible: true,
    sort_order: 10,
    product_type: "appointment",
    education_level: "primary",
    requires_student_data: true,
    allows_group: false,
    min_participants: 1,
    max_participants: 1,
    price_per_participant: 35,
    allows_digital: true,
    allows_home: true,
    external_url: null,
  },
  "individuele-begeleiding-secundair": {
    title: "Individuele begeleiding Secundair onderwijs",
    subtitle: "Persoonlijke studiebegeleiding",
    category: "Secundair onderwijs",
    description: "Individuele begeleiding van één uur, digitaal of aan huis binnen 15 km rond Peer.",
    price: 40,
    button_text: "Boek begeleiding",
    href: "/webshop/individuele-begeleiding-secundair",
    slug: "individuele-begeleiding-secundair",
    event_dates: null,
    image_url: null,
    is_visible: true,
    sort_order: 10,
    product_type: "appointment",
    education_level: "secondary",
    requires_student_data: true,
    allows_group: false,
    min_participants: 1,
    max_participants: 1,
    price_per_participant: 40,
    allows_digital: true,
    allows_home: true,
    external_url: null,
  },
  "groepsbegeleiding-lager": {
    title: "Groepsbegeleiding Lager onderwijs",
    subtitle: "Voor 2 tot 5 leerlingen",
    category: "Lager onderwijs",
    description: "Begeleiding in een kleine groep, digitaal of aan huis binnen 15 km rond Peer.",
    price: 22,
    button_text: "Boek groepsbegeleiding",
    href: "/webshop/groepsbegeleiding-lager",
    slug: "groepsbegeleiding-lager",
    event_dates: null,
    image_url: null,
    is_visible: true,
    sort_order: 20,
    product_type: "appointment",
    education_level: "primary",
    requires_student_data: true,
    allows_group: true,
    min_participants: 2,
    max_participants: 5,
    price_per_participant: 22,
    allows_digital: true,
    allows_home: true,
    external_url: null,
  },
  "groepsbegeleiding-secundair": {
    title: "Groepsbegeleiding Secundair onderwijs",
    subtitle: "Voor 2 tot 5 leerlingen",
    category: "Secundair onderwijs",
    description: "Begeleiding in een kleine groep, digitaal of aan huis binnen 15 km rond Peer.",
    price: 30,
    button_text: "Boek groepsbegeleiding",
    href: "/webshop/groepsbegeleiding-secundair",
    slug: "groepsbegeleiding-secundair",
    event_dates: null,
    image_url: null,
    is_visible: true,
    sort_order: 20,
    product_type: "appointment",
    education_level: "secondary",
    requires_student_data: true,
    allows_group: true,
    min_participants: 2,
    max_participants: 5,
    price_per_participant: 30,
    allows_digital: true,
    allows_home: true,
    external_url: null,
  },
};

export function getBuiltInService(slug: string): DynamicService | null {
  const service = builtInServices[slug];
  return service ? { id: `builtin:${slug}`, ...service } : null;
}
