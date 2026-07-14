import { mc, type ExerciseInput, type Random } from "./shared";
type Passage = {
  title: string;
  text: string;
  mainIdea: string;
  detail: string;
  structure: string;
  keywords: [string, string, string];
  summary: string;
  signalWord: string;
};
const levels: readonly (readonly Passage[])[] = [
  [
    {
      title: `De schooltuin`,
      text: `De schooltuin wordt vernieuwd. Vrijwilligers verwijderen versleten hout, leerlingen vullen plantenbakken en de gemeente levert compost. Zo ontstaat een groene plek waar leerlingen buiten kunnen leren.`,
      mainIdea: `De schooltuin wordt samen vernieuwd tot een groene leerplek.`,
      detail: `de gemeente levert compost`,
      structure: `doel en aanpak`,
      keywords: [`schooltuin`, `samenwerking`, `leerplek`],
      summary: `Vrijwilligers, leerlingen en de gemeente vernieuwen samen de schooltuin tot een groene leerplek.`,
      signalWord: `Zo`,
    },
    {
      title: `Veilig naar school`,
      text: `De school plaatst extra fietsenrekken en markeert een veilige oversteekplaats. Ouders krijgen de vraag om de schoolpoort vrij te houden. Met deze maatregelen wil de school de ochtendspits veiliger maken.`,
      mainIdea: `De school neemt verschillende maatregelen voor een veiligere ochtendspits.`,
      detail: `er komen extra fietsenrekken`,
      structure: `probleem en oplossing`,
      keywords: [`verkeer`, `veiligheid`, `schoolpoort`],
      summary: `Met fietsenrekken, een oversteekplaats en een vrije schoolpoort wil de school de ochtendspits veiliger maken.`,
      signalWord: `Met deze maatregelen`,
    },
    {
      title: `Water besparen`,
      text: `In de sporthal zijn nieuwe kranen geplaatst die automatisch sluiten. Ook worden lekken sneller gemeld en hersteld. Daardoor daalt het waterverbruik zonder dat bezoekers hun gewoonten sterk moeten aanpassen.`,
      mainIdea: `Technische maatregelen verminderen het waterverbruik in de sporthal.`,
      detail: `de kranen sluiten automatisch`,
      structure: `maatregel en gevolg`,
      keywords: [`water`, `kranen`, `besparing`],
      summary: `Automatische kranen en snelle herstellingen zorgen voor minder waterverbruik in de sporthal.`,
      signalWord: `Daardoor`,
    },
  ],
  [
    {
      title: `Nieuwe fietsroute`,
      text: `Een nieuwe fietsroute verbindt drie dorpen. De route vermijdt drukke wegen en krijgt extra verlichting. De gemeente hoopt dat daardoor meer inwoners veilig met de fiets naar school of het werk gaan.`,
      mainIdea: `Een veilige nieuwe fietsroute moet meer inwoners doen fietsen.`,
      detail: `de route krijgt extra verlichting`,
      structure: `doel en middelen`,
      keywords: [`fietsroute`, `veiligheid`, `mobiliteit`],
      summary: `De gemeente legt een veilige, verlichte fietsroute aan om fietsen tussen drie dorpen te stimuleren.`,
      signalWord: `daardoor`,
    },
    {
      title: `Bibliotheekpas`,
      text: `Jongeren tot achttien jaar kunnen voortaan gratis lid worden van de bibliotheek. Ze mogen boeken, strips en luisterboeken lenen. De stad wil zo lezen toegankelijker maken voor elk gezin.`,
      mainIdea: `Een gratis bibliotheekpas moet lezen toegankelijker maken voor jongeren.`,
      detail: `jongeren mogen ook luisterboeken lenen`,
      structure: `maatregel en doel`,
      keywords: [`bibliotheek`, `gratis`, `lezen`],
      summary: `De stad biedt jongeren gratis bibliotheeklidmaatschap aan om lezen voor elk gezin toegankelijker te maken.`,
      signalWord: `zo`,
    },
    {
      title: `Afval op school`,
      text: `Op de speelplaats staan voortaan aparte bakken voor papier, restafval en verpakkingen. Klassen bespreken eerst wat in elke bak hoort. Daarna controleert een milieuteam of het sorteren goed verloopt.`,
      mainIdea: `De school voert afvalsortering in en begeleidt leerlingen daarbij.`,
      detail: `een milieuteam controleert het sorteren`,
      structure: `chronologische aanpak`,
      keywords: [`afval`, `sorteren`, `milieuteam`],
      summary: `De school leert leerlingen afval sorteren en laat een milieuteam de uitvoering opvolgen.`,
      signalWord: `Daarna`,
    },
  ],
  [
    {
      title: `Gespreid leren`,
      text: `Onderzoekers volgden honderd leerlingen gedurende zes maanden. Leerlingen die hun leerstof in korte blokken over meerdere dagen herhaalden, onthielden meer dan leerlingen die alles op één avond leerden. Regelmatig herhalen lijkt dus doeltreffender dan blokken.`,
      mainIdea: `Gespreid herhalen helpt leerlingen leerstof beter onthouden dan alles tegelijk leren.`,
      detail: `het onderzoek duurde zes maanden`,
      structure: `onderzoek en conclusie`,
      keywords: [`gespreid`, `herhalen`, `onthouden`],
      summary: `Een onderzoek toont dat leerlingen meer onthouden wanneer ze leerstof gespreid herhalen in plaats van alles op één avond te leren.`,
      signalWord: `dus`,
    },
    {
      title: `Pauzes tijdens leren`,
      text: `Een klas testte twee manieren van studeren. De ene groep werkte negentig minuten zonder pauze, de andere groep nam na elk halfuur vijf minuten rust. De tweede groep bleef langer geconcentreerd en maakte minder slordigheidsfouten.`,
      mainIdea: `Korte pauzes kunnen concentratie verbeteren en fouten verminderen.`,
      detail: `de pauzes duurden vijf minuten`,
      structure: `vergelijking`,
      keywords: [`pauzes`, `concentratie`, `fouten`],
      summary: `In een klastest bleef de groep met korte pauzes langer geconcentreerd en maakte ze minder fouten dan de groep zonder pauzes.`,
      signalWord: `de andere groep`,
    },
    {
      title: `Ontbijt en aandacht`,
      text: `Een school onderzocht of leerlingen zich beter concentreren na een ontbijt. Op dagen waarop meer leerlingen ontbeten, verliepen de eerste lessen rustiger. Toch bewijst dit niet dat het ontbijt als enige oorzaak verantwoordelijk is.`,
      mainIdea: `Er is een verband tussen ontbijten en rustigere lessen, maar geen bewezen enkelvoudige oorzaak.`,
      detail: `het ging om de eerste lessen`,
      structure: `waarneming met nuance`,
      keywords: [`ontbijt`, `concentratie`, `verband`],
      summary: `De school zag rustigere eerste lessen wanneer meer leerlingen ontbeten, maar kan daaruit geen zekere oorzaak afleiden.`,
      signalWord: `Toch`,
    },
  ],
  [
    {
      title: `Koele stad`,
      text: `Een stadsbestuur wil hitte verminderen met bomen, waterpartijen en lichtere bestrating. Bomen geven schaduw, water zorgt voor verkoeling en lichte stenen nemen minder warmte op. Elke maatregel helpt, maar vraagt ruimte, onderhoud en investeringen.`,
      mainIdea: `Verschillende maatregelen kunnen stadshitte beperken, maar hebben ook praktische voorwaarden.`,
      detail: `lichte stenen nemen minder warmte op`,
      structure: `opsomming met nuance`,
      keywords: [`hitte`, `maatregelen`, `voorwaarden`],
      summary: `Bomen, water en lichte bestrating kunnen stadshitte verminderen, al vragen ze ruimte, onderhoud en geld.`,
      signalWord: `maar`,
    },
    {
      title: `Schoolrestaurant`,
      text: `Het schoolrestaurant wil meer plantaardige maaltijden aanbieden. Die hebben vaak een lagere milieu-impact en kunnen goedkoper zijn. Sommige leerlingen vrezen minder keuze, daarom start de school met twee proefdagen per week.`,
      mainIdea: `De school test meer plantaardige maaltijden en houdt rekening met bezorgdheid over keuze.`,
      detail: `de proef loopt twee dagen per week`,
      structure: `argument en compromis`,
      keywords: [`plantaardig`, `milieu`, `proefdagen`],
      summary: `Om milieu- en kostvoordelen te testen, biedt de school twee dagen per week meer plantaardige maaltijden aan.`,
      signalWord: `daarom`,
    },
    {
      title: `Regenwater`,
      text: `Nieuwe appartementsgebouwen moeten regenwater opvangen voor toiletten en tuinonderhoud. Daardoor wordt minder drinkwater gebruikt en stroomt bij hevige regen minder water naar de riolering. De installatie kost wel extra bij de bouw.`,
      mainIdea: `Regenwateropvang bespaart drinkwater en ontlast de riolering, maar verhoogt de bouwkost.`,
      detail: `het water wordt gebruikt voor toiletten`,
      structure: `voordelen en nadeel`,
      keywords: [`regenwater`, `drinkwater`, `riolering`],
      summary: `Regenwateropvang vermindert drinkwatergebruik en rioolbelasting, hoewel de installatie extra kost.`,
      signalWord: `wel`,
    },
  ],
  [
    {
      title: `Vervoerskeuze`,
      text: `Een rapport vergelijkt auto, trein en fiets op prijs, reistijd en uitstoot. De fiets scoort goed voor korte afstanden, terwijl de trein op langere trajecten weinig uitstoot veroorzaakt. De auto is soms sneller, maar meestal duurder en vervuilender.`,
      mainIdea: `De beste vervoerskeuze hangt af van afstand en afweging tussen tijd, prijs en uitstoot.`,
      detail: `de auto is soms sneller`,
      structure: `vergelijking volgens criteria`,
      keywords: [`vervoer`, `criteria`, `uitstoot`],
      summary: `Auto, trein en fiets hebben verschillende voor- en nadelen; afstand, reistijd, prijs en uitstoot bepalen de beste keuze.`,
      signalWord: `terwijl`,
    },
    {
      title: `Digitale handboeken`,
      text: `Digitale handboeken zijn licht om mee te nemen en snel te actualiseren. Papieren boeken leiden vaak minder af en werken zonder batterij. Scholen kiezen daarom soms voor een combinatie, afhankelijk van vak en opdracht.`,
      mainIdea: `Een combinatie van digitale en papieren handboeken kan voordelen van beide benutten.`,
      detail: `papieren boeken werken zonder batterij`,
      structure: `vergelijking en besluit`,
      keywords: [`handboeken`, `digitaal`, `combinatie`],
      summary: `Omdat digitale en papieren boeken elk voordelen hebben, kiezen scholen soms afhankelijk van het gebruik voor een combinatie.`,
      signalWord: `daarom`,
    },
    {
      title: `Sport na school`,
      text: `Teamsport stimuleert samenwerking en sociale contacten. Individuele sport laat deelnemers vaker hun eigen tempo bepalen. Welke vorm het meest geschikt is, hangt af van persoonlijke doelen, voorkeuren en beschikbare begeleiding.`,
      mainIdea: `De geschiktheid van team- of individuele sport hangt af van persoonlijke omstandigheden.`,
      detail: `teamsport stimuleert sociale contacten`,
      structure: `vergelijking met afweging`,
      keywords: [`sport`, `voorkeur`, `doelen`],
      summary: `Team- en individuele sport bieden andere voordelen; persoonlijke doelen en voorkeuren bepalen welke vorm past.`,
      signalWord: `hangt af van`,
    },
  ],
  [
    {
      title: `Sterke wetenschap`,
      text: `Wetenschappelijke kennis groeit door herhaling en kritiek. Eén studie kan aanwijzingen geven, maar fouten of toeval zijn nooit volledig uitgesloten. Wanneer meerdere onafhankelijke onderzoeken vergelijkbare resultaten opleveren, wordt een conclusie sterker.`,
      mainIdea: `Wetenschappelijke conclusies worden sterker door herhaling en onafhankelijke bevestiging.`,
      detail: `één studie kan aanwijzingen geven`,
      structure: `stelling en onderbouwing`,
      keywords: [`onderzoek`, `herhaling`, `conclusie`],
      summary: `Omdat één studie onzeker kan zijn, worden wetenschappelijke conclusies sterker wanneer onafhankelijke onderzoeken dezelfde resultaten vinden.`,
      signalWord: `Wanneer`,
    },
    {
      title: `Slaaponderzoek`,
      text: `Verschillende onderzoeken koppelen voldoende slaap aan betere aandacht en geheugenprestaties. De precieze slaapbehoefte verschilt echter per leeftijd en persoon. Algemene richtlijnen zijn daarom nuttig, maar vervangen geen aandacht voor individuele signalen.`,
      mainIdea: `Slaap ondersteunt aandacht en geheugen, maar de behoefte verschilt per persoon.`,
      detail: `slaapbehoefte verschilt per leeftijd`,
      structure: `bevinding met nuancering`,
      keywords: [`slaap`, `aandacht`, `verschillen`],
      summary: `Onderzoek verbindt voldoende slaap met betere prestaties, terwijl individuele slaapbehoeften kunnen verschillen.`,
      signalWord: `echter`,
    },
    {
      title: `Burgeronderzoek`,
      text: `Bij burgeronderzoek verzamelen veel vrijwilligers gegevens over bijvoorbeeld vogels of luchtkwaliteit. Zo ontstaat snel een grote dataset. Om betrouwbare conclusies te trekken, moeten instructies duidelijk zijn en metingen gecontroleerd worden.`,
      mainIdea: `Burgeronderzoek levert veel gegevens op, mits de verzameling duidelijk en gecontroleerd gebeurt.`,
      detail: `vrijwilligers meten ook luchtkwaliteit`,
      structure: `voordeel en voorwaarde`,
      keywords: [`vrijwilligers`, `gegevens`, `controle`],
      summary: `Burgeronderzoek kan snel veel gegevens opleveren, maar vereist duidelijke instructies en kwaliteitscontrole.`,
      signalWord: `Om`,
    },
  ],
  [
    {
      title: `Overtuigende tekst`,
      text: `Een overtuigende tekst combineert een helder standpunt met relevante argumenten en betrouwbare bronnen. Voorbeelden maken abstracte ideeën begrijpelijk. Tegenargumenten eerlijk bespreken verhoogt vaak de geloofwaardigheid, terwijl ze negeren de redenering kan verzwakken.`,
      mainIdea: `Een overtuigende tekst onderbouwt een helder standpunt en behandelt tegenargumenten eerlijk.`,
      detail: `voorbeelden verduidelijken abstracte ideeën`,
      structure: `stelling met argumenten`,
      keywords: [`standpunt`, `argumenten`, `tegenargumenten`],
      summary: `Een overtuigende tekst gebruikt relevante argumenten, bronnen en voorbeelden en wint aan geloofwaardigheid door tegenargumenten te bespreken.`,
      signalWord: `terwijl`,
    },
    {
      title: `Reclame herkennen`,
      text: `Reclame gebruikt beelden, emoties en selectieve informatie om gedrag te beïnvloeden. Een positieve ervaring van één klant zegt weinig over alle gebruikers. Kritische lezers controleren daarom wie de boodschap maakte, met welk doel en welk bewijs ontbreekt.`,
      mainIdea: `Kritische lezers onderzoeken doel, afzender en bewijs van reclameboodschappen.`,
      detail: `één klantervaring is niet representatief`,
      structure: `uitleg en advies`,
      keywords: [`reclame`, `doel`, `bewijs`],
      summary: `Omdat reclame selectief kan overtuigen, controleren kritische lezers de afzender, bedoeling en bewijskracht.`,
      signalWord: `daarom`,
    },
    {
      title: `Debat in de klas`,
      text: `Een goed debat draait niet alleen om snel reageren. Deelnemers luisteren, vatten het standpunt van de ander correct samen en beantwoorden vervolgens de kernargumenten. Zo wordt het gesprek inhoudelijker en neemt de kans op misverstanden af.`,
      mainIdea: `Luisteren en correct samenvatten maken een debat inhoudelijker.`,
      detail: `snel reageren is niet het enige doel`,
      structure: `werkwijze en gevolg`,
      keywords: [`debat`, `luisteren`, `argumenten`],
      summary: `Een inhoudelijk debat vraagt dat deelnemers luisteren, elkaars standpunt correct samenvatten en kernargumenten beantwoorden.`,
      signalWord: `Zo`,
    },
  ],
  [
    {
      title: `AI in onderwijs`,
      text: `Artificiële intelligentie kan feedback versnellen en oefeningen aanpassen aan het niveau van een leerling. Tegelijk zijn er vragen over privacy, auteurschap en afhankelijkheid. Verantwoord gebruik vraagt daarom transparante regels, menselijke controle en aandacht voor zelfstandig denken.`,
      mainIdea: `AI biedt onderwijskansen, maar vereist regels en menselijke controle vanwege belangrijke risico's.`,
      detail: `AI kan feedback versnellen`,
      structure: `kansen, risico's en voorwaarden`,
      keywords: [`AI`, `kansen`, `controle`],
      summary: `AI kan onderwijs ondersteunen, mits scholen privacy, auteurschap, afhankelijkheid en menselijke controle zorgvuldig regelen.`,
      signalWord: `Tegelijk`,
    },
    {
      title: `Gezichtsherkenning`,
      text: `Gezichtsherkenning kan toegangscontrole versnellen, maar verwerkt gevoelige biometrische gegevens. Fouten treffen niet alle groepen even vaak en misbruik kan moeilijk teruggedraaid worden. Organisaties moeten noodzaak, proportionaliteit en alternatieven afwegen.`,
      mainIdea: `Gezichtsherkenning biedt gemak maar brengt gevoelige en ongelijk verdeelde risico's mee.`,
      detail: `fouten treffen groepen niet even vaak`,
      structure: `voordeel met ethische afweging`,
      keywords: [`gezichtsherkenning`, `privacy`, `afweging`],
      summary: `Hoewel gezichtsherkenning toegang kan versnellen, moeten organisaties vanwege privacy en ongelijke fouten eerst noodzaak en alternatieven afwegen.`,
      signalWord: `maar`,
    },
    {
      title: `Persoonlijke leerdata`,
      text: `Leerplatformen verzamelen gegevens over antwoorden, tempo en fouten. Daarmee kunnen ze gerichte ondersteuning bieden. Dezelfde gegevens kunnen echter een onvolledig beeld geven wanneer motivatie, thuissituatie of toegankelijkheid buiten beschouwing blijven.`,
      mainIdea: `Leerdata kunnen helpen, maar geven zonder context een onvolledig beeld van leerlingen.`,
      detail: `platformen registreren ook tempo`,
      structure: `mogelijkheid en beperking`,
      keywords: [`leerdata`, `ondersteuning`, `context`],
      summary: `Leerplatformen kunnen met prestatiegegevens gerichte hulp bieden, maar moeten context meenemen om verkeerde conclusies te vermijden.`,
      signalWord: `echter`,
    },
  ],
  [
    {
      title: `Gemiddelden`,
      text: `Gemiddelden kunnen verschillen tussen groepen verbergen. Een maatregel kan gemiddeld positief lijken, terwijl een kleine groep er sterk op achteruitgaat. Beleidsmakers moeten daarom ook spreiding, subgroepen en uitzonderingen onderzoeken.`,
      mainIdea: `Een gemiddelde alleen volstaat niet om de gevolgen voor alle groepen te beoordelen.`,
      detail: `een kleine groep kan achteruitgaan`,
      structure: `waarschuwing en aanbeveling`,
      keywords: [`gemiddelde`, `subgroepen`, `spreiding`],
      summary: `Omdat gemiddelden ongelijke gevolgen kunnen verbergen, moeten beleidsmakers ook spreiding, subgroepen en uitzonderingen analyseren.`,
      signalWord: `daarom`,
    },
    {
      title: `Algoritmische selectie`,
      text: `Een selectie-algoritme kan efficiënt duizenden aanvragen rangschikken. Als historische gegevens bestaande ongelijkheid bevatten, kan het systeem die patronen overnemen. Regelmatige audits en mogelijkheden tot menselijk beroep zijn daarom essentieel.`,
      mainIdea: `Selectie-algoritmen zijn efficiënt maar kunnen historische ongelijkheid reproduceren.`,
      detail: `menselijk beroep moet mogelijk blijven`,
      structure: `risico en beheersmaatregel`,
      keywords: [`algoritme`, `ongelijkheid`, `audit`],
      summary: `Algoritmische selectie vraagt audits en menselijk beroep, omdat historische gegevens bestaande ongelijkheid kunnen doorgeven.`,
      signalWord: `Als`,
    },
    {
      title: `Gezondheidsstatistiek`,
      text: `Een behandeling verlaagt gemiddeld de klachten, maar het effect varieert sterk. Leeftijd, andere aandoeningen en therapietrouw kunnen een rol spelen. Een gemiddelde uitkomst moet daarom worden aangevuld met informatie over spreiding en patiëntkenmerken.`,
      mainIdea: `Gemiddelde behandelresultaten moeten samen met variatie en patiëntkenmerken geïnterpreteerd worden.`,
      detail: `therapietrouw kan het effect beïnvloeden`,
      structure: `resultaat met verklarende factoren`,
      keywords: [`behandeling`, `variatie`, `kenmerken`],
      summary: `Omdat behandelresultaten tussen patiënten verschillen, moet een gemiddelde worden aangevuld met spreiding en relevante kenmerken.`,
      signalWord: `maar`,
    },
  ],
  [
    {
      title: `Historische bronnen`,
      text: `Historische bronnen zijn gevormd door hun maker, doel en tijd. Een dagboek, krantenbericht en overheidsdocument kunnen hetzelfde voorval anders voorstellen. Een sterke synthese vergelijkt perspectieven, controleert context en benoemt onzekerheden.`,
      mainIdea: `Een betrouwbare historische synthese vergelijkt bronnen en maakt perspectief en onzekerheid zichtbaar.`,
      detail: `verschillende brontypes kunnen hetzelfde voorval anders voorstellen`,
      structure: `probleem en methode`,
      keywords: [`bronnen`, `perspectief`, `synthese`],
      summary: `Historische bronnen zijn niet neutraal; daarom vergelijkt een goede synthese perspectieven, context en onzekerheden.`,
      signalWord: `daarom`,
    },
    {
      title: `Klimaatmodellen`,
      text: `Klimaatmodellen combineren natuurkundige kennis met grote hoeveelheden meetgegevens. Ze voorspellen geen exacte toekomst, maar berekenen mogelijke ontwikkelingen bij verschillende aannames. Resultaten moeten dus als scenario's met onzekerheidsmarges worden gelezen.`,
      mainIdea: `Klimaatmodellen leveren scenario's, geen exacte voorspellingen, en moeten met onzekerheid geïnterpreteerd worden.`,
      detail: `modellen gebruiken meetgegevens`,
      structure: `uitleg met interpretatierichtlijn`,
      keywords: [`modellen`, `scenario's`, `onzekerheid`],
      summary: `Klimaatmodellen berekenen op basis van aannames mogelijke scenario's die met onzekerheidsmarges moeten worden geïnterpreteerd.`,
      signalWord: `dus`,
    },
    {
      title: `Causale conclusie`,
      text: `Twee verschijnselen kunnen samen optreden zonder dat het ene het andere veroorzaakt. Een derde factor kan beide beïnvloeden of de richting van het verband kan omgekeerd zijn. Voor een causale conclusie zijn daarom een passend onderzoeksontwerp en alternatieve verklaringen nodig.`,
      mainIdea: `Samenhang bewijst geen oorzaak; causale conclusies vragen sterk ontwerp en uitsluiting van alternatieven.`,
      detail: `de richting van een verband kan omgekeerd zijn`,
      structure: `misvatting en voorwaarden`,
      keywords: [`correlatie`, `causaliteit`, `verklaringen`],
      summary: `Omdat samenhang meerdere verklaringen heeft, vereist een causale conclusie een passend ontwerp en onderzoek van alternatieven.`,
      signalWord: `daarom`,
    },
  ],
] as const;

export function generateSamenvatten(
  level: number,
  _random: Random
): ExerciseInput[] {
  const safeLevel = Math.max(1, Math.min(10, Math.round(level || 1)));
  const category = `Samenvatten en structureren · niveau ${safeLevel}`;
  const passages = levels[safeLevel - 1];

  return passages.flatMap((passage) => {
    const prompt = `${passage.title}\n\n${passage.text}`;
    const keywordAnswer = passage.keywords.join(", ");

    return [
      mc(
        category,
        `${prompt}\n\nWelke hoofdgedachte vat de tekst het best samen?`,
        [
          passage.mainIdea,
          passage.detail,
          "Alle voorbeelden zijn even belangrijk als de kern.",
          "De tekst bevat alleen losse informatie zonder verband.",
        ],
        passage.mainIdea
      ),
      mc(
        category,
        `${prompt}\n\nWelk gegeven is vooral een ondersteunend detail?`,
        [
          passage.detail,
          passage.mainIdea,
          passage.summary,
          "De volledige titel en alle leestekens.",
        ],
        passage.detail
      ),
      mc(
        category,
        `${prompt}\n\nWelke tekststructuur past het best?`,
        [
          passage.structure,
          "alfabetische opsomming",
          "fictieve dialoog",
          "recept zonder conclusie",
        ],
        passage.structure
      ),
      {
        category,
        question: `${prompt}\n\nNoteer de drie kernwoorden in deze volgorde, gescheiden door komma's.`,
        answer: [keywordAnswer, passage.keywords.join(","), passage.keywords.join(" - ")],
      },
      mc(
        category,
        `${prompt}\n\nWelke samenvatting is het meest volledig én beknopt?`,
        [
          passage.summary,
          passage.detail,
          "De tekst bespreekt een onderwerp en geeft enkele voorbeelden.",
          `${passage.summary} ${passage.detail}. Alle overige formuleringen moeten letterlijk worden overgenomen.`,
        ],
        passage.summary
      ),
      mc(
        category,
        `${prompt}\n\nWelk signaalwoord helpt het verband in de tekst herkennen?`,
        [passage.signalWord, "plotseling", "ergens", "misschien"],
        passage.signalWord
      ),
    ];
  });
}
