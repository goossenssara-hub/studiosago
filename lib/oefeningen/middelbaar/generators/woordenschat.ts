import { mc, type ExerciseInput, type Random } from "./shared";

const levels = [
  [["relevant", "belangrijk voor de vraag"], ["concluderen", "besluiten"], ["prioriteit", "wat eerst aandacht krijgt"]],
  [["impliciet", "niet rechtstreeks gezegd maar wel bedoeld"], ["illustreren", "met een voorbeeld verduidelijken"], ["onderbouwen", "met bewijs ondersteunen"]],
  [["nuanceren", "een uitspraak minder absoluut maken"], ["analyseren", "in onderdelen en verbanden onderzoeken"], ["criterium", "maatstaf voor beoordeling"]],
  [["consistent", "zonder tegenspraak of sterke afwijking"], ["significant", "betekenisvol of statistisch opvallend"], ["context", "omstandigheden die betekenis beïnvloeden"]],
  [["hypothese", "voorlopige verklaring die je toetst"], ["variabele", "kenmerk dat kan veranderen"], ["correlatie", "samenhang tussen twee variabelen"]],
  [["causaliteit", "oorzakelijk verband"], ["representatief", "kenmerkend voor de grotere groep"], ["methodologie", "wijze waarop onderzoek is uitgevoerd"]],
  [["ambigu", "voor meerdere uitleg vatbaar"], ["paradox", "schijnbare tegenspraak"], ["premisse", "uitgangspunt van een redenering"]],
  [["validiteit", "mate waarin je meet wat je wilt meten"], ["betrouwbaarheid", "mate waarin meting stabiel is"], ["bias", "systematische vertekening"]],
  [["synthetiseren", "informatie combineren tot een nieuw geheel"], ["weerleggen", "aantonen dat een bewering niet standhoudt"], ["extrapoleren", "een trend buiten bekende gegevens doortrekken"]],
  [["epistemisch", "betrekking hebbend op kennis en zekerheid"], ["deterministisch", "volledig bepaald door voorafgaande factoren"], ["falsifieerbaar", "in principe weerlegbaar door bewijs"]],
] as const;

export function generateWoordenschat(level: number, _random: Random): ExerciseInput[] {
  const category = `Woordenschat en schooltaal · niveau ${level}`;
  const words = levels[level - 1];

  return [
    ...words.map(([word, meaning]) =>
      mc(category, `Wat betekent “${word}”?`, [meaning, "het tegenovergestelde", "een willekeurig voorbeeld", "zonder betekenis"], meaning)
    ),
    mc(category, `Welk woord past: “De onderzoeker ___ zijn conclusie met cijfers.”`, ["onderbouwt", "vermijdt", "verbergt", "vervangt"], "onderbouwt"),
    mc(category, `Welk woord is het beste synoniem van “besluiten”?`, ["concluderen", "twijfelen", "kopiëren", "verbergen"], "concluderen"),
    mc(category, `Welke zin gebruikt “${words[0][0]}” correct?`, [
      `Deze informatie is ${words[0][0]} voor de onderzoeksvraag.`,
      `Hij ${words[0][0]} zijn fiets.`,
      `De deur werd ${words[0][0]} gegeten.`,
      `Wij wandelen ${words[0][0]} gisteren.`,
    ], `Deze informatie is ${words[0][0]} voor de onderzoeksvraag.`),
  ];
}
