import type { Exercise, LearningSubject } from "./types";

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

function rng(seed: number) {
  let value = seed || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function between(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick<T>(random: () => number, values: readonly T[]): T {
  return values[between(random, 0, values.length - 1)];
}

function shuffle<T>(random: () => number, values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateExercisesLager(grade: Grade, level: number, seed = Date.now()): Exercise[] {
  const random = rng(seed + grade * 10007 + level * 313);
  const exercises: Exercise[] = [];
  let sequence = 0;

  const add = (
    subject: LearningSubject,
    skill: string,
    goalId: string,
    goalText: string,
    question: string,
    answer: string | string[],
    hint: string
  ) => {
    exercises.push({
      id: `g${grade}-l${level}-${sequence++}-${seed}`,
      category: skill,
      subject,
      skill,
      goalId,
      goalText,
      question,
      answer,
      hint,
    });
  };

  const difficulty = Math.max(1, Math.min(10, level));
  const limits: Record<Grade, number> = { 1: 20, 2: 100, 3: 1000, 4: 10000, 5: 100000, 6: 1000000 };
  const limit = Math.min(limits[grade], Math.max(20, Math.round(limits[grade] * (0.28 + difficulty * 0.072))));

  // WISKUNDE — 16 oefeningen per niveau
  for (let i = 0; i < 6; i += 1) {
    const a = between(random, grade === 1 ? 1 : Math.max(10, Math.floor(limit / 4)), limit);
    const b = between(random, 1, Math.max(5, Math.floor(limit / 3)));
    const subtraction = i % 2 === 1;
    const high = Math.max(a, b);
    const low = Math.min(a, b);
    add(
      "Wiskunde",
      "Getallen en bewerkingen",
      `WIS-${grade}-GET-${String(i + 1).padStart(2, "0")}`,
      "Ik reken nauwkeurig en kies een handige rekenstrategie.",
      subtraction ? `${high} − ${low} =` : `${a} + ${b} =`,
      String(subtraction ? high - low : a + b),
      subtraction
        ? "Splits het kleinste getal in een handig deel en trek stap voor stap af."
        : "Rond één getal eerst af en corrigeer daarna het verschil."
    );
  }

  const multiplicationCount = grade === 1 ? 2 : 4;
  for (let i = 0; i < multiplicationCount; i += 1) {
    if (grade === 1) {
      const groups = between(random, 2, 5);
      const each = between(random, 2, 5);
      add(
        "Wiskunde",
        "Herhaald optellen",
        `WIS-1-BEW-${i + 1}`,
        "Ik herken gelijke groepjes en tel ze handig samen.",
        `${groups} groepjes met telkens ${each}. Hoeveel zijn dat samen?`,
        String(groups * each),
        `Schrijf ${groups} keer het getal ${each} onder elkaar en tel op.`
      );
    } else {
      const maxTable = grade === 2 ? Math.min(10, 5 + difficulty) : 10;
      const a = between(random, 2, maxTable);
      const b = between(random, 2, grade >= 4 ? 12 : 10);
      const division = i % 3 === 2;
      add(
        "Wiskunde",
        "Vermenigvuldigen en delen",
        `WIS-${grade}-BEW-${i + 1}`,
        "Ik gebruik tafels en verbanden tussen vermenigvuldigen en delen.",
        division ? `${a * b} ÷ ${a} =` : `${a} × ${b} =`,
        String(division ? b : a * b),
        division
          ? `Welke tafel van ${a} levert ${a * b} op?`
          : `Splits ${b} in een gemakkelijk deel en reken in twee stappen.`
      );
    }
  }

  const meters = between(random, 2, Math.max(5, grade * difficulty));
  add(
    "Wiskunde",
    "Meten",
    `WIS-${grade}-MET-01`,
    "Ik zet maten om en gebruik de juiste maateenheid.",
    grade <= 2 ? `Hoeveel centimeter is ${meters} meter?` : `Hoeveel meter is ${meters} kilometer?`,
    String(grade <= 2 ? meters * 100 : meters * 1000),
    grade <= 2
      ? `Vermenigvuldig het aantal meter met 100.`
      : `Vermenigvuldig het aantal kilometer met 1000.`
  );

  for (let i = 0; i < 3; i += 1) {
    const groups = between(random, 2 + difficulty, 7 + difficulty);
    const each = between(random, 2, 10 + grade);
    const extra = between(random, 2, 15);
    const question = grade <= 2
      ? `${groups} doosjes bevatten elk ${each} potloden. Hoeveel potloden zijn dat?`
      : `${groups} doosjes bevatten elk ${each} potloden. Daarna worden ${extra} potloden uitgedeeld. Hoeveel blijven er over?`;
    add(
      "Wiskunde",
      "Probleemoplossend denken",
      `WIS-${grade}-PRO-${String(i + 1).padStart(2, "0")}`,
      "Ik haal gegevens uit een vraagstuk en kies de juiste bewerking(en).",
      question,
      String(grade <= 2 ? groups * each : groups * each - extra),
      grade <= 2
        ? `Je hebt ${groups} gelijke groepjes van ${each}. Welke bewerking hoort bij gelijke groepjes?`
        : `Bereken eerst hoeveel potloden er samen zijn. Trek daarna de uitgedeelde potloden af.`
    );
  }

  if (grade >= 4) {
    const denominator = pick(random, [2, 4, 5, 10] as const);
    const numerator = between(random, 1, denominator - 1);
    add(
      "Wiskunde",
      "Breuken en verhoudingen",
      `WIS-${grade}-BRE-01`,
      "Ik herken en bereken eenvoudige breuken en verhoudingen.",
      `Hoeveel is ${numerator}/${denominator} van ${denominator * between(random, 4, 12)}?`,
      (() => {
        const whole = denominator * between(random, 4, 12);
        // Vraag en antwoord moeten dezelfde waarde gebruiken; daarom niet via whole hierboven.
        return "";
      })(),
      "Deel eerst het geheel door de noemer en vermenigvuldig daarna met de teller."
    );
    const last = exercises[exercises.length - 1];
    const total = denominator * between(random, 4, 12);
    last.question = `Hoeveel is ${numerator}/${denominator} van ${total}?`;
    last.answer = String((total / denominator) * numerator);
  }

  // TAAL — 12 oefeningen per niveau
  const spellingSets: Record<Grade, readonly [string, string][]> = {
    1: [["maan", "maan"], ["vis", "vis"], ["boek", "boek"], ["roos", "roos"]],
    2: [["kat", "katten"], ["boom", "bomen"], ["jas", "jassen"], ["raam", "ramen"]],
    3: [["bom", "bommen"], ["boot", "boten"], ["stad", "steden"], ["brief", "brieven"]],
    4: [["gebeuren", "gebeurt"], ["worden", "wordt"], ["antwoorden", "antwoordt"], ["vinden", "vindt"]],
    5: [["verhuizen", "verhuist"], ["beloven", "belooft"], ["gebeuren", "gebeurt"], ["bedoelen", "bedoelt"]],
    6: [["beantwoorden", "beantwoordt"], ["veranderen", "verandert"], ["ontdekken", "ontdekt"], ["gebeuren", "gebeurt"], ["worden", "wordt"], ["bedoelen", "bedoelt"]],
  };

  for (let i = 0; i < 4; i += 1) {
    const [source, expected] = pick(random, spellingSets[grade]);
    add(
      "Taal",
      grade <= 3 ? "Spelling" : "Werkwoordspelling",
      `TAAL-${grade}-SCH-${String(i + 1).padStart(2, "0")}`,
      "Ik pas een spellingregel bewust toe.",
      grade === 1 ? `Typ het woord: ${source}` : grade <= 3 ? `Schrijf het meervoud van: ${source}` : `Vul correct aan: hij … (${source})`,
      expected,
      grade <= 3
        ? "Zeg het woord traag. Luister naar de klank vóór de laatste lettergreep."
        : "Zoek eerst het onderwerp. Bij hij/zij/het schrijf je meestal stam + t."
    );
  }

  const readingTexts = [
    ["Noor neemt een paraplu mee omdat het regent.", "Waarom neemt Noor een paraplu mee?", ["omdat het regent", "het regent"]],
    ["De klas vertrekt vroeger zodat ze op tijd bij het museum aankomt.", "Waarom vertrekt de klas vroeger?", ["om op tijd bij het museum aan te komen", "zodat ze op tijd aankomt"]],
    ["De gemeente plant extra bomen om meer schaduw te creëren.", "Wat is het doel van de extra bomen?", ["meer schaduw", "om meer schaduw te creëren"]],
    ["Amir controleert zijn planning voor hij aan zijn huiswerk begint.", "Wat doet Amir vóór zijn huiswerk?", ["hij controleert zijn planning", "zijn planning controleren"]],
    ["Lotte zet haar fietslicht aan, want het begint donker te worden.", "Waarom zet Lotte haar fietslicht aan?", ["omdat het donker wordt", "het wordt donker"]],
    ["De leerlingen vergelijken twee bronnen om te controleren welke informatie betrouwbaar is.", "Waarom vergelijken de leerlingen twee bronnen?", ["om de betrouwbaarheid te controleren", "om te controleren welke informatie betrouwbaar is"]],
    ["De bakker weegt alle ingrediënten zorgvuldig af zodat het deeg goed lukt.", "Waarom weegt de bakker de ingrediënten af?", ["zodat het deeg goed lukt", "om het deeg te laten lukken"]],
    ["Sara maakt eerst een schets voordat ze aan haar schilderij begint.", "Wat doet Sara eerst?", ["ze maakt een schets", "een schets maken"]],
    ["De trein had vertraging door een technisch probleem aan het spoor.", "Waardoor had de trein vertraging?", ["door een technisch probleem", "een technisch probleem aan het spoor"]],
    ["De buurt organiseert een opruimactie om het park netjes te houden.", "Wat is het doel van de opruimactie?", ["het park netjes houden", "om het park netjes te houden"]],
    ["Mila trekt haar jas aan omdat het koud is.", "Waarom trekt Mila haar jas aan?", ["omdat het koud is", "het is koud"]],
    ["De onderzoeker noteert haar waarnemingen onmiddellijk, zodat ze geen details vergeet.", "Waarom noteert de onderzoeker haar waarnemingen onmiddellijk?", ["zodat ze geen details vergeet", "om geen details te vergeten"]],
  ] as const;
  shuffle(random, [...readingTexts]).slice(0, 3).forEach(([text, question, accepted], index) => {
    add(
      "Taal",
      "Begrijpend lezen",
      `TAAL-${grade}-LEZ-${String(index + 1).padStart(2, "0")}`,
      "Ik vind informatie in een tekst en leg verbanden uit.",
      `${text} ${question}`,
      [...accepted],
      "Zoek het stukje van de zin dat de reden, het doel of de volgorde uitlegt. Formuleer dat in je eigen woorden."
    );
  });

  const sentenceBank = [
    ["De kinderen spelen buiten.", "spelen"],
    ["Morgen bezoekt de klas het museum.", "bezoekt"],
    ["Mijn broer maakt een grote tekening.", "maakt"],
    ["De buurvrouw verzorgt elke ochtend haar planten.", "verzorgt"],
    ["Na de pauze leest de leerkracht een verhaal voor.", "leest"],
    ["Gisteren vonden de wandelaars een kortere route.", "vonden"],
    ["Op het plein wacht een groep leerlingen op de bus.", "wacht"],
    ["De nieuwe computer start opvallend snel op.", "start"],
    ["Tijdens de proef noteerden we alle veranderingen.", "noteerden"],
    ["Volgende week organiseert de school een boekenbeurs.", "organiseert"],
  ] as const;
  shuffle(random, [...sentenceBank]).slice(0, 3).forEach(([sentence, pv], index) => {
    if (grade <= 2) {
      const word = pick(random, ["school", "boek", "tafel", "maan", "vis", "raam", "boom"] as const);
      add(
        "Taal",
        "Taalbeschouwing",
        `TAAL-${grade}-TB-${String(index + 1).padStart(2, "0")}`,
        "Ik herken letters, woorden en zinnen.",
        `Met welke letter begint het woord ${word}?`,
        word[0],
        "Zeg het woord langzaam en luister naar de eerste klank."
      );
      return;
    }

    add(
      "Taal",
      "Taalbeschouwing",
      `TAAL-${grade}-TB-${String(index + 1).padStart(2, "0")}`,
      "Ik vind de persoonsvorm met de ja-neevraag.",
      `Wat is de persoonsvorm in de zin: ${sentence}`,
      pv,
      `Maak van de zin een ja-neevraag. Het werkwoord dat vooraan komt te staan, is de persoonsvorm.`
    );
  });

  for (let i = 0; i < 2; i += 1) {
    const words = grade <= 2 ? ["zon", "maan", "ster"] : ["rustig", "zorgvuldig", "duidelijk"];
    const word = pick(random, words);
    add(
      "Taal",
      "Woordenschat",
      `TAAL-${grade}-WOORD-${String(i + 1).padStart(2, "0")}`,
      "Ik begrijp woorden en gebruik ze in de juiste context.",
      grade <= 2 ? `Welk woord rijmt op ${word === "zon" ? "zon" : "maan"}?` : `Geef een synoniem voor: ${word}`,
      grade <= 2 ? (word === "zon" ? ["ton", "bron"] : ["gaan", "staan"]) : (word === "rustig" ? ["kalm", "bedaard"] : word === "zorgvuldig" ? ["nauwkeurig", "precies"] : ["helder", "begrijpelijk"]),
      grade <= 2 ? "Zeg het woord luidop en luister naar het laatste deel." : "Denk aan een woord met ongeveer dezelfde betekenis."
    );
  }

  // WERELDORIËNTATIE — 8 oefeningen per niveau
  const woByGrade: Record<Grade, readonly [string, string | string[], string, string, string][]> = {
    1: [
      ["Welk lichaamsdeel gebruik je om te ruiken?", ["neus", "je neus", "de neus"], "Mens", "Ik herken lichaamsdelen en hun functie.", "Denk aan het zintuig waarmee je geuren waarneemt."],
      ["Welke dag komt na maandag?", "dinsdag", "Tijd", "Ik orden dagen en eenvoudige tijdsaanduidingen.", "Zeg de dagen van de week vanaf maandag op."],
      ["Waar groeit een wortel: boven of onder de grond?", ["onder de grond", "onder"], "Natuur", "Ik herken waar planten groeien.", "Denk aan welk deel van de plant je uit de aarde trekt."],
      ["Welke kleur heeft een verkeerslicht wanneer je moet stoppen?", "rood", "Maatschappij", "Ik herken eenvoudige verkeersafspraken.", "Denk aan het bovenste licht van een verkeerslicht."],
    ],
    2: [
      ["In welk seizoen vallen de bladeren meestal van de bomen?", "herfst", "Natuur", "Ik herken veranderingen in de seizoenen.", "Denk aan het seizoen tussen zomer en winter."],
      ["Welk vervoermiddel rijdt op sporen?", ["trein", "de trein"], "Ruimte", "Ik herken vervoermiddelen en hun omgeving.", "Het rijdt niet op de gewone weg."],
      ["Hoeveel maanden heeft een jaar?", "12", "Tijd", "Ik gebruik kalenderbegrippen.", "Tel de maanden van januari tot december."],
      ["Welk materiaal is doorzichtig: glas of hout?", "glas", "Techniek", "Ik herken eigenschappen van materialen.", "Je kunt erdoor kijken."],
    ],
    3: [
      ["Welk kompaspunt ligt tegenover het noorden?", "zuiden", "Ruimte", "Ik gebruik de vier hoofdwindrichtingen.", "Denk aan de verticale lijn op een kompas."],
      ["Hoe heet water dat uit wolken naar beneden valt?", ["neerslag", "regen"], "Natuur", "Ik beschrijf eenvoudige weersverschijnselen.", "Het kan regen, sneeuw of hagel zijn."],
      ["Welke overheid bestuurt jouw dorp of stad?", ["gemeente", "de gemeente"], "Maatschappij", "Ik herken een lokale bestuurslaag.", "Denk aan het gemeentehuis."],
      ["Welke eenvoudige machine helpt om een zwaar voorwerp op te tillen: een hefboom of een spons?", "hefboom", "Techniek", "Ik herken eenvoudige technische principes.", "Een wip is er een voorbeeld van."],
    ],
    4: [
      ["Welke bestuurslaag staat het dichtst bij de inwoners?", ["gemeente", "de gemeente"], "Maatschappij", "Ik herken de rol van de gemeente.", "Denk aan burgemeester en schepenen."],
      ["Welke hernieuwbare energiebron gebruikt bewegende lucht?", ["windenergie", "wind"], "Techniek", "Ik herken duurzame energiebronnen.", "Windmolens zetten bewegende lucht om in energie."],
      ["Hoe heet de lijn die de aarde in een noordelijk en zuidelijk halfrond verdeelt?", ["evenaar", "de evenaar"], "Ruimte", "Ik gebruik basisbegrippen van kaarten en wereldoriëntatie.", "Deze denkbeeldige lijn ligt op 0 graden breedte."],
      ["Wat gebeurt er met water wanneer het van vloeibaar naar gasvormig gaat?", ["verdampen", "verdamping", "het verdampt"], "Natuur", "Ik herken faseovergangen van water.", "Denk aan een plas die langzaam verdwijnt in de zon."],
    ],
    5: [
      ["Hoe heet het proces waarbij water verdampt, condenseert en terug neerslaat?", ["waterkringloop", "de waterkringloop"], "Natuur", "Ik leg de waterkringloop in grote lijnen uit.", "Denk aan de kring van zee naar wolk en terug."],
      ["In welke eeuw ligt het jaar 1789?", ["18e eeuw", "achttiende eeuw", "18"], "Tijd", "Ik plaats een jaartal in de juiste eeuw.", "De jaren 1701 tot en met 1800 vormen dezelfde eeuw."],
      ["Welke schaal geeft aan hoeveel kleiner een kaart is dan de werkelijkheid?", ["kaartschaal", "schaal"], "Ruimte", "Ik begrijp het doel van een kaartschaal.", "Je vindt dit vaak onderaan een kaart als verhouding."],
      ["Waarom is recycleren belangrijk?", ["minder afval", "grondstoffen besparen", "hergebruik van grondstoffen"], "Maatschappij", "Ik leg het belang van duurzaam omgaan met grondstoffen uit.", "Denk aan afval én het opnieuw gebruiken van materialen."],
      ["Welke laag van de aarde bestaat uit vast gesteente waarop wij leven?", ["aardkorst", "de aardkorst"], "Ruimte", "Ik herken de opbouw van de aarde in grote lijnen.", "Denk aan de buitenste laag van de aarde."],
      ["Welke organen nemen zuurstof op uit de lucht?", ["longen", "de longen"], "Mens", "Ik leg een basisfunctie van het ademhalingsstelsel uit.", "Ze bevinden zich in je borstkas."],
      ["Wat is een belangrijke taak van de gemeenteraad?", ["beslissingen nemen voor de gemeente", "gemeentelijke beslissingen nemen", "het bestuur van de gemeente controleren"], "Maatschappij", "Ik herken taken van het lokale bestuur.", "Denk aan regels en beslissingen voor de gemeente."],
      ["Waarom bevat een stroomkring een schakelaar?", ["om de stroomkring te openen en sluiten", "om de stroom aan en uit te zetten", "stroom aan en uit zetten"], "Techniek", "Ik begrijp de functie van onderdelen in een eenvoudige stroomkring.", "Met dit onderdeel onderbreek of herstel je de verbinding."],
      ["Welke denkbeeldige lijn loopt van de noordpool naar de zuidpool?", ["lengtegraad", "meridiaan", "een meridiaan"], "Ruimte", "Ik gebruik geografische referentielijnen.", "Deze lijn helpt om oostelijke en westelijke ligging te bepalen."],
      ["Wat is het verschil tussen weer en klimaat?", ["weer is tijdelijk en klimaat is gemiddeld over een lange periode", "weer is van korte duur klimaat van lange duur"], "Natuur", "Ik onderscheid weer van klimaat.", "Vergelijk wat vandaag gebeurt met patronen over vele jaren."],
    ],
    6: [
      ["Welke bestuursniveaus zijn er in België naast de gemeente?", ["provincie gewest gemeenschap federaal", "provinciaal gewestelijk gemeenschaps- en federaal niveau", "provincie gewest gemeenschap federale overheid"], "Maatschappij", "Ik herken verschillende bestuursniveaus in België.", "Denk van lokaal naar het niveau van heel België."],
      ["Wat betekent democratie?", ["het volk kiest vertegenwoordigers", "bestuur door het volk", "burgers kiezen hun vertegenwoordigers"], "Maatschappij", "Ik leg een basisprincipe van democratie uit.", "Denk aan verkiezingen en vertegenwoordiging."],
      ["Welke schaal hoort bij een kaart waarop 1 cm overeenkomt met 1 km?", ["1:100000", "1 op 100000"], "Ruimte", "Ik interpreteer een eenvoudige kaartschaal.", "Zet 1 kilometer eerst om naar centimeter."],
      ["Waarom ontstaan dag en nacht?", ["door de draaiing van de aarde om haar as", "de aarde draait om haar as", "aardrotatie"], "Ruimte", "Ik verklaar dag en nacht vanuit de aardrotatie.", "Denk aan de beweging van de aarde zelf, niet aan haar baan rond de zon."],
      ["Wat is het gevolg van een tekort aan biodiversiteit?", ["ecosystemen worden kwetsbaarder", "minder stabiele ecosystemen", "soorten verdwijnen"], "Natuur", "Ik leg het belang van biodiversiteit uit.", "Denk aan wat er gebeurt wanneer weinig soorten dezelfde taak kunnen overnemen."],
      ["Welke bloedvaten voeren bloed van het hart weg?", ["slagaders", "de slagaders"], "Mens", "Ik herken de functie van slagaders en aders.", "Het woord verwijst naar de slag van het hart."],
      ["Waarom gebruikt men isolatiemateriaal in een woning?", ["om warmteverlies te beperken", "om warmte binnen te houden", "minder energieverlies"], "Techniek", "Ik verklaar hoe isolatie energieverlies beperkt.", "Denk aan de overdracht van warmte door muren en dak."],
      ["Wat is een primaire bron in historisch onderzoek?", ["een bron uit de onderzochte tijd", "een oorspronkelijke bron uit die periode", "bron gemaakt in de tijd zelf"], "Tijd", "Ik onderscheid primaire en secundaire historische bronnen.", "Vraag je af of de bron tijdens de gebeurtenis is gemaakt."],
      ["Welke factor heeft rechtstreeks invloed op bevolkingsgroei?", ["geboorten sterfte en migratie", "geboortecijfer sterftecijfer migratie", "geboorte sterfte migratie"], "Maatschappij", "Ik herken factoren die bevolkingsgroei beïnvloeden.", "Denk aan wie erbij komt en wie wegvalt."],
      ["Waarom wordt afvalwater gezuiverd voordat het terug in een rivier komt?", ["om vervuilende stoffen te verwijderen", "om watervervuiling te voorkomen", "om het water schoner te maken"], "Natuur", "Ik leg het nut van waterzuivering uit.", "Denk aan de gevolgen voor planten, dieren en drinkwater."],
    ],
  };
  const woPool = shuffle(random, [...woByGrade[grade]]).slice(0, 8);
  woPool.forEach(([question, answer, skill, goalText, hint], index) => {
    add("Wereldoriëntatie", skill, `WO-${grade}-${String(index + 1).padStart(2, "0")}`, goalText, question, answer, hint);
  });

  // FRANS — 6 oefeningen vanaf het vijfde leerjaar
  if (grade >= 5) {
    const frenchPairs = [
      ["de school", "l'école"], ["een boek", "un livre"], ["de tafel", "la table"],
      ["goedendag", "bonjour"], ["tot ziens", "au revoir"], ["dank je", "merci"],
      ["alsjeblieft", "s'il vous plaît"], ["hoe gaat het?", "comment ça va ?"],
      ["ik heet", "je m'appelle"], ["maandag", "lundi"], ["een vriend", "un ami"],
      ["ik begrijp het niet", "je ne comprends pas"], ["waar is...?", "où est...?"],
      ["ik ben twaalf jaar", "j'ai douze ans"], ["de leerkracht", "le professeur"],
    ] as const;
    shuffle(random, [...frenchPairs]).slice(0, 6).forEach(([dutch, french], i) => {
      add(
        "Frans",
        i < 3 ? "Basiswoordenschat" : "Functionele taal",
        `FR-${grade}-${String(i + 1).padStart(2, "0")}`,
        "Ik begrijp en gebruik eenvoudige Franse woorden uit mijn leefwereld.",
        `Vertaal naar het Frans: ${dutch}`,
        french,
        i < 3 ? "Denk aan het juiste Franse lidwoord." : "Denk aan een vaste uitdrukking die je in een gesprek gebruikt."
      );
    });
  }

  return shuffle(random, exercises);
}
