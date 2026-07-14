export type FrenchExerciseCategory =
  | "woordenschat"
  | "grammatica"
  | "lezen"
  | "luisteren"
  | "schrijven"
  | "spreken"
  | "cultuur";

export type FrenchExerciseType =
  | "multiple-choice"
  | "text"
  | "open"
  | "listening";

export type FrenchExercise = {
  id: string;
  title: string;
  instruction: string;
  category: FrenchExerciseCategory;
  type: FrenchExerciseType;
  options?: string[];
  answer?: string | string[];
  explanation?: string;
  audioText?: string;
  example?: string;
  minimumWords?: number;
};

export type FrenchPreparationSection = {
  id: FrenchExerciseCategory;
  title: string;
  description: string;
};

export const frenchPreparationExercises: FrenchExercise[] = [
  {
    id: "vocab-1",
    title: "Begroeten",
    instruction: "Welke Franse begroeting gebruik je in de ochtend?",
    category: "woordenschat",
    type: "multiple-choice",
    options: ["Bonsoir", "Bonjour", "Bonne nuit", "Au revoir"],
    answer: "Bonjour",
    explanation:
      "Bonjour betekent goedendag en wordt ook in de ochtend gebruikt.",
  },
  {
    id: "vocab-2",
    title: "Jezelf voorstellen",
    instruction: "Vul aan: Je ... Emma.",
    category: "woordenschat",
    type: "text",
    answer: ["m'appelle", "m’appelle"],
    explanation: "Je m'appelle betekent: ik heet.",
  },
  {
    id: "vocab-3",
    title: "Leeftijd",
    instruction: "Hoe zeg je in het Frans: Ik ben elf jaar?",
    category: "woordenschat",
    type: "multiple-choice",
    options: [
      "Je suis onze ans.",
      "J'ai onze ans.",
      "Je vais onze ans.",
      "Je fais onze ans.",
    ],
    answer: "J'ai onze ans.",
    explanation: "Voor een leeftijd gebruikt het Frans het werkwoord avoir.",
  },
  {
    id: "vocab-4",
    title: "Schoolmateriaal",
    instruction: "Wat betekent une trousse?",
    category: "woordenschat",
    type: "multiple-choice",
    options: ["een boekentas", "een pennenzak", "een schrift", "een meetlat"],
    answer: "een pennenzak",
    explanation: "Une trousse is een pennenzak.",
  },
  {
    id: "vocab-5",
    title: "Dagen van de week",
    instruction: "Welke dag komt na mardi?",
    category: "woordenschat",
    type: "multiple-choice",
    options: ["lundi", "mercredi", "jeudi", "vendredi"],
    answer: "mercredi",
    explanation: "Mardi is dinsdag en mercredi is woensdag.",
  },
  {
    id: "vocab-6",
    title: "Getallen",
    instruction: "Schrijf het getal 14 in het Frans.",
    category: "woordenschat",
    type: "text",
    answer: "quatorze",
    explanation: "14 schrijf je als quatorze.",
  },
  {
    id: "gram-1",
    title: "Lidwoorden",
    instruction: "Kies het juiste lidwoord: ... école.",
    category: "grammatica",
    type: "multiple-choice",
    options: ["le", "la", "l'", "les"],
    answer: "l'",
    explanation: "École begint met een klinker. Daarom gebruik je l'.",
  },
  {
    id: "gram-2",
    title: "Meervoud",
    instruction: "Wat is het meervoud van un livre?",
    category: "grammatica",
    type: "multiple-choice",
    options: ["des livre", "les livres", "un livres", "de livres"],
    answer: "les livres",
    explanation:
      "Het bepaalde lidwoord wordt les en livre krijgt een meervouds-s.",
  },
  {
    id: "gram-3",
    title: "Être",
    instruction: "Vul aan: Nous ... à l'école.",
    category: "grammatica",
    type: "text",
    answer: "sommes",
    explanation: "Nous sommes betekent: wij zijn.",
  },
  {
    id: "gram-4",
    title: "Avoir",
    instruction: "Vul aan: Ils ... un chien.",
    category: "grammatica",
    type: "text",
    answer: "ont",
    explanation: "Ils ont betekent: zij hebben.",
  },
  {
    id: "gram-5",
    title: "Ontkenning",
    instruction: "Maak ontkennend: J'aime le chocolat.",
    category: "grammatica",
    type: "text",
    answer: [
      "je n'aime pas le chocolat",
      "je n’aime pas le chocolat",
      "je n'aime pas le chocolat.",
      "je n’aime pas le chocolat.",
    ],
    explanation: "De ontkenning staat rond het werkwoord: ne ... pas.",
  },
  {
    id: "gram-6",
    title: "Bijvoeglijk naamwoord",
    instruction: "Kies de juiste vorm: une ... fille.",
    category: "grammatica",
    type: "multiple-choice",
    options: ["petit", "petite", "petits", "petites"],
    answer: "petite",
    explanation: "Fille is vrouwelijk enkelvoud. Daarom gebruik je petite.",
  },
  {
    id: "read-1",
    title: "Lees: Camille",
    instruction:
      "Lees: « Je m'appelle Camille. J'ai onze ans. J'habite à Lille. J'aime le tennis et les crêpes. » Waar woont Camille?",
    category: "lezen",
    type: "multiple-choice",
    options: ["à Paris", "à Lille", "à Bruxelles", "à Liège"],
    answer: "à Lille",
    explanation: "In de tekst staat: J'habite à Lille.",
  },
  {
    id: "read-2",
    title: "Lees: de schooldag",
    instruction:
      "Lees: « Le lundi, Hugo a français à neuf heures. À dix heures, il a mathématiques. » Welk vak heeft Hugo om negen uur?",
    category: "lezen",
    type: "multiple-choice",
    options: ["wiskunde", "Frans", "geschiedenis", "sport"],
    answer: "Frans",
    explanation: "À neuf heures betekent om negen uur.",
  },
  {
    id: "read-3",
    title: "Lees: in de kantine",
    instruction:
      "Lees: « À midi, Zoé mange une soupe, du pain et une pomme. Elle boit de l'eau. » Wat drinkt Zoé?",
    category: "lezen",
    type: "text",
    answer: ["de l'eau", "de l’eau", "water"],
    explanation: "Elle boit de l'eau betekent: zij drinkt water.",
  },
  {
    id: "listen-1",
    title: "Luister: naam en leeftijd",
    instruction: "Klik op Luisteren en kies daarna het juiste antwoord.",
    category: "luisteren",
    type: "listening",
    audioText: "Bonjour, je m'appelle Louis et j'ai douze ans.",
    options: [
      "Hij heet Louis en is twaalf jaar.",
      "Hij heet Lucas en is elf jaar.",
      "Hij heet Louis en is tien jaar.",
      "Hij heet Hugo en is twaalf jaar.",
    ],
    answer: "Hij heet Louis en is twaalf jaar.",
    explanation: "Louis zegt dat hij twaalf jaar is.",
  },
  {
    id: "listen-2",
    title: "Luister: lievelingsvak",
    instruction: "Klik op Luisteren. Welk vak vindt Léa het leukst?",
    category: "luisteren",
    type: "listening",
    audioText:
      "J'aime le français, mais ma matière préférée est la musique.",
    options: ["Frans", "muziek", "wiskunde", "sport"],
    answer: "muziek",
    explanation: "Ma matière préférée betekent mijn lievelingsvak.",
  },
  {
    id: "listen-3",
    title: "Luister: tijdstip",
    instruction: "Klik op Luisteren. Hoe laat begint de les?",
    category: "luisteren",
    type: "listening",
    audioText: "Le cours commence à huit heures et demie.",
    options: ["8.00 uur", "8.15 uur", "8.30 uur", "9.30 uur"],
    answer: "8.30 uur",
    explanation: "Huit heures et demie betekent half negen.",
  },
  {
    id: "write-1",
    title: "Schrijf: jezelf voorstellen",
    instruction:
      "Schrijf minstens vijf Franse zinnen. Vermeld je naam, leeftijd, woonplaats, gezin en hobby.",
    category: "schrijven",
    type: "open",
    minimumWords: 20,
    example:
      "Je m'appelle Noor. J'ai onze ans. J'habite à Peer. J'ai un frère. J'aime danser.",
  },
  {
    id: "write-2",
    title: "Schrijf: mijn schooltas",
    instruction:
      "Schrijf minstens vier zinnen over wat er in je schooltas zit. Gebruik il y a en minstens vier schoolwoorden.",
    category: "schrijven",
    type: "open",
    minimumWords: 18,
    example:
      "Dans mon sac, il y a deux livres. Il y a une trousse, un cahier et une règle.",
  },
  {
    id: "speak-1",
    title: "Spreek: korte kennismaking",
    instruction:
      "Bereid een voorstelling van ongeveer 30 seconden voor. Schrijf je kernzinnen hieronder en vertel ze daarna hardop.",
    category: "spreken",
    type: "open",
    minimumWords: 12,
    example:
      "Bonjour! Je m'appelle Lina. J'ai onze ans. J'habite à Peer. J'aime le football et la musique.",
  },
  {
    id: "speak-2",
    title: "Spreek: in de klas",
    instruction:
      "Je begrijpt een opdracht niet. Schrijf een beleefde Franse vraag om herhaling en lees ze daarna hardop.",
    category: "spreken",
    type: "open",
    minimumWords: 5,
    example:
      "Pardon, madame. Vous pouvez répéter, s'il vous plaît? Merci!",
  },
  {
    id: "culture-1",
    title: "Frankrijk",
    instruction: "Wat is de hoofdstad van Frankrijk?",
    category: "cultuur",
    type: "multiple-choice",
    options: ["Lyon", "Marseille", "Paris", "Lille"],
    answer: "Paris",
    explanation: "Paris is de hoofdstad van Frankrijk.",
  },
  {
    id: "culture-2",
    title: "Franstalig België",
    instruction: "In welk Belgisch gewest wordt vooral Frans gesproken?",
    category: "cultuur",
    type: "multiple-choice",
    options: ["Vlaanderen", "Wallonië", "de Noordzee", "de Kempen"],
    answer: "Wallonië",
    explanation: "In Wallonië is Frans de belangrijkste taal.",
  },
  {
    id: "culture-3",
    title: "Franse eetgewoonten",
    instruction: "Welke lekkernij wordt vaak met Frankrijk verbonden?",
    category: "cultuur",
    type: "multiple-choice",
    options: ["croissant", "sushi", "taco", "fish and chips"],
    answer: "croissant",
    explanation: "De croissant wordt sterk met Frankrijk geassocieerd.",
  },
];

export const frenchPreparationSections: FrenchPreparationSection[] = [
  {
    id: "woordenschat",
    title: "Woordenschat",
    description: "Begroeten, jezelf voorstellen, school, dagen en getallen.",
  },
  {
    id: "grammatica",
    title: "Grammatica",
    description: "Lidwoorden, meervoud, être, avoir en ontkenning.",
  },
  {
    id: "lezen",
    title: "Lezen",
    description: "Korte teksten begrijpen en informatie terugvinden.",
  },
  {
    id: "luisteren",
    title: "Luisteren",
    description: "Korte Franse zinnen beluisteren en begrijpen.",
  },
  {
    id: "schrijven",
    title: "Schrijven",
    description: "Zelf korte en correcte Franse teksten maken.",
  },
  {
    id: "spreken",
    title: "Spreken",
    description: "Jezelf voorstellen en eenvoudige klassentaal gebruiken.",
  },
  {
    id: "cultuur",
    title: "Cultuur",
    description: "Kennismaken met Frankrijk, België en de Franstalige wereld.",
  },
];
