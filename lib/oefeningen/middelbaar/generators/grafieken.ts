import { acceptedNumber, mc, type ExerciseInput, type Random } from "./shared";

export function generateGrafieken(level: number, _random: Random): ExerciseInput[] {
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
  return banks[level];
}
