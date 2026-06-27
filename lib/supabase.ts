import { createClient } from "@supabase/supabase-js";
import { StudioService } from "./services";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase is nog niet ingesteld. Vul .env.local aan.");
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-key"
);
export const fallbackServices: StudioService[] = [
  {
    name: "Educatief aanbod",
    category: "voor kleuters",
    description: "Spelend leren en ontdekken met plezier en verwondering.",
    icon: "/assets/kamp.png",
    color: "red",
    href: "/aanbod/kleuters",
  },
  {
    name: "Educatief aanbod",
    category: "voor de basisschool",
    description: "Ondersteuning en verdieping op maat van elk kind.",
    icon: "/assets/lager.png",
    color: "orange",
    href: "/aanbod/basisschool",
  },
  {
    name: "Educatief aanbod",
    category: "voor het middelbaar",
    description: "Begeleiding en tools voor meer inzicht, zelfvertrouwen en succes.",
    icon: "/assets/secundair.png",
    color: "yellow",
    href: "/aanbod/middelbaar",
  },
  {
    name: "Educatief aanbod",
    category: "voor het hoger onderwijs",
    description: "Studiebegeleiding en ondersteuning voor meer focus en efficiëntie.",
    icon: "/assets/hoger.png",
    color: "green",
    href: "/aanbod/hoger-onderwijs",
  },
  {
    name: "Zorgaanbod",
    category: "",
    description: "Ondersteuning op maat voor kinderen, jongeren en gezinnen.",
    icon: "/assets/zorg3.png",
    color: "teal",
    href: "/zorgaanbod",
  },

  {
    name: "SaGo",
    category: "Photography",
    description: "Puur, warm en spontaan. Fotografie die echte herinneringen bewaart.",
    icon: "/assets/foto2.png",
    color: "purple",
    href: "/fotografie",
  },
];
