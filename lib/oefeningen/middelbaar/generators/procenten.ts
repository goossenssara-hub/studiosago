import { acceptedMoney, acceptedNumber, mc, type ExerciseInput, type Random } from "./shared";

export function generateProcenten(level: number, _random: Random): ExerciseInput[] {
  const category = `Procenten en verhoudingen · niveau ${level}`;
  const banks: Record<number, ExerciseInput[]> = {
    1: [
      { category, question: "Bereken 15% van 360.", answer: "54" },
      { category, question: "Een trui van €80 krijgt 25% korting. Nieuwe prijs?", answer: acceptedMoney(60) },
      { category, question: "Vereenvoudig de verhouding 18 : 30.", answer: "3 : 5" },
      { category, question: "Op schaal 1 : 50 000 is 6 cm hoeveel km?", answer: acceptedNumber(3, "km") },
      mc(category, "Welke verhouding is gelijk aan 4 : 6?", ["2 : 3", "3 : 4", "6 : 8", "8 : 10"], "2 : 3"),
      { category, question: "In een klas van 30 is 40% meisje. Hoeveel jongens?", answer: "18" },
    ],
    2: [
      { category, question: "Bereken 12,5% van 640.", answer: "80" },
      { category, question: "Een prijs stijgt van €120 naar €138. Hoeveel procent stijging?", answer: acceptedNumber(15, "%") },
      { category, question: "De verhouding rood : blauw is 5 : 7. Er zijn 25 rode. Hoeveel blauwe?", answer: "35" },
      { category, question: "Schaal 1 : 200. Een lengte is 8,5 cm op plan. Werkelijk in meter?", answer: acceptedNumber(17, "m") },
      mc(category, "Wat is 0,35 als percentage?", ["3,5%", "35%", "350%", "0,35%"], "35%"),
      { category, question: "Van 240 leerlingen is 15% afwezig. Hoeveel aanwezig?", answer: "204" },
    ],
    3: [
      { category, question: "Na 20% korting kost iets €96. Oorspronkelijke prijs?", answer: acceptedMoney(120) },
      { category, question: "Een prijs van €250 stijgt 8%. Nieuwe prijs?", answer: acceptedMoney(270) },
      { category, question: "Verhouding 3 : 4 : 5, totaal 96. Grootste deel?", answer: "40" },
      { category, question: "Schaal 1 : 25 000. 14 cm is hoeveel km?", answer: acceptedNumber(3.5, "km") },
      mc(category, "Welke factor hoort bij 18% stijging?", ["0,82", "1,18", "1,80", "0,18"], "1,18"),
      { category, question: "Een groep groeit van 80 naar 92. Procentuele groei?", answer: acceptedNumber(15, "%") },
    ],
    4: [
      { category, question: "€320 stijgt 12% en daalt daarna 10%. Eindprijs?", answer: acceptedMoney(322.56) },
      { category, question: "Na 15% korting kost een jas €170. Beginprijs?", answer: acceptedMoney(200) },
      { category, question: "Mengverhouding 2 : 5, totaal 21 liter. Kleinste deel?", answer: acceptedNumber(6, "liter") },
      { category, question: "Kaart 1 : 80 000, afstand 4,5 cm. Werkelijk?", answer: acceptedNumber(3.6, "km") },
      mc(category, "20% korting en daarna 20% stijging geeft…", ["dezelfde prijs", "4% lager", "4% hoger", "20% lager"], "4% lager"),
      { category, question: "Van 500 daalt een waarde met 18%. Nieuwe waarde?", answer: "410" },
    ],
    5: [
      { category, question: "€1 200 exclusief 21% btw. Inclusief btw?", answer: acceptedMoney(1452) },
      { category, question: "€968 inclusief 21% btw. Exclusief btw?", answer: acceptedMoney(800) },
      { category, question: "Verhouding jongens : meisjes = 7 : 9, totaal 64. Meisjes?", answer: "36" },
      { category, question: "Een model is 12 cm bij schaal 1 : 50. Werkelijk in meter?", answer: acceptedNumber(6, "m") },
      mc(category, "Welke factor hoort bij 7,5% korting?", ["0,925", "1,075", "0,75", "0,075"], "0,925"),
      { category, question: "Een bedrag groeit twee jaar telkens 5% vanaf €800.", answer: acceptedMoney(882) },
    ],
    6: [
      { category, question: "€2 400 + 21% btw, daarna 7,5% korting. Eindbedrag?", answer: acceptedMoney(2686.2) },
      { category, question: "Na 18% stijging en 15% daling is prijs €100,30. Beginprijs?", answer: acceptedMoney(100) },
      { category, question: "Verhouding 4 : 7, verschil 21. Totaal?", answer: "77" },
      { category, question: "Oppervlakte op schaal 1 : 100 is 18 cm². Werkelijk in m²?", answer: acceptedNumber(180, "m²") },
      mc(category, "Bij schaal 1 : 200 wordt oppervlakte vermenigvuldigd met…", ["200", "400", "20 000", "40 000"], "40 000"),
      { category, question: "Een waarde daalt 12% en stijgt daarna 12%. Netto verandering?", answer: acceptedNumber(-1.44, "%") },
    ],
    7: [
      { category, question: "Een investering stijgt 4% per jaar gedurende 3 jaar vanaf €5 000.", answer: acceptedMoney(5624.32) },
      { category, question: "Na 30% korting en 21% btw kost iets €423,50. Prijs vóór korting en btw?", answer: acceptedMoney(500) },
      { category, question: "Verhouding A:B = 3:5 en B:C = 10:7. A:C?", answer: "6 : 7" },
      { category, question: "Schaal 1 : 250, modeloppervlakte 12 cm². Werkelijk?", answer: acceptedNumber(750, "m²") },
      mc(category, "Welke groeifactor hoort bij drie keer 2% groei?", ["1,06", "1,061208", "1,02", "1,2"], "1,061208"),
      { category, question: "Van 240 naar 198: procentuele daling?", answer: acceptedNumber(17.5, "%") },
    ],
    8: [
      { category, question: "Een bevolking groeit 3,2% per jaar, 5 jaar vanaf 12 000.", answer: acceptedNumber(14046.85) },
      { category, question: "Prijs na 8% korting en 21% btw is €278,30. Exclusieve basisprijs?", answer: acceptedMoney(250) },
      { category, question: "A:B:C = 2:3:5, totaal 240. B?", answer: "72" },
      { category, question: "Schaal 1 : 500, volume model 8 cm³. Werkelijk in m³?", answer: acceptedNumber(1000, "m³") },
      mc(category, "Bij schaal 1 : 10 wordt volume vermenigvuldigd met…", ["10", "100", "1 000", "10 000"], "1 000"),
      { category, question: "Een aandeel stijgt 25% en daalt 20%. Netto verandering?", answer: acceptedNumber(0, "%") },
    ],
    9: [
      { category, question: "Samengestelde groei: €10 000, 6% per jaar, 4 jaar.", answer: acceptedMoney(12624.77) },
      { category, question: "Na 12% korting, 21% btw en €15 kosten betaal je €281,20. Basisprijs?", answer: acceptedMoney(250) },
      { category, question: "A:B = 4:7 en totaal stijgt met 22; verhouding blijft. Nieuwe A stijgt met?", answer: "8" },
      { category, question: "Schaal 1 : 1 250, 6,4 cm op plan. Werkelijk in meter?", answer: acceptedNumber(80, "m") },
      mc(category, "Welke formule geeft samengestelde groei?", ["begin × factor^tijd", "begin + procent × tijd", "begin ÷ factor", "begin - factor^tijd"], "begin × factor^tijd"),
      { category, question: "Een waarde wordt 18% kleiner. Welke factor?", answer: "0,82" },
    ],
    10: [
      { category, question: "€15 000 groeit 4,5% per jaar gedurende 6 jaar.", answer: acceptedMoney(19533.9) },
      { category, question: "Eindprijs €1 028,50 na 15% korting, 21% btw en €10 kosten. Basisprijs?", answer: acceptedMoney(990) },
      { category, question: "A:B:C = 3:4:8. C is 120 groter dan A. Totaal?", answer: "360" },
      { category, question: "Schaal 1 : 2 500, oppervlakte plan 7,2 cm². Werkelijk in m²?", answer: acceptedNumber(4500, "m²") },
      mc(category, "Welke verandering maakt €200 eerst 10% hoger en daarna 10% lager?", ["€200", "€198", "€202", "€180"], "€198"),
      { category, question: "Een waarde verdubbelt in 8 jaar. Gemiddelde jaarlijkse groeifactor?", answer: acceptedNumber(1.09051) },
    ],
  };
  return banks[level];
}
