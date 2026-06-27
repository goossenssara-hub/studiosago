export type StudioService = {
  id?: string;
  name: string;
  category: string;
  description: string;
  duration?: number | null;
  price?: number | null;
  max_participants?: number | null;
  icon: string;
  color: "orange" | "green" | "purple" | "teal";
  href: string;
};

export const fallbackServices: StudioService[] = [
  {
    name: "Educatief aanbod",
    category: "voor kleuters",
    description: "Spelend leren en ontdekken met plezier en verwondering.",
    icon: "/assets/icon-bear.svg",
    color: "orange",
    href: "/aanbod/kleuters",
  },
  {
    name: "Educatief aanbod",
    category: "voor de basisschool",
    description: "Ondersteuning en verdieping op maat van elk kind.",
    icon: "/assets/icon-backpack.svg",
    color: "green",
    href: "/aanbod/basisschool",
  },
  {
    name: "Educatief aanbod",
    category: "voor het middelbaar",
    description: "Begeleiding en tools voor meer inzicht, zelfvertrouwen en succes.",
    icon: "/assets/icon-book.svg",
    color: "purple",
    href: "/aanbod/middelbaar",
  },
  {
    name: "Educatief aanbod",
    category: "voor het hoger onderwijs",
    description: "Studiebegeleiding en ondersteuning voor meer focus en efficiëntie.",
    icon: "/assets/icon-graduation.svg",
    color: "teal",
    href: "/aanbod/hoger-onderwijs",
  },
  {
    name: "Zorgaanbod",
    category: "",
    description: "Ondersteuning op maat voor kinderen, jongeren en gezinnen.",
    icon: "/assets/zorg.png",
    color: "orange",
    href: "/zorgaanbod",
  },
];
