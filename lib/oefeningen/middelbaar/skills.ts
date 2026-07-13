export type SkillConfig = {
  slug: string;
  subject: "Wiskunde" | "Nederlands" | "Leren leren";
  title: string;
  description: string;
  icon: string;
  focus: string[];
};

export const firstSecondarySkills: SkillConfig[] = [
  {
    slug: "wiskunde-vraagstukken",
    subject: "Wiskunde",
    title: "Vraagstukken begrijpen",
    description:
      "Leer de vraag ontleden, belangrijke gegevens aanduiden en de juiste bewerking kiezen.",
    icon: "🧠",
    focus: [
      "Wat weet ik?",
      "Wat zoek ik?",
      "Welke informatie is belangrijk?",
      "Welke bewerking past?",
    ],
  },
  {
    slug: "wiskunde-hoofdrekenen",
    subject: "Wiskunde",
    title: "Hoofdrekenen",
    description:
      "Oefen optellen, aftrekken, vermenigvuldigen en delen zonder rekenmachine.",
    icon: "➗",
    focus: ["Rekenvolgorde", "Schatten", "Handige rekenstrategieën"],
  },
  {
    slug: "wiskunde-breuken-kommagetallen",
    subject: "Wiskunde",
    title: "Breuken en kommagetallen",
    description:
      "Vergelijk, vereenvoudig en reken met breuken en kommagetallen.",
    icon: "½",
    focus: ["Vergelijken", "Omzetten", "Bewerkingen"],
  },
  {
    slug: "wiskunde-procenten-verhoudingen",
    subject: "Wiskunde",
    title: "Procenten en verhoudingen",
    description:
      "Werk met kortingen, verhoudingen, schaal en eenvoudige procentberekeningen.",
    icon: "%",
    focus: ["Procenten", "Verhoudingstabellen", "Schaal"],
  },
  {
    slug: "wiskunde-meetkunde",
    subject: "Wiskunde",
    title: "Meetkunde",
    description:
      "Oefen omtrek, oppervlakte, hoeken en ruimtelijk inzicht.",
    icon: "📐",
    focus: ["Omtrek", "Oppervlakte", "Hoeken"],
  },
  {
    slug: "wiskunde-tabellen-grafieken",
    subject: "Wiskunde",
    title: "Tabellen en grafieken",
    description:
      "Lees gegevens correct af en trek besluiten uit tabellen en grafieken.",
    icon: "📊",
    focus: ["Aflezen", "Vergelijken", "Besluiten"],
  },
  {
    slug: "nederlands-opdrachten",
    subject: "Nederlands",
    title: "Opdrachten begrijpen",
    description:
      "Herken instructiewoorden en formuleer in eigen woorden wat je moet doen.",
    icon: "🔎",
    focus: ["Instructiewoorden", "Sleutelwoorden", "Vraag herformuleren"],
  },
  {
    slug: "nederlands-begrijpend-lezen",
    subject: "Nederlands",
    title: "Begrijpend lezen",
    description:
      "Zoek hoofdgedachten, verwijswoorden, tekstverbanden en bewijzen in een tekst.",
    icon: "📖",
    focus: ["Hoofdgedachte", "Tekstverband", "Bewijszin"],
  },
  {
    slug: "nederlands-woordenschat",
    subject: "Nederlands",
    title: "Woordenschat en schooltaal",
    description:
      "Oefen woorden die vaak voorkomen in toetsen, opdrachten en schoolboeken.",
    icon: "💬",
    focus: ["Schooltaal", "Synoniemen", "Betekenis uit context"],
  },
  {
    slug: "nederlands-spelling",
    subject: "Nederlands",
    title: "Spelling",
    description:
      "Herhaal werkwoordspelling, leestekens en vaak voorkomende spellingregels.",
    icon: "✍️",
    focus: ["Werkwoorden", "Leestekens", "Moeilijke woorden"],
  },
  {
    slug: "nederlands-taalbeschouwing",
    subject: "Nederlands",
    title: "Taalbeschouwing",
    description:
      "Oefen persoonsvorm, onderwerp, woordsoorten en zinsdelen.",
    icon: "🧩",
    focus: ["Persoonsvorm", "Onderwerp", "Woordsoorten"],
  },
  {
    slug: "nederlands-samenvatten",
    subject: "Nederlands",
    title: "Samenvatten en structureren",
    description:
      "Haal kernwoorden uit een tekst en bouw een duidelijke samenvatting op.",
    icon: "📝",
    focus: ["Kernwoorden", "Hoofd- en bijzaken", "Schema"],
  },
  {
    slug: "leren-leren-plannen",
    subject: "Leren leren",
    title: "Plannen en studeren",
    description:
      "Leer taken opdelen, prioriteiten bepalen en je werk controleren.",
    icon: "🗓️",
    focus: ["Plannen", "Prioriteiten", "Zelfcontrole"],
  },
];

export function getSkillConfig(slug: string) {
  return firstSecondarySkills.find((skill) => skill.slug === slug);
}
