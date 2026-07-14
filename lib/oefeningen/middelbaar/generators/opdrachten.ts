import { mc, type ExerciseInput, type Random } from "./shared";

export function generateOpdrachten(level: number, _random: Random): ExerciseInput[] {
  const category = `Opdrachten begrijpen · niveau ${level}`;
  const verbs = [
    ["noem", "geef kort de gevraagde elementen"],
    ["beschrijf", "vertel nauwkeurig wat je ziet of weet"],
    ["verklaar", "geef oorzaken of redenen"],
    ["vergelijk", "zoek overeenkomsten en verschillen"],
    ["analyseer", "onderzoek onderdelen en verbanden"],
    ["beargumenteer", "geef een standpunt met redenen en bewijs"],
    ["beoordeel", "weeg criteria af en geef een onderbouwd oordeel"],
    ["evalueer", "bespreek sterke en zwakke punten en besluit"],
    ["synthetiseer", "combineer informatie uit meerdere bronnen"],
    ["reflecteer", "koppel ervaring, inzicht en mogelijke verbetering"],
  ] as const;
  const [verb, meaning] = verbs[level - 1];

  return [
    mc(category, `Wat moet je doen bij “${verb}”?`, [meaning, "de vraag overschrijven", "alleen een voorbeeld geven", "zonder bewijs antwoorden"], meaning),
    mc(category, "Welke informatie is essentieel in: “Bereken met tabel 2 het procentuele verschil tussen 2024 en 2025”?", ["tabel 2 en beide jaarwaarden", "alle tabellen", "alleen 2025", "de hoofdstuktitel"], "tabel 2 en beide jaarwaarden"),
    mc(category, "Wat betekent “motiveer je antwoord”?", ["geef redenen voor je antwoord", "schrijf alleen ja of nee", "herhaal de vraag", "laat voorbeelden weg"], "geef redenen voor je antwoord"),
    mc(category, `Welke herformulering past bij “${verb} de gevolgen”?`, [`${meaning}`, "schrijf de gevolgen over", "noem één willekeurig woord", "sla de gevolgen over"], meaning),
    mc(category, "Welke opdracht vraagt de meest volledige verwerking?", level < 6 ? ["noem drie oorzaken", "duid aan", "vergelijk en besluit", "kopieer"] : ["vergelijk, beoordeel en motiveer", "noem", "onderlijn", "rangschik"], level < 6 ? "vergelijk en besluit" : "vergelijk, beoordeel en motiveer"),
    mc(category, "Welke aanpak is het best vóór je antwoordt?", ["instructiewoord, gegevens en gevraagde uitkomst markeren", "meteen gokken", "alle cijfers optellen", "alleen de titel lezen"], "instructiewoord, gegevens en gevraagde uitkomst markeren"),
  ];
}
