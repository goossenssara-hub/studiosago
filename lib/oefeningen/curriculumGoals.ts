import type { LearningSubject } from "./types";

export type CurriculumGoal = {
  code: string;
  subject: LearningSubject;
  skill: string;
  text: string;
  sourceLevel: string;
};

/**
 * Gebaseerd op de aangeleverde Vlaamse onderwijsdoelen.
 * Voor leerjaar 1-3 en 5 wordt een opbouw naar de officiële doelen van het
 * einde van de graad gebruikt. Leerjaar 4 en 6 verwijzen rechtstreeks naar
 * de codes uit de aangeleverde bestanden.
 */
export const PRIMARY_GOALS: Record<number, CurriculumGoal[]> = {
  1: [
    { code: "LIJN-2.1.1", subject: "Wiskunde", skill: "Getallen", text: "Ik bouw getalbegrip op en gebruik eenvoudige splitsingen en bewerkingen.", sourceLevel: "opbouw naar 4de leerjaar" },
    { code: "LIJN-1.1.1", subject: "Taal", skill: "Lezen", text: "Ik lees woorden en korte zinnen nauwkeurig en begrijp wat er letterlijk staat.", sourceLevel: "opbouw naar 4de leerjaar" },
    { code: "LIJN-3.1", subject: "Wereldoriëntatie", skill: "Mens en tijd", text: "Ik herken kenmerken uit mijn lichaam, omgeving en dagelijkse tijd.", sourceLevel: "opbouw naar 4de leerjaar" },
  ],
  2: [
    { code: "LIJN-2.2", subject: "Wiskunde", skill: "Bewerkingen", text: "Ik reken met getallen tot 100 en gebruik de eerste tafels in betekenisvolle situaties.", sourceLevel: "opbouw naar 4de leerjaar" },
    { code: "LIJN-1.2", subject: "Taal", skill: "Spelling en begrip", text: "Ik schrijf frequente woorden correct en haal informatie uit een korte tekst.", sourceLevel: "opbouw naar 4de leerjaar" },
    { code: "LIJN-3.1", subject: "Wereldoriëntatie", skill: "Natuur en ruimte", text: "Ik herken seizoenen, materialen, dieren en plaatsen uit mijn leefwereld.", sourceLevel: "opbouw naar 4de leerjaar" },
  ],
  3: [
    { code: "LIJN-2.6.1", subject: "Wiskunde", skill: "Probleemoplossend denken", text: "Ik haal gegevens uit een vraagstuk en kies een passende bewerking.", sourceLevel: "opbouw naar doel 2.6.1" },
    { code: "LIJN-1.1", subject: "Taal", skill: "Lezen en taalbeschouwing", text: "Ik lees vlotter, herken zinsdelen en leg eenvoudige verbanden.", sourceLevel: "opbouw naar 4de leerjaar" },
    { code: "LIJN-4.1.2", subject: "Wereldoriëntatie", skill: "Ruimte en natuur", text: "Ik gebruik hoofdwindrichtingen en beschrijf eenvoudige natuurverschijnselen.", sourceLevel: "opbouw naar doel 4.1.2" },
  ],
  4: [
    { code: "2.6.1", subject: "Wiskunde", skill: "Probleemoplossend denken", text: "Ik los wiskundige problemen met minstens één bewerking of handeling op.", sourceLevel: "4de leerjaar" },
    { code: "2.6.2", subject: "Wiskunde", skill: "Vraagstukken", text: "Ik los vraagstukken op met natuurlijke getallen, decimalen en eenvoudige breuken.", sourceLevel: "4de leerjaar" },
    { code: "1.1.1", subject: "Taal", skill: "Lezen", text: "Ik lees woorden met behulp van inzicht in hun morfologische opbouw.", sourceLevel: "4de leerjaar" },
    { code: "4.1.2", subject: "Wereldoriëntatie", skill: "Ruimte", text: "Ik gebruik hoofd- en tussenwindrichtingen om ligging te beschrijven.", sourceLevel: "4de leerjaar" },
    { code: "3.1.1", subject: "Wereldoriëntatie", skill: "Natuur", text: "Ik herken en classificeer belangrijke groepen organismen.", sourceLevel: "4de leerjaar" },
  ],
  5: [
    { code: "LIJN-2.1.13", subject: "Wiskunde", skill: "Breuken en procenten", text: "Ik verbind breuken, kommagetallen en eenvoudige procenten.", sourceLevel: "opbouw naar 6de leerjaar" },
    { code: "LIJN-2.6", subject: "Wiskunde", skill: "Meerstapsproblemen", text: "Ik kies en combineer bewerkingen in een meerstapsvraagstuk.", sourceLevel: "opbouw naar 6de leerjaar" },
    { code: "LIJN-1.1", subject: "Taal", skill: "Begrijpend lezen", text: "Ik selecteer belangrijke informatie en leid eenvoudige verbanden af.", sourceLevel: "opbouw naar 6de leerjaar" },
    { code: "LIJN-3.1", subject: "Wereldoriëntatie", skill: "Wetenschap en techniek", text: "Ik verklaar eenvoudige processen in natuur, techniek en samenleving.", sourceLevel: "opbouw naar 6de leerjaar" },
    { code: "LIJN-10.1", subject: "Frans", skill: "Basiscommunicatie", text: "Ik begrijp en gebruik aangeleerde Franse woorden en korte structuren.", sourceLevel: "opbouw naar 6de leerjaar" },
  ],
  6: [
    { code: "2.1.13", subject: "Wiskunde", skill: "Procenten", text: "Ik begrijp een procent als een breuk met noemer 100.", sourceLevel: "6de leerjaar" },
    { code: "2.1.14", subject: "Wiskunde", skill: "Breuk-decimaal-procent", text: "Ik leg het verband tussen een breuk, een decimaal getal en een procent.", sourceLevel: "6de leerjaar" },
    { code: "2.2.4", subject: "Wiskunde", skill: "Toepassen", text: "Ik zet betekenisvolle situaties om naar bewerkingen met breuken en procenten.", sourceLevel: "6de leerjaar" },
    { code: "1.1.1", subject: "Taal", skill: "Woordopbouw", text: "Ik lees onbekende woorden met inzicht in morfologische opbouw en leenwoorden.", sourceLevel: "6de leerjaar" },
    { code: "4.1.1", subject: "Wereldoriëntatie", skill: "Topografie", text: "Ik situeer belangrijke landen, hoofdsteden, rivieren, gebergten en werelddelen.", sourceLevel: "6de leerjaar" },
    { code: "3.1.1", subject: "Wereldoriëntatie", skill: "Classificatie", text: "Ik gebruik begrippen om organismen wetenschappelijk te classificeren.", sourceLevel: "6de leerjaar" },
    { code: "10.1.2", subject: "Frans", skill: "Luisteren en begrijpen", text: "Ik begrijp een korte aangeleerde Franse zin van zes tot acht woorden.", sourceLevel: "6de leerjaar" },
  ],
};

export const SECONDARY_GOALS: Record<string, { code: string; text: string }> = {
  "wiskunde-hoofdrekenen": { code: "06.01", text: "Ik gebruik wiskundige concepten en vaardigheden om problemen op te lossen en mijn aanpak te controleren." },
  "wiskunde-vraagstukken": { code: "06.01", text: "Ik vertaal een realistische situatie naar wiskundige bewerkingen en beoordeel mijn resultaat." },
  "wiskunde-breuken-kommagetallen": { code: "06.01", text: "Ik verbind breuken, kommagetallen en verhoudingen en pas ze functioneel toe." },
  "wiskunde-procenten-verhoudingen": { code: "06.01", text: "Ik redeneer met procenten en verhoudingen in betekenisvolle situaties." },
  "wiskunde-meetkunde": { code: "06.01", text: "Ik analyseer meetkundige figuren en bereken grootheden met een passende formule." },
  "wiskunde-tabellen-grafieken": { code: "06.01", text: "Ik lees, interpreteer en vergelijk gegevens in tabellen en grafieken." },
  "nederlands-begrijpend-lezen": { code: "02.01/02.03", text: "Ik bepaal onderwerp, hoofdgedachte en hoofdpunten en selecteer relevante informatie uit teksten." },
  "nederlands-opdrachten": { code: "02.03", text: "Ik selecteer relevante informatie en voer een meervoudige opdracht doelgericht uit." },
  "nederlands-woordenschat": { code: "02.06", text: "Ik gebruik nieuwe woordenschat om teksten beter te begrijpen en zelf nauwkeurig te formuleren." },
  "nederlands-spelling": { code: "02.07", text: "Ik pas inzicht in het Nederlandse taalsysteem toe bij spelling en formulering." },
  "nederlands-taalbeschouwing": { code: "02.07", text: "Ik pas inzicht in het taalsysteem toe om zinnen en teksten correct te begrijpen en te formuleren." },
  "nederlands-samenvatten": { code: "02.01/02.04", text: "Ik onderscheid hoofd- en bijzaken en verwerk de kern in doelgerichte notities of een samenvatting." },
  "leren-leren-plannen": { code: "13.01", text: "Ik plan mijn leerproces, kies een passende strategie en stuur bij op basis van feedback." },
};
