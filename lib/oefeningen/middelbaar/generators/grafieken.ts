import { acceptedNumber, mc, randomInt, type ExerciseInput, type Random } from "./shared";

export function generateGrafieken(level: number, random: Random): ExerciseInput[] {
  const category = `Tabellen en grafieken · niveau ${level}`;
  const banks: Record<number, ExerciseInput[]> = {
    1: [
      { category, question: "Tabel: ma 14, di 21, wo 18, do 25. Hoogste dag?", answer: "donderdag" },
      { category, question: "Verschil tussen dinsdag en maandag?", answer: "7" },
      { category, question: "Gemiddelde van 14, 21, 18 en 25?", answer: acceptedNumber(19.5) },
      mc(category, "Beste grafiek voor ontwikkeling doorheen tijd?", ["lijngrafiek", "cirkeldiagram", "pictogram", "staafdiagram zonder tijd"], "lijngrafiek"),
      { category, question: "Welke waarde ontbreekt als gemiddelde van 12, 18, x en 26 gelijk is aan 20?", answer: "24" },
      mc(category, "Stijging van 20 naar 26 is…", ["20%", "25%", "30%", "35%"], "30%"),
    ],
    2: [
      { category, question: "Frequenties 4, 7, 9, 10. Totaal?", answer: "30" },
      { category, question: "Mediaan van 3, 5, 8, 11, 14?", answer: "8" },
      { category, question: "Modus van 2, 4, 4, 5, 7, 7, 7, 9?", answer: "7" },
      mc(category, "Beste grafiek voor delen van een geheel?", ["cirkeldiagram", "lijngrafiek", "spreidingsdiagram", "histogram"], "cirkeldiagram"),
      { category, question: "Bereik van 12, 18, 21, 30?", answer: "18" },
      { category, question: "Relatieve frequentie 8 op 40?", answer: acceptedNumber(20, "%") },
    ],
    3: [
      { category, question: "Gemiddelde 18 bij 5 waarden. Som?", answer: "90" },
      { category, question: "Waarden 10, 14, 18 en x hebben gemiddelde 16. x?", answer: "22" },
      { category, question: "Van 80 naar 104 en daarna 91. Totale procentuele verandering?", answer: acceptedNumber(13.75, "%") },
      mc(category, "Welke grafiek toont samenhang tussen twee variabelen?", ["spreidingsdiagram", "cirkeldiagram", "staafdiagram", "pictogram"], "spreidingsdiagram"),
      { category, question: "Mediaan van 4, 7, 9, 12, 14, 18?", answer: acceptedNumber(10.5) },
      { category, question: "Kwart van 240 waarnemingen?", answer: "60" },
    ],
    4: [
      { category, question: "Gewogen gemiddelde: 70% score 12 en 30% score 18.", answer: acceptedNumber(13.8) },
      { category, question: "Index stijgt van 125 naar 140. Procentuele stijging?", answer: acceptedNumber(12, "%") },
      { category, question: "Cumulatieve frequentie tot klasse 3 is 42 op 60. Percentage?", answer: acceptedNumber(70, "%") },
      mc(category, "Welke grafiek past bij continue klassen?", ["histogram", "cirkeldiagram", "lijngrafiek", "pictogram"], "histogram"),
      { category, question: "Gemiddelde 15, na toevoegen waarde 21 wordt gemiddelde 16. Hoeveel oorspronkelijke waarden?", answer: "5" },
      { category, question: "Bereik 42 en minimum 17. Maximum?", answer: "59" },
    ],
    5: [
      { category, question: "Gemiddelde van 8 waarden is 24. Eén waarde 32 wordt verwijderd. Nieuw gemiddelde?", answer: acceptedNumber(22.86) },
      { category, question: "Mediaan van 2,5,7,9,12,15,18,22?", answer: acceptedNumber(10.5) },
      { category, question: "Van 250 naar 205. Daling in procent?", answer: acceptedNumber(18, "%") },
      mc(category, "Een afgeknotte y-as kan…", ["verschillen groter doen lijken", "alle verschillen verwijderen", "het gemiddelde veranderen", "de steekproef vergroten"], "verschillen groter doen lijken"),
      { category, question: "Relatieve frequentie 27% bij totaal 400. Aantal?", answer: "108" },
      { category, question: "Som bij gemiddelde 18,5 en 12 waarden?", answer: "222" },
    ],
    6: [
      { category, question: "Gewogen score: 20% 14, 30% 16, 50% 11.", answer: acceptedNumber(13.1) },
      { category, question: "Exponentiële groei 100, 110, 121. Groeipercentage per stap?", answer: acceptedNumber(10, "%") },
      { category, question: "Interkwartielafstand bij Q1=18 en Q3=31?", answer: "13" },
      mc(category, "Welke maat is het minst gevoelig voor uitschieters?", ["mediaan", "gemiddelde", "som", "bereik"], "mediaan"),
      { category, question: "Z-scoreconcept: waarde gelijk aan gemiddelde heeft z-score?", answer: "0" },
      { category, question: "Van 320 naar 400 in 4 gelijke lineaire stappen. Toename per stap?", answer: "20" },
    ],
    7: [
      { category, question: "Gemiddelde 20, standaardafwijking 4. Waarde 28 heeft z-score?", answer: "2" },
      { category, question: "Lineaire trend van 15 naar 39 in 6 stappen. Toename per stap?", answer: "4" },
      { category, question: "Cumulatief percentage 65% bij 260 waarden. Aantal?", answer: "169" },
      mc(category, "Correlatie betekent…", ["samenhang, niet noodzakelijk oorzaak", "altijd oorzaak", "geen verband", "gelijke gemiddelden"], "samenhang, niet noodzakelijk oorzaak"),
      { category, question: "Gemiddelde 12 waarden is 18; met 13e waarde wordt 19. Nieuwe waarde?", answer: "31" },
      { category, question: "Index 2019=100, 2024=128. Stijging?", answer: acceptedNumber(28, "%") },
    ],
    8: [
      { category, question: "Gemiddelde van groep A 18 (20 lln), groep B 24 (30 lln). Totaalgemiddelde?", answer: acceptedNumber(21.6) },
      { category, question: "Waarde stijgt 8% en daalt 5%. Netto procent?", answer: acceptedNumber(2.6, "%") },
      { category, question: "Boxplot Q1=12, mediaan=18, Q3=27. IQR?", answer: "15" },
      mc(category, "Sterke negatieve correlatie ligt dicht bij…", ["-1", "0", "0,5", "1"], "-1"),
      { category, question: "Lineaire formule y=3x+5. y bij x=12?", answer: "41" },
      { category, question: "Bij y=3x+5, x als y=50?", answer: "15" },
    ],
    9: [
      { category, question: "Gewogen gemiddelde groepen: 15×18 en 25×22.", answer: acceptedNumber(20.5) },
      { category, question: "Exponentiële factor 1,04 over 5 perioden vanaf 200.", answer: acceptedNumber(243.33) },
      { category, question: "Z-score bij waarde 74, gemiddelde 62, sd 6?", answer: "2" },
      mc(category, "Welke grafiek kan causaliteit niet bewijzen?", ["spreidingsdiagram", "geen enkele grafiek", "lijngrafiek", "histogram"], "geen enkele grafiek"),
      { category, question: "Regressielijn y=1,5x+8. Voorspelling bij x=20?", answer: "38" },
      { category, question: "Residueel: gemeten 41, voorspeld 38.", answer: "3" },
    ],
    10: [
      { category, question: "Twee groepen: n=40 gem 16, n=60 gem 22. Totaalgemiddelde?", answer: "19.6" },
      { category, question: "Factor 0,97 gedurende 6 perioden vanaf 500.", answer: acceptedNumber(416.49) },
      { category, question: "Z-score -1,5, gemiddelde 70, sd 8. Waarde?", answer: "58" },
      mc(category, "Simpsonparadox betekent…", ["trend keert om na groepering", "gemiddelde is mediaan", "geen spreiding", "altijd causaliteit"], "trend keert om na groepering"),
      { category, question: "Regressie y=2,4x-7. x bij y=41?", answer: "20" },
      { category, question: "Voorspelling 52, werkelijk 47. Residueel?", answer: "-5" },
    ],
  };
  const extra = generateExtraGrafieken(level, category, random);
  return [...banks[level], ...extra];
}

function generateExtraGrafieken(
  level: number,
  category: string,
  random: Random
): ExerciseInput[] {
  const a = randomInt(random, 8 + level * 2, 20 + level * 5);
  const b = randomInt(random, a + 3, a + 15 + level * 2);
  const c = randomInt(random, Math.max(2, a - 5), b + 8);
  const d = randomInt(random, Math.max(2, c - 4), b + 12);
  const values = [a, b, c, d];
  const sum = values.reduce((total, value) => total + value, 0);
  const sorted = [...values].sort((x, y) => x - y);
  const average = sum / values.length;
  const median = (sorted[1] + sorted[2]) / 2;
  const range = sorted[3] - sorted[0];
  const increase = ((b - a) / a) * 100;
  const total = randomInt(random, 8, 20) * 10;
  const percentage = randomInt(random, 2, 8) * 5;
  const count = (total * percentage) / 100;

  const common: ExerciseInput[] = [
    {
      category,
      question: `Tabelwaarden: ${values.join(", ")}. Bereken het gemiddelde.`,
      answer: acceptedNumber(average),
    },
    {
      category,
      question: `Tabelwaarden: ${values.join(", ")}. Bereken de mediaan.`,
      answer: acceptedNumber(median),
    },
    {
      category,
      question: `Tabelwaarden: ${values.join(", ")}. Bereken het bereik.`,
      answer: String(range),
    },
    {
      category,
      question: `Een waarde stijgt van ${a} naar ${b}. Bereken de procentuele stijging.`,
      answer: acceptedNumber(increase, "%"),
    },
    {
      category,
      question: `${percentage}% van ${total} waarnemingen hoort bij categorie A. Hoeveel waarnemingen zijn dat?`,
      answer: acceptedNumber(count),
    },
    mc(
      category,
      "Welke grafiek gebruik je het best om categorieën met elkaar te vergelijken?",
      ["staafdiagram", "lijngrafiek", "spreidingsdiagram", "boxplot"],
      "staafdiagram"
    ),
  ];

  if (level <= 3) {
    const missing = randomInt(random, 10, 30);
    const targetAverage = randomInt(random, 12, 24);
    const threeSum = targetAverage * 4 - missing;
    const x1 = randomInt(random, 3, Math.max(3, threeSum - 6));
    const x2 = randomInt(random, 2, Math.max(2, threeSum - x1 - 2));
    const x3 = threeSum - x1 - x2;

    return [
      ...common,
      {
        category,
        question: `De waarden ${x1}, ${x2}, ${x3} en x hebben gemiddelde ${targetAverage}. Bereken x.`,
        answer: String(missing),
      },
      mc(category, "Welke grafiek toont een ontwikkeling doorheen de tijd het duidelijkst?", ["lijngrafiek", "cirkeldiagram", "pictogram", "boxplot"], "lijngrafiek"),
      mc(category, "Welke grafiek toont delen van één geheel het duidelijkst?", ["cirkeldiagram", "spreidingsdiagram", "histogram", "lijngrafiek"], "cirkeldiagram"),
      { category, question: `De frequenties zijn ${a}, ${b}, ${c} en ${d}. Bereken de totale frequentie.`, answer: String(sum) },
      { category, question: `In een tabel staan ${total} leerlingen. ${count} kiezen optie A. Bereken de relatieve frequentie in procent.`, answer: acceptedNumber(percentage, "%") },
      mc(category, "Welke maat is de waarde die het vaakst voorkomt?", ["modus", "mediaan", "gemiddelde", "bereik"], "modus"),
    ];
  }

  if (level <= 6) {
    const q1 = randomInt(random, 10, 25);
    const q3 = q1 + randomInt(random, 8, 20);
    const oldAverage = randomInt(random, 12, 24);
    const n = randomInt(random, 4, 10);
    const newValue = oldAverage + randomInt(random, 2, 8);
    const newAverage = (oldAverage * n + newValue) / (n + 1);

    return [
      ...common,
      { category, question: `Bij een boxplot is Q1 = ${q1} en Q3 = ${q3}. Bereken de interkwartielafstand.`, answer: String(q3 - q1) },
      { category, question: `Het gemiddelde van ${n} waarden is ${oldAverage}. Er wordt de waarde ${newValue} toegevoegd. Bereken het nieuwe gemiddelde.`, answer: acceptedNumber(newAverage) },
      mc(category, "Welke grafiek past bij continue gegevens die in klassen zijn verdeeld?", ["histogram", "cirkeldiagram", "pictogram", "staafdiagram met losse categorieën"], "histogram"),
      mc(category, "Welke centrummaat is het minst gevoelig voor een extreme uitschieter?", ["mediaan", "gemiddelde", "som", "bereik"], "mediaan"),
      mc(category, "Wat kan een afgeknotte verticale as veroorzaken?", ["verschillen lijken groter", "het gemiddelde verandert", "de gegevens verdwijnen", "de steekproef wordt groter"], "verschillen lijken groter"),
      { category, question: `Een index stijgt van 100 naar ${100 + percentage}. Hoeveel procent bedraagt de stijging?`, answer: acceptedNumber(percentage, "%") },
    ];
  }

  const mean = randomInt(random, 40, 80);
  const sd = randomInt(random, 3, 10);
  const z = randomInt(random, -2, 3);
  const observed = mean + z * sd;
  const slope = randomInt(random, 2, 6);
  const intercept = randomInt(random, -10, 15);
  const x = randomInt(random, 5, 20);
  const predicted = slope * x + intercept;
  const residual = randomInt(random, -6, 6);
  const actual = predicted + residual;
  const growth = randomInt(random, 2, 8);
  const start = randomInt(random, 10, 30) * 10;
  const periods = randomInt(random, 2, 5);
  const end = start * Math.pow(1 + growth / 100, periods);

  return [
    ...common,
    { category, question: `Gemiddelde ${mean}, standaardafwijking ${sd}. Welke z-score heeft de waarde ${observed}?`, answer: String(z) },
    { category, question: `Regressielijn y = ${slope}x ${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept)}. Bereken y voor x = ${x}.`, answer: String(predicted) },
    { category, question: `Een regressiemodel voorspelt ${predicted}, maar de gemeten waarde is ${actual}. Bereken het residu (gemeten - voorspeld).`, answer: String(residual) },
    { category, question: `Een waarde van ${start} groeit ${growth}% per periode gedurende ${periods} perioden. Bereken de eindwaarde.`, answer: acceptedNumber(end) },
    mc(category, "Wat betekent correlatie?", ["samenhang, niet automatisch oorzaak", "altijd een oorzakelijk verband", "geen enkel verband", "gelijke gemiddelden"], "samenhang, niet automatisch oorzaak"),
    mc(category, "Welke correlatiecoëfficiënt wijst op een sterke negatieve samenhang?", ["-0,92", "-0,08", "0,15", "0,88"], "-0,92"),
  ];
}
