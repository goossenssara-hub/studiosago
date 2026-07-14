import {
  acceptedMoney,
  acceptedNumber,
  mc,
  randomInt,
  type ExerciseInput,
  type Random,
} from "./shared";

const count = 9;

function mathCategory(label: string, level: number) {
  return `${label} · niveau ${level}`;
}

export function generateSupplementalExercises(
  skill: string,
  level: number,
  random: Random
): ExerciseInput[] {
  switch (skill) {
    case "wiskunde-hoofdrekenen":
      return [];

    case "wiskunde-vraagstukken": {
      const category = mathCategory("Vraagstukken begrijpen", level);
      return Array.from({ length: count }, (_, index) => {
        const amount = randomInt(random, 4 + level, 12 + level * 2);
        const price = Number((1.25 + level * 0.35 + index * 0.2).toFixed(2));
        return {
          category,
          question: `Een leerling koopt ${amount} artikelen van €${price.toFixed(2).replace(".", ",")}. Hoeveel betaalt de leerling in totaal?`,
          answer: acceptedMoney(amount * price),
        };
      });
    }

    case "wiskunde-breuken-kommagetallen": {
      const category = mathCategory("Breuken en kommagetallen", level);
      return Array.from({ length: count }, (_, index) => {
        const denominator = 4 + ((level + index) % 7);
        const numerator = 1 + ((index * 2 + level) % (denominator - 1));
        const multiplier = 2 + (index % 4);
        return {
          category,
          question: `Maak gelijkwaardig: ${numerator}/${denominator} = ?/${denominator * multiplier}`,
          answer: String(numerator * multiplier),
        };
      });
    }

    case "wiskunde-procenten-verhoudingen": {
      const category = mathCategory("Procenten en verhoudingen", level);
      const percentages = [5, 10, 12.5, 15, 20, 25, 30, 40, 50];
      return percentages.map((percentage, index) => {
        const total = 80 + level * 20 + index * 40;
        return {
          category,
          question: `Bereken ${String(percentage).replace(".", ",")}% van ${total}.`,
          answer: acceptedNumber((percentage / 100) * total),
        };
      });
    }

    case "wiskunde-meetkunde": {
      const category = mathCategory("Meetkunde", level);
      return Array.from({ length: count }, (_, index) => {
        const length = 6 + level + index;
        const width = 3 + level + (index % 5);
        return index % 2 === 0
          ? { category, question: `Rechthoek ${length} cm bij ${width} cm: oppervlakte?`, answer: acceptedNumber(length * width, "cm²") }
          : { category, question: `Rechthoek ${length} cm bij ${width} cm: omtrek?`, answer: acceptedNumber(2 * (length + width), "cm") };
      });
    }

    case "wiskunde-tabellen-grafieken": {
      const category = mathCategory("Tabellen en grafieken", level);
      return Array.from({ length: count }, (_, index) => {
        const a = 8 + level + index;
        const b = a + 4 + (index % 3);
        const c = b + 2 + level;
        return {
          category,
          question: `Gegevens: ${a}, ${b}, ${c}. Bereken het gemiddelde.`,
          answer: acceptedNumber((a + b + c) / 3),
        };
      });
    }

    case "nederlands-begrijpend-lezen": {
      const category = `Begrijpend lezen · niveau ${level}`;
      const topics = ["schoolregels", "gezondheid", "verkeer", "technologie", "milieu", "sport", "media", "leren", "samenwerking"];
      return topics.map((topic, index) => mc(
        category,
        `Een tekst over ${topic} noemt een voordeel én een voorwaarde. Welke conclusie past het best?`,
        [
          "De aanpak kan nuttig zijn wanneer aan de voorwaarde wordt voldaan.",
          "De aanpak werkt altijd en overal.",
          "De tekst heeft geen centrale boodschap.",
          `Alleen het ${index + 1}e detail is belangrijk.`,
        ],
        "De aanpak kan nuttig zijn wanneer aan de voorwaarde wordt voldaan."
      ));
    }

    case "nederlands-spelling": {
      const category = `Spelling · niveau ${level}`;
      const correct = [
        "Hij vindt het antwoord.", "Morgen wordt het bekendgemaakt.", "De leerling beantwoordt de vraag.",
        "Zij heeft de tekst verbeterd.", "De resultaten werden gecontroleerd.", "Word jij morgen verwacht?",
        "Het gebeurt niet vaak.", "Hij antwoordde onmiddellijk.", "De planning is gewijzigd.",
      ];
      return correct.map((sentence) => ({ category, question: `Schrijf foutloos over: ${sentence}`, answer: sentence }));
    }

    case "nederlands-woordenschat": {
      const category = `Woordenschat en schooltaal · niveau ${level}`;
      const pairs = [
        ["relevant", "belangrijk voor de vraag"], ["conclusie", "besluit na een redenering"],
        ["argument", "reden die een standpunt ondersteunt"], ["context", "omstandigheden rond informatie"],
        ["analyseren", "onderdelen en verbanden onderzoeken"], ["nuanceren", "minder absoluut formuleren"],
        ["criterium", "maatstaf voor beoordeling"], ["illustreren", "met een voorbeeld verduidelijken"],
        ["evalueren", "beoordelen en besluiten"],
      ] as const;
      return pairs.map(([word, meaning]) => mc(category, `Wat betekent “${word}”?`, [meaning, "het tegenovergestelde", "een leesteken", "een willekeurig detail"], meaning));
    }

    case "nederlands-taalbeschouwing": {
      const category = `Taalbeschouwing · niveau ${level}`;
      const questions: ExerciseInput[] = [
        mc(category, "Persoonsvorm in: ‘De leerlingen maken morgen een toets.’", ["maken", "leerlingen", "morgen", "toets"], "maken"),
        mc(category, "Onderwerp in: ‘De leraar legt de opdracht uit.’", ["de leraar", "de opdracht", "legt", "uit"], "de leraar"),
        mc(category, "Lijdend voorwerp in: ‘Sara leest het boek.’", ["het boek", "Sara", "leest", "geen"], "het boek"),
        mc(category, "Woordsoort van ‘snel’ in ‘Hij loopt snel’.", ["bijwoord", "zelfstandig naamwoord", "lidwoord", "voorzetsel"], "bijwoord"),
        mc(category, "Welke zin staat in de verleden tijd?", ["Hij maakte zijn taak.", "Hij maakt zijn taak.", "Hij zal zijn taak maken.", "Maak je taak."], "Hij maakte zijn taak."),
        mc(category, "Welke zin is een vraagzin?", ["Kom je morgen?", "Kom morgen.", "Hij komt morgen.", "Wat een dag!"], "Kom je morgen?"),
        mc(category, "Welke zin bevat een bijvoeglijk naamwoord?", ["De moeilijke oefening lukt.", "Hij loopt snel.", "Wij lezen.", "Kom binnen."], "De moeilijke oefening lukt."),
        mc(category, "Wat is het meervoud van ‘analyse’?", ["analyses", "analysen", "analyse's", "analysissen"], "analyses"),
        mc(category, "Welke zin bevat een voegwoord?", ["Ik blijf binnen omdat het regent.", "De regen valt.", "Binnen is het warm.", "Morgen schijnt de zon."], "Ik blijf binnen omdat het regent."),
      ];
      return questions;
    }

    case "nederlands-samenvatten": {
      const category = `Samenvatten en structureren · niveau ${level}`;
      return Array.from({ length: count }, (_, index) => mc(
        category,
        `Welke informatie hoort niet in een korte samenvatting ${index + 1}?`,
        ["een onbelangrijk detail", "de hoofdgedachte", "de belangrijkste oorzaak", "de centrale conclusie"],
        "een onbelangrijk detail"
      ));
    }

    case "nederlands-opdrachten": {
      const category = `Opdrachten begrijpen · niveau ${level}`;
      const verbs = ["noem", "beschrijf", "verklaar", "vergelijk", "motiveer", "analyseer", "beoordeel", "bereken", "illustreer", "concludeer"];
      return verbs.slice(0, count).map((verb) => mc(
        category,
        `Wat moet je zeker doen bij het instructiewoord “${verb}”?`,
        ["gericht uitvoeren wat het werkwoord vraagt", "de vraag overschrijven", "willekeurig antwoorden", "alle gegevens negeren"],
        "gericht uitvoeren wat het werkwoord vraagt"
      ));
    }

    case "leren-leren-plannen": {
      const category = `Plannen en studeren · niveau ${level}`;
      const prompts = [
        "Je hebt morgen een toets.", "Je moet vier hoofdstukken leren.", "Je maakt vaak dezelfde fout.",
        "Je planning loopt uit.", "Je onthoudt weinig na herlezen.", "Je hebt meerdere deadlines.",
        "Je kunt leerstof niet toepassen.", "Je bent snel afgeleid.", "Je wilt controleren of je iets kent.",
      ];
      return prompts.map((prompt) => mc(
        category,
        `${prompt} Welke aanpak helpt het best?`,
        ["een concrete kleine stap plannen en jezelf actief testen", "alles uitstellen", "alleen markeren", "zonder doel beginnen"],
        "een concrete kleine stap plannen en jezelf actief testen"
      ));
    }

    default:
      return [];
  }
}
