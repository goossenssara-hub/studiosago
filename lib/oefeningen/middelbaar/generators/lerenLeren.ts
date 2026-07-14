import { mc, type ExerciseInput, type Random } from "./shared";

const scenarios = [
  ["Je hebt vrijdag een toets en woensdag een taak.", "De taak afronden en vandaag al een eerste toetsblok plannen"],
  ["Je moet 24 pagina's in vier dagen leren.", "Elke dag 6 pagina's leren en kort herhalen"],
  ["Je onthoudt weinig na herlezen.", "Het boek sluiten en jezelf vragen stellen"],
  ["Je maakt steeds dezelfde fout.", "De fout analyseren en een gelijkaardige oefening opnieuw maken"],
  ["Je hebt drie toetsen in één week.", "Terugplannen, prioriteiten bepalen en herhaalblokken voorzien"],
  ["Je kent definities maar kunt ze niet toepassen.", "Oefenen met voorbeelden en uitleg in eigen woorden"],
  ["Je scoort goed op meerkeuze maar zwak op open vragen.", "Actief formuleren zonder naar het boek te kijken"],
  ["Je planning loopt telkens uit.", "Kleinere taken plannen en buffertijd toevoegen"],
  ["Je denkt dat je iets kent omdat het vertrouwd klinkt.", "Jezelf testen zonder hulpmiddelen"],
  ["Je bereidt een grote examenperiode voor.", "Gespreid oefenen, afwisselen, toetsen en bijsturen"],
] as const;

export function generateLerenLeren(level: number, _random: Random): ExerciseInput[] {
  const category = `Plannen en studeren · niveau ${level}`;
  const [scenario, answer] = scenarios[level - 1];

  return [
    mc(category, `${scenario} Wat is de beste aanpak?`, [answer, "alles uitstellen tot de laatste avond", "zonder planning beginnen", "alleen markeren"], answer),
    mc(category, "Welke studieaanpak gebruikt actief ophalen?", ["Na het leren het boek sluiten en jezelf vragen stellen", "De tekst vijf keer herlezen", "Alles markeren", "Alleen de titel bekijken"], "Na het leren het boek sluiten en jezelf vragen stellen"),
    mc(category, "Welke planning is het meest realistisch?", ["Blokken van 30–45 minuten met pauzes en concrete doelen", "Vier uur zonder pauze", "Zonder startuur studeren", "Alle vakken tegelijk"], "Blokken van 30–45 minuten met pauzes en concrete doelen"),
    mc(category, "Wat doe je na een oefenreeks?", ["Fouten analyseren en opnieuw proberen", "Alle antwoorden wissen", "Alleen het cijfer bekijken", "Onmiddellijk stoppen"], "Fouten analyseren en opnieuw proberen"),
    mc(category, level <= 5 ? "Welke taak krijgt eerst prioriteit?" : "Welke aanpassing verbetert transfer naar nieuwe vragen?", level <= 5 ? ["Een toets morgen waarvoor je nog niet geleerd hebt", "Een taak over drie weken", "Je pennenzak ordenen", "Een afgewerkte taak versieren"] : ["Oefenen met nieuwe voorbeelden en uitleg waarom een aanpak werkt", "Alleen dezelfde voorbeelden herhalen", "Minder feedback bekijken", "Alleen samenvattingen lezen"], level <= 5 ? "Een toets morgen waarvoor je nog niet geleerd hebt" : "Oefenen met nieuwe voorbeelden en uitleg waarom een aanpak werkt"),
    mc(category, "Welke controle is het betrouwbaarst?", ["De leerstof zonder boek uitleggen en toepassen", "Kijken of de pagina vertrouwd lijkt", "Nogmaals markeren", "Alleen de titel lezen"], "De leerstof zonder boek uitleggen en toepassen"),
  ];
}
