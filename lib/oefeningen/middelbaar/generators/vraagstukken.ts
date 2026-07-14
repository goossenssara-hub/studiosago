import {
  acceptedMoney,
  acceptedNumber,
  randomInt,
  type ExerciseInput,
  type Random,
} from "./shared";

const money = (value: number) => acceptedMoney(value);
const number = (value: number, unit?: string) => acceptedNumber(value, unit);

function decimal(random: Random, min: number, max: number, step = 0.5) {
  const count = Math.floor((max - min) / step);
  return min + randomInt(random, 0, count) * step;
}

export function generateVraagstukken(
  level: number,
  random: Random
): ExerciseInput[] {
  const category = `Vraagstukken begrijpen · niveau ${level}`;

  if (level === 1) {
    const notebooks = randomInt(random, 5, 12);
    const notebookPrice = decimal(random, 1.5, 3.5, 0.25);
    const pens = randomInt(random, 3, 9);
    const penPrice = decimal(random, 0.75, 2.25, 0.25);
    const total = notebooks * notebookPrice + pens * penPrice;
    const paid = Math.ceil(total / 10) * 10;
    const busStudents = randomInt(random, 28, 42);
    const guides = randomInt(random, 2, 5);
    const seats = 54;
    const packs = randomInt(random, 5, 9);
    const usedSheets = randomInt(random, 275, 575);
    const walk = decimal(random, 14, 24, 0.5);
    const completed = decimal(random, 5, walk - 4, 0.5);
    const apples = randomInt(random, 6, 12);
    const applesPerBag = randomInt(random, 4, 8);
    const shared = randomInt(random, 3, 6);
    const stickers = shared * randomInt(random, 8, 18);
    const startHour = randomInt(random, 8, 11);
    const duration = randomInt(random, 55, 115);
    const startMinutes = randomInt(random, 0, 5) * 10;
    const endTotal = startHour * 60 + startMinutes + duration;
    const endHour = Math.floor(endTotal / 60);
    const endMinutes = endTotal % 60;
    const pagesRead = randomInt(random, 48, 96);
    const morningTickets = randomInt(random, 35, 65);
    const afternoonTickets = randomInt(random, 40, 80);

    return [
      { category, question: `Een leerling koopt ${notebooks} schriften van €${notebookPrice.toFixed(2).replace(".", ",")} en ${pens} pennen van €${penPrice.toFixed(2).replace(".", ",")}. Hoeveel betaalt de leerling in totaal?`, answer: money(total) },
      { category, question: `De leerling betaalt de aankoop van €${total.toFixed(2).replace(".", ",")} met €${paid}. Hoeveel wisselgeld krijgt de leerling?`, answer: money(paid - total) },
      { category, question: `Een bus heeft ${seats} zitplaatsen. Er stappen ${busStudents} leerlingen en ${guides} begeleiders in. Hoeveel plaatsen blijven vrij?`, answer: String(seats - busStudents - guides) },
      { category, question: `Een klas koopt ${packs} pakken papier met 250 vellen per pak. Na een project zijn ${usedSheets} vellen gebruikt. Hoeveel vellen blijven over?`, answer: String(packs * 250 - usedSheets) },
      { category, question: `Een treinrit duurt ${duration} minuten. De trein vertrekt om ${String(startHour).padStart(2, "0")}:${String(startMinutes).padStart(2, "0")}. Om hoe laat komt hij aan?`, answer: [`${String(endHour).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`, `${endHour}.${String(endMinutes).padStart(2, "0")}`] },
      { category, question: `Een wandelroute is ${walk.toFixed(1).replace(".", ",")} km lang. Na ${completed.toFixed(1).replace(".", ",")} km houdt de groep pauze. Hoeveel kilometer moet de groep nog afleggen?`, answer: number(walk - completed, "km") },
      { category, question: `Er zijn ${apples} zakken met telkens ${applesPerBag} appels. Hoeveel appels zijn er in totaal?`, answer: String(apples * applesPerBag) },
      { category, question: `${stickers} stickers worden eerlijk verdeeld over ${shared} leerlingen. Hoeveel stickers krijgt elke leerling?`, answer: String(stickers / shared) },
      { category, question: `Een boek telt 184 pagina's. Noor heeft al ${pagesRead} pagina's gelezen. Hoeveel pagina's moet ze nog lezen?`, answer: String(184 - pagesRead) },
      { category, question: `In de ochtend worden ${morningTickets} tickets verkocht en in de namiddag ${afternoonTickets}. Hoeveel tickets zijn dat samen?`, answer: String(morningTickets + afternoonTickets) },
      { category, question: `Een sportdag begint om 09:00 en eindigt om 14:30. Hoe lang duurt de sportdag?`, answer: ["5 uur 30 minuten", "5u30", "330 minuten"] },
      { category, question: `Een doos bevat 96 kleurpotloden. Vier klassen krijgen elk 18 potloden. Hoeveel potloden blijven over?`, answer: "24" },
      { category, question: `Een leerling spaart elke week €7 gedurende 8 weken. Hoeveel heeft de leerling gespaard?`, answer: money(56) },
      { category, question: `Een rechthoekige speelplaats is 24 m lang en 13 m breed. Hoeveel meter hek is nodig rondom de speelplaats?`, answer: number(74, "m") },
      { category, question: `Een fles bevat 1,5 liter water. Er wordt 0,4 liter opgedronken. Hoeveel liter blijft over?`, answer: number(1.1, "liter") },
      { category, question: `Drie dozen bevatten elk 24 koekjes. Tijdens de pauze worden 19 koekjes opgegeten. Hoeveel koekjes blijven over?`, answer: "53" },
    ];
  }

  if (level === 2) {
    const boxes = randomInt(random, 6, 12);
    const items = randomInt(random, 18, 30);
    const damaged = randomInt(random, 8, 24);
    const sold = randomInt(random, 30, 70);
    const people = randomInt(random, 22, 32);
    const admission = decimal(random, 6, 10, 0.5);
    const fixed = randomInt(random, 35, 65);
    const distance = randomInt(random, 24, 48);
    const hours = decimal(random, 1.5, 3, 0.5);
    const recipePeople = randomInt(random, 4, 6);
    const targetPeople = recipePeople * 2;
    const grams = randomInt(random, 3, 6) * 100;

    return [
      { category, question: `Een magazijn ontvangt ${boxes} dozen met telkens ${items} producten. ${damaged} producten zijn beschadigd en ${sold} worden verkocht. Hoeveel bruikbare producten blijven over?`, answer: String(boxes * items - damaged - sold) },
      { category, question: `Een klas van ${people} leerlingen betaalt €${admission.toFixed(2).replace(".", ",")} per leerling voor een activiteit. De school betaalt daarnaast €${fixed} reservatiekosten. Hoeveel kost de activiteit in totaal?`, answer: money(people * admission + fixed) },
      { category, question: `Een fietser rijdt ${distance} km in ${hours.toString().replace(".", ",")} uur. Hoeveel kilometer rijdt hij gemiddeld per uur?`, answer: number(distance / hours, "km/u") },
      { category, question: `Een recept voor ${recipePeople} personen gebruikt ${grams} gram rijst. Hoeveel gram is nodig voor ${targetPeople} personen?`, answer: number(grams * 2, "gram") },
      { category, question: `Een tank bevat 120 liter. Eerst wordt 35 liter gebruikt en daarna 18 liter bijgevuld. Hoeveel liter zit nu in de tank?`, answer: number(103, "liter") },
      { category, question: `Een leerling rekent 6 × 24 - 18 uit als 6 × 6. Is die redenering correct? Antwoord met ja of nee.`, answer: "nee" },
      { category, question: `Een bioscoop heeft 12 rijen met 18 stoelen. Er blijven 27 stoelen leeg. Hoeveel bezoekers zijn er?`, answer: "189" },
      { category, question: `Een school bestelt 14 dozen met 25 schriftjes. De schriftjes worden verdeeld over 10 klassen. Hoeveel schriftjes krijgt elke klas?`, answer: "35" },
      { category, question: `Een film begint om 18:45 en duurt 1 uur en 48 minuten. Om hoe laat eindigt de film?`, answer: ["20:33", "20.33"] },
      { category, question: `Een jas kost €72 en een broek €48. Tijdens de actie krijg je €20 korting op het totaal. Hoeveel betaal je?`, answer: money(100) },
      { category, question: `Een rechthoekige tuin is 15 m lang en 9 m breed. Bereken de oppervlakte.`, answer: number(135, "m²") },
      { category, question: `Een krat bevat 24 flessen van 0,5 liter. Hoeveel liter drank bevat de krat?`, answer: number(12, "liter") },
      { category, question: `Een leerling leest 18 pagina's per dag. Hoeveel dagen zijn nodig voor een boek van 144 pagina's?`, answer: number(8, "dagen") },
      { category, question: `Een buskaart kost €2,40 per rit. Wat kosten 10 ritten?`, answer: money(24) },
      { category, question: `Een temperatuur stijgt van -4 °C naar 7 °C. Met hoeveel graden stijgt de temperatuur?`, answer: number(11, "°C") },
    ];
  }

  if (level === 3) {
    return [
      { category, question: `Een jas kost €96. Tijdens de solden krijg je 25% korting. Wat is de nieuwe prijs?`, answer: money(72) },
      { category, question: `In een klas van 32 leerlingen is 3/8 afwezig. Hoeveel leerlingen zijn aanwezig?`, answer: "20" },
      { category, question: `Een school koopt 15 boeken van €12,40. Ze krijgt €18 korting. Hoeveel betaalt de school?`, answer: money(168) },
      { category, question: `Een route is 42 km lang. De eerste dag wordt 2/7 afgelegd en de tweede dag 15 km. Hoeveel kilometer blijft over?`, answer: number(15, "km") },
      { category, question: `Een terrein is 18 m lang en 12 m breed. Rondom komt een hek, behalve bij een poort van 3 m. Hoeveel meter hek is nodig?`, answer: number(57, "m") },
      { category, question: `Een bus rijdt 180 km. De eerste 75 km zijn afgelegd. Welk deel van de route moet nog worden afgelegd?`, answer: number(105, "km") },
      { category, question: `Een tablet kost €240. De prijs stijgt met 10%. Wat is de nieuwe prijs?`, answer: money(264) },
      { category, question: `Een recept voor 6 personen gebruikt 450 g bloem. Hoeveel gram is nodig voor 10 personen?`, answer: number(750, "gram") },
      { category, question: `Van 240 leerlingen neemt 35% de fiets. Hoeveel leerlingen zijn dat?`, answer: "84" },
      { category, question: `Een trein rijdt 210 km in 2,5 uur. Bereken de gemiddelde snelheid.`, answer: number(84, "km/u") },
      { category, question: `Een rechthoek heeft een oppervlakte van 180 cm² en een breedte van 12 cm. Bereken de lengte.`, answer: number(15, "cm") },
      { category, question: `Een bedrag van €360 wordt verdeeld in de verhouding 2 : 3. Hoe groot is het grootste deel?`, answer: money(216) },
      { category, question: `Een vat van 200 liter is voor 65% gevuld. Hoeveel liter zit erin?`, answer: number(130, "liter") },
      { category, question: `Na een korting van €18 kost een spel €57. Wat was de oorspronkelijke prijs?`, answer: money(75) },
      { category, question: `Een leerling behaalt 14/20. Hoeveel procent is dat?`, answer: number(70, "%") },
    ];
  }

  if (level === 4) {
    return [
      { category, question: `Een laptop kost €720. Eerst wordt de prijs met 15% verlaagd. Daarna komt er €25 administratiekost bij. Wat is de eindprijs?`, answer: money(637) },
      { category, question: `Een tank is voor 3/5 gevuld en bevat dan 84 liter. Wat is de volledige inhoud?`, answer: number(140, "liter") },
      { category, question: `Voor 6 personen is 450 gram bloem nodig. Hoeveel gram is nodig voor 14 personen?`, answer: number(1050, "gram") },
      { category, question: `Een kaart heeft schaal 1 : 50 000. Twee plaatsen liggen 7,2 cm uit elkaar. Wat is de werkelijke afstand?`, answer: number(3.6, "km") },
      { category, question: `Een trein vertrekt om 13:38. De rit duurt 2 uur en 47 minuten. Om hoe laat komt hij aan?`, answer: ["16:25", "16.25"] },
      { category, question: `Een rechthoek heeft een oppervlakte van 192 cm² en een breedte van 12 cm. Bereken de omtrek.`, answer: number(56, "cm") },
      { category, question: `Na 20% korting kost een fiets €480. Wat was de oorspronkelijke prijs?`, answer: money(600) },
      { category, question: `Een groep bestaat uit jongens en meisjes in de verhouding 5 : 7. Er zijn 48 leerlingen. Hoeveel meisjes zijn er?`, answer: "28" },
      { category, question: `Een auto verbruikt 6,5 liter per 100 km. Hoeveel liter verbruikt hij over 340 km?`, answer: number(22.1, "liter") },
      { category, question: `Een cilinder bevat 1,5 liter sap. Hoeveel glazen van 200 ml kunnen volledig gevuld worden?`, answer: "7" },
      { category, question: `Een score stijgt van 60 naar 75 punten. Bereken de procentuele stijging.`, answer: number(25, "%") },
      { category, question: `Een vierkant heeft een oppervlakte van 225 cm². Bereken de omtrek.`, answer: number(60, "cm") },
      { category, question: `Een winkel verkoopt 3 artikelen van €18,50 en 2 artikelen van €12,75. Je betaalt met €100. Hoeveel krijg je terug?`, answer: money(19) },
      { category, question: `Een wandeling van 27 km wordt verdeeld over 3 dagen in de verhouding 2 : 3 : 4. Hoeveel kilometer wordt op de derde dag afgelegd?`, answer: number(12, "km") },
      { category, question: `Een zwembad bevat 18 000 liter. Er stroomt 750 liter per uur uit. Hoeveel uur duurt het om 1/3 leeg te laten lopen?`, answer: number(8, "uur") },
    ];
  }

  if (level === 5) {
    return [
      { category, question: `Een winkel verhoogt een prijs van €160 eerst met 12%. Daarna wordt 20% korting gegeven. Wat betaalt de klant?`, answer: money(143.36) },
      { category, question: `Een bus kost €540 en de toegang €8,50 per leerling. Er gaan 24 leerlingen mee en de school subsidieert €150. Hoeveel betaalt de klas?`, answer: money(594) },
      { category, question: `Van een voorraad wordt eerst 30% verkocht. Daarna wordt 1/4 van de rest verkocht. Welk percentage blijft over?`, answer: number(52.5, "%") },
      { category, question: `Een auto rijdt 210 km in 2,5 uur en daarna 90 km aan 60 km/u. Hoe lang duurt de volledige rit?`, answer: number(4, "uur") },
      { category, question: `Een vloer van 8,4 m bij 6 m wordt betegeld met tegels van 30 cm bij 30 cm. Hoeveel tegels zijn minimaal nodig?`, answer: "560" },
      { category, question: `Een leerling zegt: “20% korting en daarna 20% stijging heffen elkaar op.” Is dat correct?`, answer: "nee" },
      { category, question: `Een bedrag groeit drie jaar lang jaarlijks met 4%, vanaf €2 000. Hoeveel is het na drie jaar?`, answer: money(2249.73) },
      { category, question: `Een mengsel bevat water en siroop in verhouding 7 : 3. Er is 4,5 liter siroop. Hoeveel liter mengsel is er?`, answer: number(15, "liter") },
      { category, question: `Een rechthoek heeft lengte 4 cm meer dan breedte en omtrek 52 cm. Bereken de oppervlakte.`, answer: number(165, "cm²") },
      { category, question: `Een product kost €968 inclusief 21% btw. Wat is de prijs exclusief btw?`, answer: money(800) },
      { category, question: `Een trein legt 360 km af. De eerste 180 km rijdt hij aan 90 km/u, de rest aan 120 km/u. Hoe lang duurt de rit?`, answer: number(3.5, "uur") },
      { category, question: `In een enquête kiest 42% van 750 deelnemers optie A. Hoeveel deelnemers zijn dat?`, answer: "315" },
      { category, question: `Een tank is voor 5/8 gevuld. Na toevoeging van 45 liter is hij voor 7/8 gevuld. Wat is de inhoud?`, answer: number(180, "liter") },
      { category, question: `Een kaart met schaal 1 : 25 000 toont een gebied van 12 cm bij 8 cm. Wat is de werkelijke oppervlakte?`, answer: number(6, "km²") },
      { category, question: `Een machine maakt 360 onderdelen in 4,5 uur. Hoeveel onderdelen maakt ze gemiddeld per uur?`, answer: "80" },
    ];
  }

  if (level === 6) {
    return [
      { category, question: `Een school koopt 18 tablets van €245. Ze krijgt 8% korting en betaalt €120 levering. Hoeveel betaalt de school?`, answer: money(4177.2) },
      { category, question: `Een tank is voor 7/12 gevuld. Na toevoeging van 45 liter is hij voor 5/6 gevuld. Wat is de inhoud?`, answer: number(180, "liter") },
      { category, question: `Een tuin is 24 m bij 15 m. In het midden ligt een vijver van 6 m bij 4 m. Hoeveel m² gras blijft over?`, answer: number(336, "m²") },
      { category, question: `Een trein rijdt 360 km. De eerste 2 uur aan 90 km/u, de rest in 1,5 uur. Wat is de gemiddelde snelheid in het tweede deel?`, answer: number(120, "km/u") },
      { category, question: `De verhouding jongens : meisjes is 5 : 7 en er zijn 36 leerlingen. Hoeveel meisjes zijn er?`, answer: "21" },
      { category, question: `Een product kost na 15% korting €102. Wat was de oorspronkelijke prijs?`, answer: money(120) },
      { category, question: `Een investering van €5 000 groeit 3 jaar met 4% per jaar. Bereken de eindwaarde.`, answer: money(5624.32) },
      { category, question: `Een cilindervormige tank heeft straal 2 m en hoogte 3 m. Gebruik π = 3,14. Hoeveel m³ bevat hij?`, answer: number(37.68, "m³") },
      { category, question: `Een rapportcijfer bestaat voor 30% uit 14/20 en voor 70% uit 17/20. Bereken het gewogen resultaat op 20.`, answer: number(16.1, "/20") },
      { category, question: `Een waarde daalt eerst 12% en stijgt daarna 12%. Hoeveel procent is de eindwaarde lager dan de beginwaarde?`, answer: number(1.44, "%") },
      { category, question: `Een auto rijdt 120 km aan 80 km/u en 180 km aan 120 km/u. Bereken de gemiddelde snelheid over de hele rit.`, answer: number(100, "km/u") },
      { category, question: `Een voorraad van 800 stuks daalt elke maand met 15%. Hoeveel stuks blijven na 2 maanden over?`, answer: "578" },
      { category, question: `Een schaalmodel heeft schaal 1 : 200. De modeloppervlakte is 18 cm². Wat is de werkelijke oppervlakte?`, answer: number(720, "m²") },
      { category, question: `Een organisatie verkoopt 240 tickets: 60% aan €12 en de rest aan €8. Hoe groot is de omzet?`, answer: money(2496) },
      { category, question: `Een vat bevat een oplossing van 30% zout. Hoeveel liter zout zit in 75 liter oplossing?`, answer: number(22.5, "liter") },
    ];
  }

  if (level === 7) {
    return [
      { category, question: `Een organisatie verkoopt 180 tickets aan €14. De kosten zijn €1650 plus €2,50 per bezoeker. Hoeveel winst maakt ze?`, answer: money(420) },
      { category, question: `Een vat is voor 2/3 gevuld. Na aftappen van 36 liter is het nog voor 5/12 gevuld. Wat is de inhoud?`, answer: number(144, "liter") },
      { category, question: `Een fiets kost €840, stijgt 6% en krijgt daarna 12% korting. Wat is de eindprijs?`, answer: money(783.55) },
      { category, question: `Een rechthoek heeft lengte 4 cm meer dan breedte en omtrek 52 cm. Wat is de oppervlakte?`, answer: number(165, "cm²") },
      { category, question: `Water en siroop staan in verhouding 7 : 3. Er is 4,5 liter siroop. Hoeveel liter mengsel is er?`, answer: number(15, "liter") },
      { category, question: `Een investering van €8 000 groeit 5 jaar met 3,5% per jaar. Bereken de eindwaarde.`, answer: money(9501.49) },
      { category, question: `Een product kost na 30% korting en 21% btw €423,50. Wat was de prijs vóór korting en btw?`, answer: money(500) },
      { category, question: `Een tank wordt gevuld door kraan A in 6 uur en kraan B in 4 uur. Welk deel vullen ze samen per uur?`, answer: ["5/12", "0,4167"] },
      { category, question: `Een auto rijdt de helft van de afstand aan 60 km/u en de andere helft aan 90 km/u. Wat is de gemiddelde snelheid?`, answer: number(72, "km/u") },
      { category, question: `Een populatie van 12 000 groeit jaarlijks 3,2%. Hoe groot is ze na 5 jaar?`, answer: number(14046.85) },
      { category, question: `Een winkel heeft een marge van 25% op de verkoopprijs. De verkoopprijs is €160. Wat is de inkoopprijs?`, answer: money(120) },
      { category, question: `Een mengsel van 40 liter bevat 25% concentraat. Hoeveel water moet worden toegevoegd om 20% concentraat te krijgen?`, answer: number(10, "liter") },
      { category, question: `Een toets telt 40 vragen. Voor een juist antwoord krijg je 2 punten, voor een fout antwoord -0,5. Een leerling heeft 32 juist en 8 fout. Bereken de score.`, answer: number(60) },
      { category, question: `Een rechthoek wordt 20% langer en 10% smaller. Met hoeveel procent verandert de oppervlakte?`, answer: number(8, "%") },
      { category, question: `Een lening van €10 000 heeft enkelvoudige rente van 4,5% per jaar gedurende 3 jaar. Hoeveel rente wordt betaald?`, answer: money(1350) },
    ];
  }

  if (level === 8) {
    return [
      { category, question: `Een kapitaal van €12 000 groeit 6 jaar met 3,8% samengestelde rente. Bereken de eindwaarde.`, answer: money(15012.49) },
      { category, question: `Een prijs daalt 18% en stijgt daarna 15%. De eindprijs is €100,30. Wat was de beginprijs?`, answer: money(106.19) },
      { category, question: `Twee machines maken samen 900 stuks in 6 uur. Machine A maakt 80 stuks per uur. Hoeveel maakt machine B per uur?`, answer: "70" },
      { category, question: `Een vat bevat 60 liter oplossing met 35% stof A. Hoeveel zuivere stof A moet worden toegevoegd om 50% te bereiken?`, answer: number(18, "liter") },
      { category, question: `Een auto rijdt 150 km aan 75 km/u, pauzeert 30 minuten en rijdt 210 km aan 105 km/u. Bereken de gemiddelde snelheid inclusief pauze.`, answer: number(80, "km/u") },
      { category, question: `Een piramide heeft grondvlak 48 cm² en volume 320 cm³. Bereken de hoogte.`, answer: number(20, "cm") },
      { category, question: `Een populatie daalt jaarlijks 2,5%. Na 4 jaar zijn er 18 071 inwoners. Hoeveel waren er aanvankelijk ongeveer?`, answer: number(20000) },
      { category, question: `Een examen bestaat uit 30% taken (15/20), 20% presentatie (18/20) en 50% examen (13/20). Bereken het eindresultaat.`, answer: number(14.6, "/20") },
      { category, question: `Een rechthoek heeft omtrek 68 cm. De lengte is 6 cm groter dan de breedte. Bereken de oppervlakte.`, answer: number(280, "cm²") },
      { category, question: `A:B = 3:5 en B:C = 10:7. Als A + B + C = 95, bereken C.`, answer: "35" },
      { category, question: `Een winkel koopt een artikel voor €240 exclusief btw en wil 30% winstmarge op de verkoopprijs. Wat is de verkoopprijs exclusief btw?`, answer: money(342.86) },
      { category, question: `Een project is na 12 dagen voor 40% klaar. Bij gelijk tempo: hoeveel dagen zijn nog nodig?`, answer: number(18, "dagen") },
      { category, question: `Een rechthoekig zwembad van 12 m bij 5 m wordt 1,6 m diep gevuld. Hoeveel liter water is nodig?`, answer: number(96000, "liter") },
      { category, question: `Een bedrag van €25 000 wordt verdeeld over A, B en C in verhouding 2 : 3 : 5. Hoeveel krijgt B?`, answer: money(7500) },
      { category, question: `Een trein rijdt heen aan 90 km/u en dezelfde afstand terug aan 120 km/u. Bereken de gemiddelde snelheid over heen en terug.`, answer: number(102.86, "km/u") },
    ];
  }

  if (level === 9) {
    return [
      { category, question: `Een investering stijgt 8% in jaar 1, daalt 5% in jaar 2 en stijgt 6% in jaar 3. Startwaarde €15 000. Bereken de eindwaarde.`, answer: money(16313.4) },
      { category, question: `Een fabriek produceert 1 200 stuks. 3% is defect. Van de goede stuks wordt 85% verkocht. Hoeveel goede stuks blijven onverkocht?`, answer: "175" },
      { category, question: `Een oplossing van 80 liter bevat 30% zout. Hoeveel water moet verdampen om 40% zout te krijgen?`, answer: number(20, "liter") },
      { category, question: `Een auto versnelt van 72 km/u naar 108 km/u. Bereken de procentuele stijging.`, answer: number(50, "%") },
      { category, question: `Een project heeft vaste kosten van €18 000 en variabele kosten van €12 per product. Verkoopprijs €30. Hoeveel producten zijn nodig om break-even te draaien?`, answer: "1000" },
      { category, question: `Een bedrag groeit continu volgens factor 1,04 per jaar. Na hoeveel volledige jaren is het minstens 50% gegroeid?`, answer: number(11, "jaar") },
      { category, question: `Een rechthoek heeft oppervlakte 432 cm². De lengte is 6 cm groter dan de breedte. Bereken de afmetingen.`, answer: ["18 en 24", "18 cm en 24 cm"] },
      { category, question: `Een trein rijdt 40% van de tijd aan 80 km/u en 60% aan 110 km/u. Bereken de gemiddelde snelheid.`, answer: number(98, "km/u") },
      { category, question: `Een organisatie verkoopt 600 tickets. 70% aan €18, 20% aan €12 en de rest gratis. De kosten zijn €7 500. Bereken de winst.`, answer: money(1500) },
      { category, question: `Een vat wordt door A in 8 uur gevuld en door B in 12 uur. Een lek maakt 1/24 vat per uur leeg. Hoe lang duurt vullen met beide kranen en het lek?`, answer: number(6, "uur") },
      { category, question: `Een prijs inclusief 21% btw en na 15% korting is €411,40. Bereken de prijs exclusief btw vóór korting.`, answer: money(400) },
      { category, question: `Een bevolkingsgroep van 50 000 daalt 1,8% per jaar. Hoe groot is ze na 7 jaar?`, answer: number(44034.8) },
      { category, question: `Een cilinder en kegel hebben dezelfde basis en hoogte. Samen is hun volume 502,4 cm³. Wat is het volume van de kegel?`, answer: number(125.6, "cm³") },
      { category, question: `Een lening van €20 000 wordt na 5 jaar €24 333,06 door samengestelde rente. Welk jaarlijks rentepercentage werd gebruikt?`, answer: number(4, "%") },
      { category, question: `Een test heeft sensitiviteit 90%. Van 200 werkelijk positieve gevallen worden er hoeveel gemist?`, answer: "20" },
    ];
  }

  return [
    { category, question: `Een kapitaal van €25 000 groeit 4 jaar met 5%, daalt daarna 8% en groeit vervolgens 3 jaar met 4%. Bereken de eindwaarde.`, answer: money(31117.97) },
    { category, question: `Een productieproces heeft 4% uitval. Van de goede producten wordt 2,5% bij controle afgekeurd. Welk percentage van de oorspronkelijke productie blijft over?`, answer: number(93.6, "%") },
    { category, question: `Een mengsel van 120 liter bevat 25% stof A. Hoeveel liter van een oplossing met 70% stof A moet worden toegevoegd om 40% te bereiken?`, answer: number(60, "liter") },
    { category, question: `Een auto rijdt 100 km aan 50 km/u, 150 km aan 75 km/u en 200 km aan 100 km/u. Bereken de gemiddelde snelheid.`, answer: number(75, "km/u") },
    { category, question: `Een onderneming heeft vaste kosten €45 000, variabele kosten €18 en verkoopprijs €42. Hoeveel stuks zijn nodig voor €15 000 winst?`, answer: "2500" },
    { category, question: `Een waarde groeit jaarlijks 6%. Na hoeveel volledige jaren is ze minstens verdubbeld?`, answer: number(12, "jaar") },
    { category, question: `Een rechthoek heeft diagonaal 25 cm en één zijde 15 cm. Bereken de oppervlakte.`, answer: number(300, "cm²") },
    { category, question: `Een populatie groeit 2% per jaar maar verliest aan het einde van elk jaar 500 leden. Start: 30 000. Hoeveel na 3 jaar?`, answer: number(30212.08) },
    { category, question: `Een investering A groeit 4% per jaar; investering B groeit lineair €450 per jaar. Beide starten op €10 000. Welke is na 5 jaar groter en met hoeveel?`, answer: ["A met €16,53", "A met 16,53 euro"] },
    { category, question: `Een examen telt 80 vragen: +3 voor juist, -1 voor fout, 0 voor blanco. Een leerling heeft 58 juist en score 162. Hoeveel vragen liet hij blanco?`, answer: "10" },
    { category, question: `Een tank wordt gevuld door A in 5 uur en B in 7,5 uur. Een afvoer leegt hem in 15 uur. Hoe lang duurt vullen met alles open?`, answer: number(3.75, "uur") },
    { category, question: `Een product doorloopt drie kortingen: 10%, 15% en 20%. Wat is de equivalente totale korting?`, answer: number(38.8, "%") },
    { category, question: `Een bedrijf verhoogt omzet 12% en verlaagt kosten 8%. De winstmarge stijgt van 20% naar hoeveel, als omzet eerst €500 000 en kosten €400 000 waren?`, answer: number(34.29, "%") },
    { category, question: `Een bol heeft hetzelfde volume als een cilinder met straal 4 cm en hoogte 8 cm. Bereken de straal van de bol.`, answer: number(4.58, "cm") },
    { category, question: `Een studie vindt 240 successen in een steekproef van 300. Hoeveel successen verwacht je bij 1 250 vergelijkbare gevallen?`, answer: "1000" },
  ];
}
