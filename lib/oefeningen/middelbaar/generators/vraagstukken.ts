import {
  acceptedMoney,
  acceptedNumber,
  randomInt,
  type ExerciseInput,
  type Random,
} from "./shared";

export function generateVraagstukken(
  level: number,
  random: Random
): ExerciseInput[] {
  const category = `Vraagstukken begrijpen · niveau ${level}`;

  if (level === 1) {
    const notebooks = randomInt(random, 6, 12);
    const notebookPrice = randomInt(random, 180, 350) / 100;
    const pens = randomInt(random, 4, 10);
    const penPrice = randomInt(random, 90, 220) / 100;
    const paid = Math.ceil(
      (notebooks * notebookPrice + pens * penPrice) / 10
    ) * 10 + 10;

    return [
      {
        category,
        question:
          `Een leerling koopt ${notebooks} schriften van €${notebookPrice
            .toFixed(2)
            .replace(".", ",")} en ${pens} pennen van €${penPrice
            .toFixed(2)
            .replace(".", ",")}. Hoeveel betaalt de leerling in totaal?`,
        answer: acceptedMoney(
          notebooks * notebookPrice + pens * penPrice
        ),
      },
      {
        category,
        question:
          `Dezelfde leerling betaalt met €${paid}. Hoeveel wisselgeld krijgt hij?`,
        answer: acceptedMoney(
          paid - (notebooks * notebookPrice + pens * penPrice)
        ),
      },
      {
        category,
        question:
          `Een bus heeft 54 zitplaatsen. Er stappen 37 leerlingen en 4 begeleiders in. ` +
          `Hoeveel plaatsen blijven vrij?`,
        answer: "13",
      },
      {
        category,
        question:
          `Een klas koopt 8 pakken papier met 250 vellen per pak. ` +
          `Na een project zijn 365 vellen gebruikt. Hoeveel vellen blijven over?`,
        answer: "1635",
      },
      {
        category,
        question:
          `Een trein vertrekt om 08:47 en komt aan om 10:19. ` +
          `Hoeveel minuten duurt de rit?`,
        answer: acceptedNumber(92, "minuten"),
      },
      {
        category,
        question:
          `Een wandelroute is 18,5 km lang. Na 7,8 km houdt de groep pauze. ` +
          `Hoeveel kilometer moet de groep daarna nog afleggen?`,
        answer: acceptedNumber(10.7, "km"),
      },
    ];
  }

  if (level === 2) {
    const boxes = randomInt(random, 6, 10);
    const items = randomInt(random, 18, 28);
    const damaged = randomInt(random, 9, 24);
    const sold = randomInt(random, 30, 60);

    return [
      {
        category,
        question:
          `Een magazijn ontvangt ${boxes} dozen met telkens ${items} producten. ` +
          `${damaged} producten zijn beschadigd en ${sold} producten worden verkocht. ` +
          `Hoeveel bruikbare producten blijven over?`,
        answer: String(boxes * items - damaged - sold),
      },
      {
        category,
        question:
          `Een klas van 28 leerlingen betaalt €7,50 per leerling voor een activiteit. ` +
          `De school betaalt daarnaast €48 vaste reservatiekosten. ` +
          `Hoeveel kost de activiteit in totaal?`,
        answer: acceptedMoney(28 * 7.5 + 48),
      },
      {
        category,
        question:
          `Een fietser rijdt 24 km in 1,5 uur. Hoeveel kilometer rijdt hij gemiddeld per uur?`,
        answer: acceptedNumber(16, "km/u"),
      },
      {
        category,
        question:
          `Een recept voor 4 personen gebruikt 300 gram rijst. ` +
          `Hoeveel gram rijst is nodig voor 10 personen?`,
        answer: acceptedNumber(750, "gram"),
      },
      {
        category,
        question:
          `Een tank bevat 120 liter. Eerst wordt 35 liter gebruikt en daarna 18 liter bijgevuld. ` +
          `Hoeveel liter zit nu in de tank?`,
        answer: acceptedNumber(103, "liter"),
      },
      {
        category,
        question:
          `Een leerling rekent 6 × 24 - 18 uit als 6 × 6. ` +
          `Is die redenering correct? Antwoord met ja of nee.`,
        answer: "nee",
      },
    ];
  }

  if (level === 3) {
    return [
      {
        category,
        question:
          `Een jas kost €96. Tijdens de solden krijg je 25% korting. ` +
          `Wat is de nieuwe prijs?`,
        answer: acceptedMoney(72),
      },
      {
        category,
        question:
          `In een klas van 32 leerlingen is 3/8 afwezig. ` +
          `Hoeveel leerlingen zijn aanwezig?`,
        answer: "20",
      },
      {
        category,
        question:
          `Een school koopt 15 boeken van €12,40. Ze krijgt €18 korting op het totaal. ` +
          `Hoeveel betaalt de school?`,
        answer: acceptedMoney(168),
      },
      {
        category,
        question:
          `Een route is 42 km lang. De eerste dag wordt 2/7 van de route afgelegd. ` +
          `De tweede dag nog 15 km. Hoeveel kilometer blijft over?`,
        answer: acceptedNumber(15, "km"),
      },
      {
        category,
        question:
          `Een rechthoekig terrein is 18 m lang en 12 m breed. ` +
          `Rondom wordt een hek geplaatst, behalve bij een poort van 3 m. ` +
          `Hoeveel meter hek is nodig?`,
        answer: acceptedNumber(57, "m"),
      },
      {
        category,
        question:
          `Een bus rijdt 180 km. De eerste 75 km rijdt hij aan 50 km/u. ` +
          `Hoeveel kilometer moet hij daarna nog afleggen?`,
        answer: acceptedNumber(105, "km"),
      },
    ];
  }

  if (level === 4) {
    return [
      {
        category,
        question:
          `Een laptop kost €720. Eerst wordt de prijs met 15% verlaagd. ` +
          `Daarna komt er €25 administratiekost bij. Wat is de eindprijs?`,
        answer: acceptedMoney(637),
      },
      {
        category,
        question:
          `Een tank is voor 3/5 gevuld en bevat dan 84 liter. ` +
          `Wat is de volledige inhoud van de tank?`,
        answer: acceptedNumber(140, "liter"),
      },
      {
        category,
        question:
          `Voor 6 personen is 450 gram bloem nodig. ` +
          `Hoeveel gram bloem is nodig voor 14 personen?`,
        answer: acceptedNumber(1050, "gram"),
      },
      {
        category,
        question:
          `Een kaart heeft schaal 1 : 50 000. Twee plaatsen liggen 7,2 cm uit elkaar. ` +
          `Hoe groot is de werkelijke afstand in kilometer?`,
        answer: acceptedNumber(3.6, "km"),
      },
      {
        category,
        question:
          `Een trein vertrekt om 13:38. De rit duurt 2 uur en 47 minuten. ` +
          `Om hoe laat komt de trein aan?`,
        answer: ["16:25", "16.25"],
      },
      {
        category,
        question:
          `Een rechthoek heeft een oppervlakte van 192 cm² en een breedte van 12 cm. ` +
          `Bereken de omtrek.`,
        answer: acceptedNumber(56, "cm"),
      },
    ];
  }

  if (level === 5) {
    return [
      {
        category,
        question:
          `Een winkel verhoogt een prijs van €160 eerst met 12%. ` +
          `Tijdens een actie wordt op de nieuwe prijs 20% korting gegeven. ` +
          `Wat betaalt de klant uiteindelijk?`,
        answer: acceptedMoney(143.36),
      },
      {
        category,
        question:
          `Een klas maakt een uitstap. De bus kost €540. ` +
          `Daarnaast betaalt elke leerling €8,50 toegang. ` +
          `Er gaan 24 leerlingen mee. De school subsidieert €150. ` +
          `Hoeveel moet de klas zelf betalen?`,
        answer: acceptedMoney(594),
      },
      {
        category,
        question:
          `Van een voorraad wordt eerst 30% verkocht. Daarna wordt 1/4 van de rest verkocht. ` +
          `Welk percentage van de oorspronkelijke voorraad blijft over?`,
        answer: acceptedNumber(52.5, "%"),
      },
      {
        category,
        question:
          `Een auto rijdt 210 km in 2,5 uur. ` +
          `Daarna rijdt hij nog 90 km aan 60 km/u. ` +
          `Hoe lang duurt de volledige rit in uren?`,
        answer: acceptedNumber(4, "uur"),
      },
      {
        category,
        question:
          `Een vloer van 8,4 m bij 6 m wordt betegeld met vierkante tegels van 30 cm bij 30 cm. ` +
          `Hoeveel tegels zijn minimaal nodig?`,
        answer: "560",
      },
      {
        category,
        question:
          `Een leerling zegt: “20% korting en daarna 20% prijsstijging heffen elkaar op.” ` +
          `Is dat correct? Antwoord met ja of nee.`,
        answer: "nee",
      },
    ];
  }

  if (level === 6) {
    return [
      {
        category,
        question:
          `Een school koopt 18 tablets van €245 per stuk. ` +
          `Ze krijgt 8% korting op het totaal en betaalt daarna nog €120 leveringskosten. ` +
          `Hoeveel betaalt de school?`,
        answer: acceptedMoney(4177.2),
      },
      {
        category,
        question:
          `Een tank is voor 7/12 gevuld. Na toevoeging van 45 liter is hij voor 5/6 gevuld. ` +
          `Wat is de volledige inhoud van de tank?`,
        answer: acceptedNumber(180, "liter"),
      },
      {
        category,
        question:
          `Een rechthoekige tuin is 24 m lang en 15 m breed. ` +
          `In het midden ligt een vijver van 6 m bij 4 m. ` +
          `Hoeveel vierkante meter blijft over voor gras?`,
        answer: acceptedNumber(336, "m²"),
      },
      {
        category,
        question:
          `Een trein legt 360 km af. De eerste 2 uur rijdt hij gemiddeld 90 km/u. ` +
          `De rest van de afstand legt hij af in 1,5 uur. ` +
          `Wat is de gemiddelde snelheid tijdens het tweede deel?`,
        answer: acceptedNumber(120, "km/u"),
      },
      {
        category,
        question:
          `De verhouding jongens : meisjes is 5 : 7. ` +
          `Er zijn 36 leerlingen in totaal. Hoeveel meisjes zijn er?`,
        answer: "21",
      },
      {
        category,
        question:
          `Een product kost na 15% korting €102. ` +
          `Wat was de oorspronkelijke prijs?`,
        answer: acceptedMoney(120),
      },
    ];
  }

  if (level === 7) {
    return [
      {
        category,
        question:
          `Een organisatie verkoopt 180 tickets aan €14. ` +
          `De kosten bedragen €1650 plus €2,50 per bezoeker. ` +
          `Hoeveel winst maakt de organisatie?`,
        answer: acceptedMoney(420),
      },
      {
        category,
        question:
          `Een vat is voor 2/3 gevuld. Na het aftappen van 36 liter is het nog voor 5/12 gevuld. ` +
          `Wat is de volledige inhoud van het vat?`,
        answer: acceptedNumber(144, "liter"),
      },
      {
        category,
        question:
          `Een fiets kost €840. De prijs stijgt eerst met 6%. ` +
          `Daarna krijgt de klant 12% korting op de verhoogde prijs. ` +
          `Wat is de uiteindelijke prijs?`,
        answer: acceptedMoney(783.55),
      },
      {
        category,
        question:
          `Een rechthoek heeft een lengte die 4 cm groter is dan de breedte. ` +
          `De omtrek is 52 cm. Wat is de oppervlakte?`,
        answer: acceptedNumber(165, "cm²"),
      },
      {
        category,
        question:
          `Een mengsel bevat water en siroop in de verhouding 7 : 3. ` +
          `Er is 4,5 liter siroop. Hoeveel liter mengsel is er in totaal?`,
        answer: acceptedNumber(15, "liter"),
      },
      {
        category,
        question:
          `Een leerling berekent bij 25% korting: prijs ÷ 4. ` +
          `Bereken je daarmee de korting of de nieuwe prijs?`,
        answer: ["de korting", "korting"],
      },
    ];
  }

  if (level === 8) {
    return [
      {
        category,
        question:
          `Een bedrijf koopt materiaal voor €2400 exclusief 21% btw. ` +
          `Het krijgt daarna 7,5% korting op het bedrag inclusief btw. ` +
          `Hoeveel betaalt het bedrijf?`,
        answer: acceptedMoney(2686.2),
      },
      {
        category,
        question:
          `Een route bestaat uit drie delen. Het eerste deel is 35% van de totale route. ` +
          `Het tweede deel is 18 km en het derde deel 21 km. ` +
          `Hoe lang is de volledige route?`,
        answer: acceptedNumber(60, "km"),
      },
      {
        category,
        question:
          `Een rechthoekig lokaal heeft een oppervlakte van 96 m². ` +
          `De lengte is 4 m groter dan de breedte. ` +
          `Wat zijn de afmetingen? Antwoord bijvoorbeeld: 8 m en 12 m.`,
        answer: [
          "8 m en 12 m",
          "12 m en 8 m",
          "8 en 12",
          "12 en 8",
        ],
      },
      {
        category,
        question:
          `Een auto rijdt 120 km aan 80 km/u en daarna 180 km aan 90 km/u. ` +
          `Wat is de gemiddelde snelheid over de volledige rit?`,
        answer: acceptedNumber(85.71, "km/u"),
      },
      {
        category,
        question:
          `In een klas is 40% van de leerlingen meisje. ` +
          `Als er 6 meisjes bijkomen, is 50% van de klas meisje. ` +
          `Hoeveel leerlingen waren er oorspronkelijk?`,
        answer: "30",
      },
      {
        category,
        question:
          `Een model is op schaal 1 : 250. ` +
          `Een oppervlakte op het model is 12 cm². ` +
          `Hoe groot is de werkelijke oppervlakte in m²?`,
        answer: acceptedNumber(750, "m²"),
      },
    ];
  }

  if (level === 9) {
    return [
      {
        category,
        question:
          `Een evenement verkoopt 240 tickets. ` +
          `60% wordt verkocht aan €18, de rest aan €22. ` +
          `De totale kosten bedragen €3650. Hoeveel winst is er?`,
        answer: acceptedMoney(946),
      },
      {
        category,
        question:
          `Een tank is eerst voor 3/8 gevuld. Na toevoeging van 70 liter is hij voor 5/6 gevuld. ` +
          `Wat is de totale inhoud van de tank?`,
        answer: acceptedNumber(152.73, "liter"),
      },
      {
        category,
        question:
          `Een product stijgt eerst 18% in prijs en daalt daarna 15%. ` +
          `De eindprijs is €100,30. Wat was de oorspronkelijke prijs?`,
        answer: acceptedMoney(100),
      },
      {
        category,
        question:
          `Een rechthoekige tuin heeft een oppervlakte van 432 m². ` +
          `De lengte is 6 m langer dan de breedte. Wat is de omtrek?`,
        answer: acceptedNumber(84, "m"),
      },
      {
        category,
        question:
          `Een trein rijdt de helft van de afstand aan 80 km/u en de andere helft aan 120 km/u. ` +
          `Wat is de gemiddelde snelheid over de volledige afstand?`,
        answer: acceptedNumber(96, "km/u"),
      },
      {
        category,
        question:
          `Een leerling berekent een gemiddelde snelheid door 80 en 120 op te tellen en door 2 te delen. ` +
          `Is die methode in dit vraagstuk correct? Antwoord met ja of nee.`,
        answer: "nee",
      },
    ];
  }

  return [
    {
      category,
      question:
        `Een school organiseert een activiteit voor 180 leerlingen. ` +
        `De vaste kosten zijn €1250. Materiaal kost €6,40 per leerling. ` +
        `De school wil 12% winst maken op de totale kosten. ` +
        `Welke prijs per leerling moet minimaal gevraagd worden?`,
      answer: acceptedMoney(14.95),
    },
    {
      category,
      question:
        `Een tank is voor 7/15 gevuld. Na toevoeging van 96 liter is hij voor 11/15 gevuld. ` +
        `Daarna wordt 18% van de volledige inhoud afgetapt. ` +
        `Hoeveel liter blijft uiteindelijk in de tank?`,
      answer: acceptedNumber(204, "liter"),
    },
    {
      category,
      question:
        `Een artikel kost €250 exclusief 21% btw. ` +
        `Eerst geldt 8% korting op de prijs exclusief btw. ` +
        `Daarna wordt de btw berekend. Wat is de eindprijs?`,
      answer: acceptedMoney(278.3),
    },
    {
      category,
      question:
        `Een rechthoek heeft een lengte die 3 keer de breedte min 4 cm is. ` +
        `De omtrek is 72 cm. Wat is de oppervlakte?`,
      answer: acceptedNumber(243, "cm²"),
    },
    {
      category,
      question:
        `Een auto rijdt 150 km aan 75 km/u, houdt 30 minuten pauze ` +
        `en rijdt daarna 210 km aan 105 km/u. ` +
        `Wat is de gemiddelde snelheid over de volledige verstreken tijd, inclusief pauze?`,
      answer: acceptedNumber(80, "km/u"),
    },
    {
      category,
      question:
        `Een voorraad wordt eerst met 20% verhoogd. ` +
        `Daarna wordt 25% van de nieuwe voorraad verkocht. ` +
        `Er blijven 360 stuks over. Hoe groot was de oorspronkelijke voorraad?`,
      answer: "400",
    },
  ];
}

