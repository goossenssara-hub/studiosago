import { mc, type ExerciseInput, type Random } from "./shared";

const texts = [
  "De schooltuin wordt vernieuwd. Vrijwilligers verwijderen oud hout, leerlingen plaatsen plantenbakken en de gemeente levert compost. Het doel is een groene leerplek.",
  "Een nieuwe fietsroute verbindt drie dorpen. De route vermijdt drukke wegen en krijgt extra verlichting. De gemeente hoopt zo meer inwoners te laten fietsen.",
  "Onderzoekers volgden honderd leerlingen gedurende zes maanden. Leerlingen die hun leerstof gespreid herhaalden, onthielden meer dan leerlingen die alles op één avond leerden.",
  "Een stadsbestuur wil hitte verminderen met bomen, waterpartijen en lichtere bestrating. Elke maatregel helpt, maar vraagt ruimte, onderhoud en investeringen.",
  "Een rapport vergelijkt drie vervoersvormen op prijs, reistijd en uitstoot. De trein scoort goed op uitstoot, maar niet op elke route op reistijd.",
  "Wetenschappelijke kennis groeit door herhaling en kritiek. Eén studie kan aanwijzingen geven, maar pas meerdere onderzoeken maken een conclusie sterker.",
  "Een overtuigende tekst combineert een helder standpunt met relevante argumenten en betrouwbare bronnen. Tegenargumenten negeren maakt een tekst vaak minder geloofwaardig.",
  "Artificiële intelligentie kan feedback versnellen, maar roept vragen op over privacy en zelfstandig denken. Verantwoord gebruik vraagt daarom duidelijke afspraken.",
  "Gemiddelden kunnen verschillen tussen groepen verbergen. Een beleidsmaatregel kan gemiddeld positief lijken en toch voor een specifieke groep nadelig uitvallen.",
  "Historische bronnen zijn gevormd door hun maker, doel en tijd. Een goede synthese vergelijkt perspectieven en benoemt onzekerheden in plaats van één bron als volledig neutraal te behandelen.",
] as const;

export function generateSamenvatten(level: number, _random: Random): ExerciseInput[] {
  const category = `Samenvatten en structureren · niveau ${level}`;
  const text = texts[level - 1];

  return [
    mc(category, `${text}\n\nWelke hoofdgedachte past het best?`, ["De tekst bundelt de belangrijkste boodschap en voorwaarden.", "Een detail is het volledige onderwerp.", "De tekst heeft geen kern.", "Alle zinnen zijn even belangrijk."], "De tekst bundelt de belangrijkste boodschap en voorwaarden."),
    mc(category, `${text}\n\nWelke informatie is waarschijnlijk een bijzaak?`, ["een concreet voorbeeld of detail", "de centrale boodschap", "het hoofddoel", "de conclusie"], "een concreet voorbeeld of detail"),
    { category, question: `${text}\n\nNoteer drie kernwoorden, gescheiden door komma's.`, answer: text.split(" ").slice(0, 3).join(", ") },
    mc(category, `${text}\n\nWelke structuur herken je het best?`, level <= 3 ? ["doel en aanpak", "alfabetisch", "dialoog", "recept"] : ["stelling met nuance", "alfabetisch", "opsomming zonder verband", "fictief verhaal"], level <= 3 ? "doel en aanpak" : "stelling met nuance"),
    mc(category, `${text}\n\nWelke samenvatting is te gedetailleerd?`, ["Een versie die elk voorbeeld en cijfer overneemt", "Een versie met hoofdgedachte en kernpunten", "Een korte synthese", "Een schema met hoofdzaken"], "Een versie die elk voorbeeld en cijfer overneemt"),
    mc(category, `${text}\n\nWat moet zeker behouden blijven?`, ["hoofdgedachte, kernargumenten en belangrijke nuance", "alle losse details", "alleen de eerste zin", "alle leestekens"], "hoofdgedachte, kernargumenten en belangrijke nuance"),
  ];
}
