import {
  acceptedMoney,
  acceptedNumber,
  mc,
  randomInt,
  shuffle,
  type ExerciseInput,
  type Random,
} from "./shared";

const round2 = (value: number) => Number(value.toFixed(2));
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

function ratioAnswer(a: number, b: number) {
  const divisor = gcd(a, b);
  return `${a / divisor} : ${b / divisor}`;
}

export function generateProcenten(level: number, random: Random): ExerciseInput[] {
  const category = `Procenten en verhoudingen · niveau ${level}`;
  const exercises: ExerciseInput[] = [];
  const add = (question: string, answer: string | string[]) =>
    exercises.push({ category, question, answer });

  if (level === 1) {
    const base = randomInt(random, 8, 30) * 20;
    const percent = [5, 10, 20, 25, 50][randomInt(random, 0, 4)];
    const price = randomInt(random, 4, 15) * 10;
    const discount = [10, 20, 25, 50][randomInt(random, 0, 3)];
    const girls = randomInt(random, 8, 16);
    const boys = randomInt(random, 8, 16);
    const a = randomInt(random, 2, 8) * 3;
    const b = randomInt(random, 2, 8) * 3;

    add(`Bereken ${percent}% van ${base}.`, acceptedNumber((percent / 100) * base));
    add(`Een artikel kost €${price} en krijgt ${discount}% korting. Wat is de nieuwe prijs?`, acceptedMoney(price * (1 - discount / 100)));
    add(`In een klas zitten ${girls + boys} leerlingen. ${girls} zijn meisjes. Welk percentage is meisje?`, acceptedNumber((girls / (girls + boys)) * 100, "%"));
    add(`Vereenvoudig de verhouding ${a} : ${b}.`, ratioAnswer(a, b));
    add("Schrijf 0,35 als percentage.", ["35%", "35 %"]);
    add("Schrijf 45% als kommagetal.", ["0,45", "0.45"]);
    add("Bereken 50% van 86.", "43");
    add("Bereken 25% van 240.", "60");
    add("Bereken 10% van 370.", "37");
    add("Een klas telt 30 leerlingen. 40% zijn meisjes. Hoeveel jongens zijn er?", "18");
    add("Op schaal 1 : 50 000 stelt 6 cm hoeveel kilometer voor?", acceptedNumber(3, "km"));
    add("De verhouding rood : blauw is 4 : 6. Vereenvoudig.", "2 : 3");
    exercises.push(mc(category, "Welke verhouding is gelijk aan 3 : 5?", ["6 : 10", "6 : 8", "9 : 12", "12 : 15"], "6 : 10"));
    exercises.push(mc(category, "Welk percentage is gelijk aan een kwart?", ["20%", "25%", "40%", "50%"], "25%"));
    exercises.push(mc(category, "Wat is groter?", ["60%", "0,55", "1/2", "45%"], "60%"));
    add("Van 80 leerlingen nemen er 20 deel. Welk percentage neemt deel?", acceptedNumber(25, "%"));
    add("Een bedrag van €120 stijgt met 10%. Wat is het nieuwe bedrag?", acceptedMoney(132));
    add("Verdeel 72 in de verhouding 1 : 3. Wat is het grootste deel?", "54");
  } else if (level === 2) {
    const original = randomInt(random, 8, 30) * 20;
    const increase = [5, 10, 12.5, 15, 20][randomInt(random, 0, 4)];
    const red = randomInt(random, 3, 8);
    const blue = randomInt(random, 4, 10);

    add(`Bereken 12,5% van ${original}.`, acceptedNumber(original / 8));
    add(`Een prijs van €${original} stijgt met ${increase}%. Wat is de nieuwe prijs?`, acceptedMoney(original * (1 + increase / 100)));
    add(`De verhouding rood : blauw is ${red} : ${blue}. Er zijn ${red * 6} rode voorwerpen. Hoeveel blauwe zijn er?`, String(blue * 6));
    add("Van 240 leerlingen is 15% afwezig. Hoeveel zijn aanwezig?", "204");
    add("Een prijs stijgt van €120 naar €138. Hoeveel procent stijging is dat?", acceptedNumber(15, "%"));
    add("Schaal 1 : 200. Een lengte is 8,5 cm op plan. Hoeveel meter is dat werkelijk?", acceptedNumber(17, "m"));
    add("Schrijf 3/5 als percentage.", ["60%", "60 %"]);
    add("Schrijf 72% als breuk in eenvoudigste vorm.", "18/25");
    add("Bereken 35% van 260.", "91");
    add("Een jas van €160 krijgt 15% korting. Wat betaal je?", acceptedMoney(136));
    add("Verdeel 132 in de verhouding 5 : 6. Wat is het kleinste deel?", "60");
    add("Een recept gebruikt bloem en suiker in verhouding 4 : 1. Er is 600 g bloem. Hoeveel suiker?", acceptedNumber(150, "g"));
    add("Van 320 stemmen zijn er 208 vóór. Welk percentage is vóór?", acceptedNumber(65, "%"));
    exercises.push(mc(category, "Welke factor hoort bij 8% stijging?", ["0,92", "1,08", "1,8", "0,08"], "1,08"));
    exercises.push(mc(category, "Wat is 0,375 als percentage?", ["3,75%", "37,5%", "375%", "0,375%"], "37,5%"));
    add("Een afstand is op schaal 1 : 25 000 gelijk aan 12 cm. Hoeveel kilometer werkelijk?", acceptedNumber(3, "km"));
    add("Een hoeveelheid daalt van 500 naar 425. Hoeveel procent daling?", acceptedNumber(15, "%"));
    add("Verhouding 7 : 9, totaal 64. Hoe groot is het tweede deel?", "36");
  } else if (level === 3) {
    const finalPrice = randomInt(random, 8, 20) * 12;
    const startPrice = finalPrice / 0.8;
    add(`Na 20% korting kost een artikel €${finalPrice}. Wat was de oorspronkelijke prijs?`, acceptedMoney(startPrice));
    add("Een prijs van €250 stijgt met 8%. Wat is de nieuwe prijs?", acceptedMoney(270));
    add("Verhouding 3 : 4 : 5, totaal 96. Wat is het grootste deel?", "40");
    add("Schaal 1 : 25 000. 14 cm stelt hoeveel kilometer voor?", acceptedNumber(3.5, "km"));
    add("Een groep groeit van 80 naar 92. Bereken de procentuele groei.", acceptedNumber(15, "%"));
    add("Een fiets kost na 30% korting €490. Wat was de oorspronkelijke prijs?", acceptedMoney(700));
    add("Een bedrag van €480 wordt met 12,5% verhoogd. Wat is het nieuwe bedrag?", acceptedMoney(540));
    add("Van 360 leerlingen slaagt 82,5%. Hoeveel leerlingen slagen?", "297");
    add("Verdeel 180 in de verhouding 2 : 3 : 5. Wat is het middelste deel?", "54");
    add("Een kaart heeft schaal 1 : 80 000. Een afstand van 7,5 cm is werkelijk hoeveel kilometer?", acceptedNumber(6, "km"));
    add("Een hoeveelheid daalt van 640 naar 544. Hoeveel procent daling?", acceptedNumber(15, "%"));
    add("Een prijs stijgt met 20% en bedraagt daarna €216. Wat was de beginprijs?", acceptedMoney(180));
    add("Een mengsel bevat water en siroop in verhouding 7 : 3. Er is 4,5 liter siroop. Hoeveel liter mengsel?", acceptedNumber(15, "liter"));
    exercises.push(mc(category, "Welke factor hoort bij 18% stijging?", ["0,82", "1,18", "1,80", "0,18"], "1,18"));
    exercises.push(mc(category, "Welke factor hoort bij 35% korting?", ["0,35", "0,65", "1,35", "1,65"], "0,65"));
    add("Een prijs gaat van €75 naar €90. Hoeveel procent stijging?", acceptedNumber(20, "%"));
    add("Een schaalmodel is 18 cm lang op schaal 1 : 40. Hoeveel meter werkelijk?", acceptedNumber(7.2, "m"));
    add("40% van een getal is 72. Welk getal?", "180");
  } else if (level === 4) {
    add("€320 stijgt 12% en daalt daarna 10%. Wat is de eindprijs?", acceptedMoney(322.56));
    add("Na 15% korting kost een jas €170. Wat was de beginprijs?", acceptedMoney(200));
    add("Mengverhouding 2 : 5, totaal 21 liter. Hoe groot is het kleinste deel?", acceptedNumber(6, "liter"));
    add("Kaart 1 : 80 000, afstand 4,5 cm. Hoeveel kilometer werkelijk?", acceptedNumber(3.6, "km"));
    add("Van 500 daalt een waarde met 18%. Wat is de nieuwe waarde?", "410");
    add("Een bedrag stijgt eerst 25% en daalt daarna 20%. Startbedrag €400. Eindbedrag?", acceptedMoney(400));
    add("Een laptop van €750 krijgt 12% korting en daarna €15 verzendkosten. Eindprijs?", acceptedMoney(675));
    add("Een prijs daalt van €280 naar €238. Hoeveel procent daling?", acceptedNumber(15, "%"));
    add("Verhouding 4 : 7. Het verschil tussen beide delen is 27. Wat is het totaal?", "99");
    add("Een tekening op schaal 1 : 150 toont 9 cm. Hoeveel meter werkelijk?", acceptedNumber(13.5, "m"));
    add("Een school telt 480 leerlingen. Het aantal groeit met 7,5%. Hoeveel leerlingen daarna?", "516");
    add("Na een stijging van 30% bedraagt een bedrag €390. Wat was het eerst?", acceptedMoney(300));
    add("Een product kost €242 inclusief 21% btw. Wat is de prijs exclusief btw?", acceptedMoney(200));
    exercises.push(mc(category, "20% korting en daarna 20% stijging geeft…", ["dezelfde prijs", "4% lager", "4% hoger", "20% lager"], "4% lager"));
    exercises.push(mc(category, "Welke factor hoort bij eerst 10% stijging en dan 10% daling?", ["1", "0,99", "1,01", "0,90"], "0,99"));
    add("Verdeel 252 in de verhouding 2 : 5 : 7. Wat is het grootste deel?", "126");
    add("Een oppervlakte van 18 cm² op schaal 1 : 20 komt overeen met hoeveel cm² werkelijk?", acceptedNumber(7200, "cm²"));
    add("Een bedrag daalt tweemaal met 10%, vanaf €500. Eindbedrag?", acceptedMoney(405));
  } else if (level === 5) {
    add("€1 200 exclusief 21% btw. Wat is de prijs inclusief btw?", acceptedMoney(1452));
    add("€968 inclusief 21% btw. Wat is de prijs exclusief btw?", acceptedMoney(800));
    add("Verhouding jongens : meisjes = 7 : 9, totaal 64. Hoeveel meisjes?", "36");
    add("Een model is 12 cm lang op schaal 1 : 50. Hoeveel meter werkelijk?", acceptedNumber(6, "m"));
    add("Een bedrag groeit twee jaar telkens 5%, vanaf €800. Eindbedrag?", acceptedMoney(882));
    add("Een artikel van €480 krijgt 15% korting en daarna 21% btw. Eindprijs?", acceptedMoney(493.68));
    add("Een bedrag is inclusief 6% btw €318. Wat is het exclusieve bedrag?", acceptedMoney(300));
    add("Na 25% korting en €12 kosten betaal je €237. Wat was de oorspronkelijke prijs?", acceptedMoney(300));
    add("Verhouding A : B = 5 : 8. A is 45. Hoe groot is B?", "72");
    add("Een kaart op schaal 1 : 125 000 toont 6,4 cm. Hoeveel kilometer werkelijk?", acceptedNumber(8, "km"));
    add("Een prijs stijgt drie jaar telkens 4%, vanaf €1 000. Eindprijs?", acceptedMoney(1124.86));
    add("Een waarde daalt 8% en stijgt daarna 15%, vanaf 600. Eindwaarde?", acceptedNumber(634.8));
    add("Een mengsel is verdeeld in verhouding 3 : 5 : 7 en bevat 180 liter. Hoe groot is het tweede deel?", acceptedNumber(60, "liter"));
    exercises.push(mc(category, "Welke factor hoort bij 7,5% korting?", ["0,925", "1,075", "0,75", "0,075"], "0,925"));
    exercises.push(mc(category, "Welke berekening haalt 21% btw uit een inclusief bedrag?", ["delen door 1,21", "vermenigvuldigen met 0,79", "delen door 0,21", "21 aftrekken"], "delen door 1,21"));
    add("Een schaalfactor is 4. Met welke factor verandert de oppervlakte?", "16");
    add("Een bedrag stijgt van €640 naar €736. Hoeveel procent stijging?", acceptedNumber(15, "%"));
    add("Een product kost exclusief btw €350. Met 6% btw en €9 kosten: eindprijs?", acceptedMoney(380));
  } else if (level === 6) {
    add("€2 400 + 21% btw, daarna 7,5% korting. Wat is het eindbedrag?", acceptedMoney(2686.2));
    add("Na 18% stijging en 15% daling is de prijs €100,30. Wat was de beginprijs?", acceptedMoney(100));
    add("Verhouding 4 : 7, verschil 21. Wat is het totaal?", "77");
    add("Oppervlakte op schaal 1 : 100 is 18 cm². Hoeveel m² werkelijk?", acceptedNumber(180, "m²"));
    add("Een waarde daalt 12% en stijgt daarna 12%. Wat is de netto verandering?", acceptedNumber(-1.44, "%"));
    add("Een product van €850 krijgt 18% korting, daarna 21% btw en €20 kosten. Eindprijs?", acceptedMoney(863.07));
    add("Na 8% stijging en 10% korting kost iets €486. Wat was de beginprijs?", acceptedMoney(500));
    add("A : B = 3 : 8. B is 55 groter dan A. Wat is A?", "33");
    add("Een lengte is op schaal 1 : 250 gelijk aan 7,2 cm. Hoeveel meter werkelijk?", acceptedNumber(18, "m"));
    add("Een vierkant wordt vergroot met schaalfactor 2,5. De oude oppervlakte is 32 cm². Nieuwe oppervlakte?", acceptedNumber(200, "cm²"));
    add("Een bedrag groeit 6 jaar met 3% per jaar vanaf €4 000. Eindbedrag?", acceptedMoney(4776.21));
    add("Een waarde daalt drie keer met 5%, vanaf 1 000. Eindwaarde?", acceptedNumber(857.38));
    add("Een prijs inclusief 21% btw en na 20% korting is €387,20. Wat was de prijs vóór korting en btw?", acceptedMoney(400));
    exercises.push(mc(category, "Bij schaal 1 : 200 wordt oppervlakte vermenigvuldigd met…", ["200", "400", "20 000", "40 000"], "40 000"));
    exercises.push(mc(category, "Welke factor hoort bij 12% daling gevolgd door 12% stijging?", ["1", "0,9856", "1,0144", "0,88"], "0,9856"));
    add("Verhouding A:B:C = 2:3:6. C is 84. Wat is het totaal?", "154");
    add("Een schaalmodel heeft volume 24 cm³ op schaal 1 : 10. Hoeveel liter werkelijk?", acceptedNumber(24, "liter"));
    add("Een bedrag groeit van €2 500 naar €2 916 in twee jaar. Welke totale procentuele groei?", acceptedNumber(16.64, "%"));
  } else if (level === 7) {
    add("Een investering stijgt 4% per jaar gedurende 3 jaar vanaf €5 000. Eindwaarde?", acceptedMoney(5624.32));
    add("Na 30% korting en 21% btw kost iets €423,50. Prijs vóór korting en btw?", acceptedMoney(500));
    add("Verhouding A:B = 3:5 en B:C = 10:7. Wat is A:C?", "6 : 7");
    add("Schaal 1 : 250, modeloppervlakte 12 cm². Hoeveel m² werkelijk?", acceptedNumber(750, "m²"));
    add("Van 240 naar 198: bereken de procentuele daling.", acceptedNumber(17.5, "%"));
    add("Een kapitaal van €8 000 groeit 2,5% per jaar gedurende 6 jaar. Eindwaarde?", acceptedMoney(9277.55));
    add("Een prijs inclusief 21% btw bedraagt na 15% korting €617,10. Wat was de exclusieve basisprijs?", acceptedMoney(600));
    add("A:B:C = 4:6:9. Het totaal is 285. Hoe groot is C?", "135");
    add("Een planoppervlakte is 7,5 cm² op schaal 1 : 400. Hoeveel m² werkelijk?", acceptedNumber(1200, "m²"));
    add("Een waarde stijgt 25%, daalt 12% en stijgt 4%. Startwaarde 500. Eindwaarde?", acceptedNumber(572));
    add("Een investering groeit van €12 000 naar €14 580 in 3 jaar. Totale procentuele groei?", acceptedNumber(21.5, "%"));
    add("Na 10% korting, 21% btw en €25 kosten betaal je €678,40. Basisprijs exclusief btw?", acceptedMoney(600));
    add("Een kubusmodel op schaal 1 : 20 heeft volume 15 cm³. Hoeveel liter werkelijk?", acceptedNumber(120, "liter"));
    exercises.push(mc(category, "Welke groeifactor hoort bij drie keer 2% groei?", ["1,06", "1,061208", "1,02", "1,2"], "1,061208"));
    exercises.push(mc(category, "Correspondeert 30% stijging gevolgd door 30% daling met…", ["0%", "9% daling", "9% stijging", "30% daling"], "9% daling"));
    add("De verhouding winst:kost is 3:20. Bij €1 600 kost, hoeveel winst?", acceptedMoney(240));
    add("Een bevolking van 18 000 daalt jaarlijks 1,5% gedurende 4 jaar. Eindbevolking?", acceptedNumber(16944.01));
    add("Een bedrag wordt eerst met 8% verhoogd en daarna met welk percentage verlaagd om terug op het beginbedrag te komen?", acceptedNumber(7.41, "%"));
  } else if (level === 8) {
    add("Een bevolking groeit 3,2% per jaar, 5 jaar vanaf 12 000. Eindwaarde?", acceptedNumber(14046.85));
    add("Prijs na 8% korting en 21% btw is €278,30. Exclusieve basisprijs?", acceptedMoney(250));
    add("A:B:C = 2:3:5, totaal 240. Hoe groot is B?", "72");
    add("Schaal 1 : 500, volume model 8 cm³. Hoeveel m³ werkelijk?", acceptedNumber(1000, "m³"));
    add("Een aandeel stijgt 25% en daalt 20%. Netto verandering?", acceptedNumber(0, "%"));
    add("Een kapitaal van €15 000 groeit 4,2% per jaar gedurende 7 jaar. Eindkapitaal?", acceptedMoney(20001.77));
    add("Na 12% korting, 21% btw en €18 kosten betaal je €550,40. Exclusieve basisprijs?", acceptedMoney(500));
    add("A:B = 7:11 en B:C = 22:15. Wat is A:C?", "14 : 15");
    add("Een oppervlak van 4,8 cm² op schaal 1 : 750 komt overeen met hoeveel m²?", acceptedNumber(2700, "m²"));
    add("Een volume van 12 cm³ op schaal 1 : 50 komt overeen met hoeveel m³?", acceptedNumber(1.5, "m³"));
    add("Een waarde stijgt jaarlijks 6% gedurende 5 jaar en daalt daarna 10%. Start 2 000. Eindwaarde?", acceptedNumber(2408.2));
    add("Een prijs daalt eerst 18% en stijgt daarna 25%. Netto procentuele verandering?", acceptedNumber(2.5, "%"));
    add("Een investering verdubbelt in 10 jaar. Wat is de gemiddelde jaarlijkse groeifactor?", acceptedNumber(1.07177));
    exercises.push(mc(category, "Bij schaal 1 : 10 wordt volume vermenigvuldigd met…", ["10", "100", "1 000", "10 000"], "1 000"));
    exercises.push(mc(category, "Welke formule berekent de beginwaarde bij samengestelde groei?", ["eindwaarde ÷ factor^tijd", "eindwaarde × factor", "eindwaarde - procent", "eindwaarde ÷ tijd"], "eindwaarde ÷ factor^tijd"));
    add("Een bedrag groeit van €9 500 naar €12 136,55 in 5 jaar. Welke jaarlijkse groeifactor?", acceptedNumber(1.051));
    add("Na 21% btw en 5% korting betaal je €1 149,50. Wat is de exclusieve basisprijs?", acceptedMoney(1000));
    add("A:B:C = 4:7:9. C is 100 groter dan A. Wat is het totaal?", "400");
  } else if (level === 9) {
    add("Samengestelde groei: €10 000, 6% per jaar, 4 jaar. Eindbedrag?", acceptedMoney(12624.77));
    add("Na 12% korting, 21% btw en €15 kosten betaal je €281,20. Basisprijs?", acceptedMoney(250));
    add("A:B = 4:7 en het totaal stijgt met 22 terwijl de verhouding gelijk blijft. Met hoeveel stijgt A?", "8");
    add("Schaal 1 : 1 250, 6,4 cm op plan. Hoeveel meter werkelijk?", acceptedNumber(80, "m"));
    add("Een waarde wordt 18% kleiner. Welke vermenigvuldigingsfactor hoort daarbij?", "0,82");
    add("Een kapitaal van €25 000 groeit 4,8% per jaar gedurende 8 jaar. Eindwaarde?", acceptedMoney(36370.67));
    add("Na 18% korting, 21% btw en €32 kosten betaal je €1 024,20. Basisprijs exclusief btw?", acceptedMoney(1000));
    add("A:B:C = 5:8:12. B is 90 groter dan A. Wat is het totaal?", "750");
    add("Een planoppervlakte van 9,6 cm² op schaal 1 : 2 500 stelt hoeveel hectare voor?", acceptedNumber(6, "ha"));
    add("Een modelvolume van 3,2 cm³ op schaal 1 : 200 stelt hoeveel m³ voor?", acceptedNumber(25.6, "m³"));
    add("Een bevolking groeit 2,8% per jaar gedurende 12 jaar vanaf 48 000. Eindbevolking?", acceptedNumber(66862.58));
    add("Een waarde stijgt 30%, daalt 15% en stijgt 8%. Netto procentuele verandering?", acceptedNumber(19.34, "%"));
    add("Een investering groeit in 6 jaar van €18 000 naar €24 120. Bereken de gemiddelde jaarlijkse groeifactor.", acceptedNumber(1.05007));
    exercises.push(mc(category, "Welke formule geeft samengestelde groei?", ["begin × factor^tijd", "begin + procent × tijd", "begin ÷ factor", "begin - factor^tijd"], "begin × factor^tijd"));
    exercises.push(mc(category, "Wat gebeurt bij een oppervlakte op schaal 1 : n?", ["vermenigvuldigen met n²", "vermenigvuldigen met n", "delen door n²", "vermenigvuldigen met n³"], "vermenigvuldigen met n²"));
    add("Een prijs moet na 12% stijging terug naar de beginprijs. Met hoeveel procent moet de verhoogde prijs dalen?", acceptedNumber(10.71, "%"));
    add("Een bedrag na 5 jaar bij 3,5% groei is €11 876,86. Wat was de beginwaarde?", acceptedMoney(10000));
    add("Een index stijgt van 132 naar 158,4. Hoeveel procent stijging?", acceptedNumber(20, "%"));
  } else {
    add("€15 000 groeit 4,5% per jaar gedurende 6 jaar. Eindbedrag?", acceptedMoney(19533.9));
    add("Eindprijs €1 028,50 na 15% korting, 21% btw en €10 kosten. Basisprijs?", acceptedMoney(990));
    add("A:B:C = 3:4:8. C is 120 groter dan A. Wat is het totaal?", "360");
    add("Schaal 1 : 2 500, oppervlakte plan 7,2 cm². Hoeveel m² werkelijk?", acceptedNumber(4500, "m²"));
    add("Een waarde verdubbelt in 8 jaar. Wat is de gemiddelde jaarlijkse groeifactor?", acceptedNumber(1.09051));
    add("Een kapitaal van €42 000 groeit 5,25% per jaar gedurende 10 jaar. Eindwaarde?", acceptedMoney(70073.3));
    add("Na 22% korting, 21% btw en €45 kosten betaal je €988,80. Exclusieve basisprijs?", acceptedMoney(1000));
    add("A:B = 5:9 en B:C = 6:11. C is 275. Wat is A?", "83,33");
    add("Een oppervlakte van 5,4 cm² op schaal 1 : 4 000 stelt hoeveel hectare voor?", acceptedNumber(8.64, "ha"));
    add("Een modelvolume van 2,5 cm³ op schaal 1 : 500 stelt hoeveel m³ voor?", acceptedNumber(312.5, "m³"));
    add("Een bevolking daalt 1,8% per jaar gedurende 15 jaar vanaf 120 000. Eindbevolking?", acceptedNumber(91337.05));
    add("Een waarde stijgt 18%, daalt 7%, stijgt 12% en daalt 5%. Netto procentuele verandering?", acceptedNumber(16.75, "%"));
    add("Een investering groeit in 9 jaar van €30 000 naar €45 000. Bereken de gemiddelde jaarlijkse groeifactor.", acceptedNumber(1.04608));
    exercises.push(mc(category, "Welke verandering maakt €200 eerst 10% hoger en daarna 10% lager?", ["€200", "€198", "€202", "€180"], "€198"));
    exercises.push(mc(category, "Welke schaalbewerking hoort bij volume?", ["lineaire factor tot de derde macht", "lineaire factor in het kwadraat", "alleen de lineaire factor", "geen schaalfactor"], "lineaire factor tot de derde macht"));
    add("Een bedrag is na 7 jaar bij 4,25% groei gelijk aan €26 775,14. Wat was de beginwaarde?", acceptedMoney(20000));
    add("Na een stijging van 40% moet een bedrag met hoeveel procent dalen om terug te keren naar de beginwaarde?", acceptedNumber(28.57, "%"));
    add("Een index daalt van 186 naar 158,1. Hoeveel procent daling?", acceptedNumber(15, "%"));
  }

  return shuffle(random, exercises);
}
