import { mc, type ExerciseInput, type Random } from "./shared";

const texts = [
  "Steeds meer scholen voeren een smartphonebeleid in. Tijdens de lessen blijven toestellen opgeborgen. Volgens de directie kunnen leerlingen zich daardoor beter concentreren. Sommige leerlingen vinden de regel streng, maar leerkrachten merken minder onderbrekingen.",
  "Steden planten extra bomen om hitte te beperken. Bomen zorgen voor schaduw en verdampen water, waardoor de temperatuur lokaal daalt. Toch vraagt deze aanpak ruimte, onderhoud en voldoende water tijdens droge periodes.",
  "Online informatie verspreidt zich snel, maar niet elke bron is betrouwbaar. Wie auteur, datum, bedoeling en bewijs controleert, verkleint de kans om misleidende berichten te geloven.",
  "Hoewel digitale middelen het leren kunnen ondersteunen, blijkt onbeperkt gebruik vaak afleidend. Een verbod alleen volstaat echter niet: leerlingen moeten ook leren wanneer en waarom technologie nuttig is.",
  "Openbaar vervoer kan files en uitstoot verminderen. Het effect blijft beperkt wanneer verbindingen onregelmatig zijn of overstappen te lang duren. Betrouwbaarheid is daarom even belangrijk als prijs.",
  "Wetenschappers waarschuwen dat één onderzoek zelden een definitief antwoord biedt. Resultaten moeten worden herhaald, gecontroleerd en vergeleken voordat stevige conclusies mogelijk zijn.",
  "Een overtuigende tekst gebruikt argumenten, voorbeelden en bronnen. Toch kan dezelfde informatie anders worden voorgesteld door bepaalde cijfers te benadrukken en andere weg te laten.",
  "De groei van artificiële intelligentie biedt kansen voor onderwijs, maar roept vragen op over privacy, auteurschap en afhankelijkheid. Scholen zoeken daarom naar regels die innovatie toelaten zonder verantwoordelijkheid te verliezen.",
  "Klimaatmaatregelen hebben vaak effecten op verschillende groepen. Een maatregel kan gemiddeld voordelig zijn, maar specifieke huishoudens zwaarder treffen. Beleidsmakers moeten daarom niet alleen naar gemiddelden kijken.",
  "Historische bronnen geven nooit een volledig neutraal beeld. Ze zijn gemaakt vanuit een bepaalde positie, met een doel en voor een publiek. Kritisch bronnenonderzoek vergelijkt daarom meerdere perspectieven.",
] as const;

export function generateBegrijpendLezen(level: number, _random: Random): ExerciseInput[] {
  const category = `Begrijpend lezen · niveau ${level}`;
  const text = texts[level - 1];

  return [
    mc(category, `${text}\n\nWat is de hoofdgedachte?`, [
      level <= 3 ? "De tekst legt een maatregel of probleem met gevolgen uit." : "De tekst bespreekt een genuanceerd standpunt met voorwaarden.",
      "De tekst vertelt alleen een grappig verhaal.",
      "De tekst geeft uitsluitend losse cijfers.",
      "De tekst bevat geen centraal onderwerp.",
    ], level <= 3 ? "De tekst legt een maatregel of probleem met gevolgen uit." : "De tekst bespreekt een genuanceerd standpunt met voorwaarden."),
    mc(category, `${text}\n\nWat is het belangrijkste tekstdoel?`, ["informeren", "ontspannen", "verkopen", "een recept geven"], "informeren"),
    mc(category, `${text}\n\nWelk verband staat centraal?`, level <= 4 ? ["oorzaak-gevolg", "chronologie", "opsomming zonder verband", "vraag-antwoord"] : ["nuancering", "chronologie", "receptstructuur", "alfabetische ordening"], level <= 4 ? "oorzaak-gevolg" : "nuancering"),
    { category, question: `${text}\n\nNoteer één bewijszin of kerngegeven uit de tekst.`, answer: [text.split(". ")[1] + ".", text.split(". ")[2] + "."] },
    mc(category, `${text}\n\nWelke conclusie is het best onderbouwd?`, [
      level <= 5 ? "De aanpak kan werken, maar heeft ook voorwaarden of nadelen." : "Een eenvoudig oordeel is onvoldoende; context en bewijs zijn nodig.",
      "De tekst bewijst dat één oplossing altijd werkt.",
      "De schrijver geeft geen enkele nuance.",
      "Alle voorbeelden zijn irrelevant.",
    ], level <= 5 ? "De aanpak kan werken, maar heeft ook voorwaarden of nadelen." : "Een eenvoudig oordeel is onvoldoende; context en bewijs zijn nodig."),
    mc(category, `${text}\n\nWelke titel past het best?`, [
      `Een genuanceerde blik op ${level <= 3 ? "een actuele maatregel" : "een complex vraagstuk"}`,
      "Een dag zonder onderwerp",
      "Alle cijfers op een rij",
      "Een grappig verzinsel",
    ], `Een genuanceerde blik op ${level <= 3 ? "een actuele maatregel" : "een complex vraagstuk"}`),
  ];
}
