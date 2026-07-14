import { mc, type ExerciseInput, type Random } from "./shared";

const focus = [
  ["persoonsvorm", "zullen"],
  ["onderwerp", "de prijzen"],
  ["woordsoort", "bijwoord"],
  ["lijdend voorwerp", "de resultaten"],
  ["naamwoordelijk gezegde", "is moeilijk"],
  ["betrekkelijke bijzin", "dat ik lees"],
  ["bijwoordelijke bepaling", "morgen"],
  ["meewerkend voorwerp", "de leerling"],
  ["onderschikkend voegwoord", "omdat"],
  ["zinsontleding", "hoofdzin en bijzin"],
] as const;

export function generateTaalbeschouwing(level: number, _random: Random): ExerciseInput[] {
  const category = `Taalbeschouwing · niveau ${level}`;
  const [topic, answer] = focus[level - 1];

  return [
    mc(category, `Niveaufocus: ${topic}. Welke optie past?`, [answer, "geen van deze", "alle woorden", "alleen leestekens"], answer),
    mc(category, "Persoonsvorm in: “Morgen zullen de leerlingen hun project voorstellen”?", ["zullen", "leerlingen", "voorstellen", "project"], "zullen"),
    mc(category, "Onderwerp in: “In de aula werden de prijzen uitgereikt”?", ["de prijzen", "in de aula", "werden", "uitgereikt"], "de prijzen"),
    mc(category, "Woordsoort van ‘zorgvuldig’ in ‘Zij werkt zorgvuldig’?", ["bijwoord", "bijvoeglijk naamwoord", "zelfstandig naamwoord", "voorzetsel"], "bijwoord"),
    mc(category, "Lijdend voorwerp in: “De onderzoeker controleert de resultaten”?", ["de resultaten", "de onderzoeker", "controleert", "geen"], "de resultaten"),
    mc(category, level <= 5 ? "Welke zin bevat een naamwoordelijk gezegde?" : "Welke zin bevat een betrekkelijke bijzin?", level <= 5 ? ["De opdracht is moeilijk.", "De leerling maakt de opdracht.", "Wij lezen.", "Hij opent."] : ["Het boek dat ik lees is spannend.", "Omdat het regent, blijven we binnen.", "Ik weet dat hij komt.", "Als je studeert, slaag je."], level <= 5 ? "De opdracht is moeilijk." : "Het boek dat ik lees is spannend."),
  ];
}
