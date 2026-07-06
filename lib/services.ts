export type StudioService = {
  id?: string;
  name: string;
  category: string;
  description: string;
  duration?: number | null;
  price?: number | null;
  max_participants?: number | null;
  icon: string;
  color: "red" | "orange" | "yellow" | "green" | "teal" | "purple";
  href: string;
  comingSoon?: boolean;
};

export const fallbackServices: StudioService[] = [
  {
    name: "Educatief aanbod",
    category: " voor kleuters",
    description: "Spelend leren en ontdekken met plezier en verwondering.",
    icon: "/assets/kamp.png",
    color: "red",
    href: "/aanbod/kleuters",
  },

  {
    name: "Educatief aanbod",
    category: " voor de basisschool",
    description: "Ondersteuning en verdieping op maat van elk kind.",
    icon: "/assets/lager.png",
    color: "orange",
    href: "/aanbod/basisschool",
  },

  {
    name: "Educatief aanbod",
    category: " voor het middelbaar",
    description:
      "Begeleiding en tools voor meer inzicht, zelfvertrouwen en succes.",
    icon: "/assets/secundair.png",
    color: "yellow",
    href: "/aanbod/middelbaar",
  },

  {
    name: "Educatief aanbod",
    category: " voor het hoger onderwijs",
    description:
      "Studiebegeleiding en ondersteuning voor meer focus en efficiëntie.",
    icon: "/assets/hoger.png",
    color: "green",
    href: "/onder-constructie",
    comingSoon: true,
  },

  {
    name: "Zorgaanbod",
    category: "",
    description:
      "Ondersteuning op maat voor kinderen, jongeren en gezinnen.",
    icon: "/assets/zorg3.png",
    color: "teal",
    href: "/onder-constructie",
    comingSoon: true,
  },

  {
    name: "SaGo",
    category: "Photography",
    description:
      "Puur, warm en spontaan. Fotografie die echte herinneringen bewaart.",
    icon: "/assets/foto2.png",
    color: "purple",
    href: "https://www.sagophotography.be/",
  },
];