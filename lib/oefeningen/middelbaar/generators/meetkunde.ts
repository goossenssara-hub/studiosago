import {
  acceptedNumber,
  mc,
  randomInt,
  type ExerciseInput,
  type Random,
} from "./shared";

const pi = 3.14;
const round2 = (value: number) => Number(value.toFixed(2));

export function generateMeetkunde(level: number, random: Random): ExerciseInput[] {
  const category = `Meetkunde · niveau ${level}`;
  const q = (question: string, value: number, unit?: string): ExerciseInput => ({
    category,
    question,
    answer: acceptedNumber(round2(value), unit),
  });

  switch (level) {
    case 1: {
      const l = randomInt(random, 8, 24);
      const b = randomInt(random, 4, l - 1);
      const zijde = randomInt(random, 5, 15);
      const basis = randomInt(random, 8, 20);
      const hoogte = randomInt(random, 5, 14);
      return [
        q(`Rechthoek ${l} cm bij ${b} cm: bereken de omtrek.`, 2 * (l + b), "cm"),
        q(`Rechthoek ${l} cm bij ${b} cm: bereken de oppervlakte.`, l * b, "cm²"),
        q(`Vierkant met zijde ${zijde} cm: bereken de omtrek.`, 4 * zijde, "cm"),
        q(`Vierkant met zijde ${zijde} cm: bereken de oppervlakte.`, zijde ** 2, "cm²"),
        q(`Driehoek met basis ${basis} cm en hoogte ${hoogte} cm: oppervlakte?`, basis * hoogte / 2, "cm²"),
        q("Een rechthoek heeft lengte 18 cm en breedte 7 cm. Hoeveel cm langer is de lengte?", 11, "cm"),
        q("Een vierkant heeft een omtrek van 48 cm. Hoe lang is één zijde?", 12, "cm"),
        q("Een rechthoek heeft oppervlakte 96 cm² en breedte 8 cm. Lengte?", 12, "cm"),
        q("Een balk is 8 cm lang, 5 cm breed en 4 cm hoog. Volume?", 160, "cm³"),
        q("Een kubus heeft ribbe 6 cm. Volume?", 216, "cm³"),
        mc(category, "Welke figuur heeft precies drie zijden?", ["driehoek", "vierkant", "cirkel", "rechthoek"], "driehoek"),
        mc(category, "Welke hoek is een rechte hoek?", ["45°", "60°", "90°", "180°"], "90°"),
        mc(category, "Hoeveel graden is de som van de hoeken van een driehoek?", ["90°", "180°", "270°", "360°"], "180°"),
        mc(category, "Welke eenheid past bij oppervlakte?", ["cm", "cm²", "cm³", "liter per uur"], "cm²"),
        mc(category, "Welke eenheid past bij volume?", ["m", "m²", "m³", "graden"], "m³"),
        q("Een driehoek heeft hoeken van 48° en 67°. Bereken de derde hoek.", 65, "°"),
        q("Een rechthoekige tuin is 12 m bij 9 m. Hoeveel meter draad is nodig rondom?", 42, "m"),
        q("Een vloer is 10 m lang en 6 m breed. Oppervlakte?", 60, "m²"),
      ];
    }
    case 2: {
      const r = randomInt(random, 3, 10);
      const basis = randomInt(random, 8, 18);
      const hoogte = randomInt(random, 5, 12);
      return [
        q(`Parallellogram met basis ${basis} cm en hoogte ${hoogte} cm: oppervlakte?`, basis * hoogte, "cm²"),
        q("Trapezium met evenwijdige zijden 8 cm en 14 cm en hoogte 6 cm: oppervlakte?", 66, "cm²"),
        q(`Cirkel met straal ${r} cm: diameter?`, 2 * r, "cm"),
        q(`Cirkel met straal ${r} cm: omtrek met π = 3,14?`, 2 * pi * r, "cm"),
        q(`Cirkel met straal ${r} cm: oppervlakte met π = 3,14?`, pi * r ** 2, "cm²"),
        q("Kubus met ribbe 6 cm: totale oppervlakte?", 216, "cm²"),
        q("Balk 9 × 4 × 5 cm: volume?", 180, "cm³"),
        q("Een cirkel heeft diameter 18 cm. Straal?", 9, "cm"),
        q("Een parallellogram heeft oppervlakte 96 cm² en basis 12 cm. Hoogte?", 8, "cm"),
        q("Een trapezium heeft oppervlakte 72 cm², hoogte 6 cm en één evenwijdige zijde 10 cm. Andere zijde?", 14, "cm"),
        mc(category, "Welke driehoek heeft drie gelijke zijden?", ["gelijkzijdige", "gelijkbenige", "rechthoekige", "stomphoekige"], "gelijkzijdige"),
        mc(category, "Welke vierhoek heeft twee paren evenwijdige zijden?", ["parallellogram", "driehoek", "cirkel", "vijfhoek"], "parallellogram"),
        mc(category, "Welke formule geeft de omtrek van een cirkel?", ["2πr", "πr²", "l × b", "b × h ÷ 2"], "2πr"),
        mc(category, "Welke formule geeft de oppervlakte van een driehoek?", ["basis × hoogte ÷ 2", "basis × hoogte", "2 × basis + hoogte", "πr²"], "basis × hoogte ÷ 2"),
        q("Een regelmatige zeshoek heeft zijden van 7 cm. Omtrek?", 42, "cm"),
        q("Een hoek van 124° en een gestrekte hoek vormen samen twee aangrenzende hoeken. De andere hoek?", 56, "°"),
        q("Een kubus heeft ribbe 4 cm. Volume?", 64, "cm³"),
        q("Een cilinder heeft grondvlak 28,26 cm² en hoogte 10 cm. Volume?", 282.6, "cm³"),
      ];
    }
    case 3:
      return [
        q("Samengestelde figuur: rechthoek 12 × 8 cm min rechthoek 4 × 3 cm. Oppervlakte?", 84, "cm²"),
        q("Regelmatige zeshoek met zijde 5 cm: omtrek?", 30, "cm"),
        q("Buitenhoek van een regelmatige achthoek?", 45, "°"),
        q("Cilinder r = 3 cm, h = 10 cm, π = 3,14: volume?", 282.6, "cm³"),
        q("Diagonaal van een rechthoek van 6 cm bij 8 cm?", 10, "cm"),
        q("Som van de binnenhoeken van een vijfhoek?", 540, "°"),
        q("Binnenhoek van een regelmatige zeshoek?", 120, "°"),
        q("Een vierkant heeft diagonaal √200 cm. Zijde?", 10, "cm"),
        q("Een cilinder heeft volume 628 cm³ en hoogte 8 cm. Straal bij π = 3,14?", 5, "cm"),
        q("Een L-vorm ontstaat uit een rechthoek 15 × 10 cm waar 5 × 4 cm wordt weggehaald. Oppervlakte?", 130, "cm²"),
        mc(category, "Som van de binnenhoeken van een vierhoek?", ["180°", "270°", "360°", "540°"], "360°"),
        mc(category, "Welke stelling gebruik je voor de diagonaal van een rechthoek?", ["Pythagoras", "Thales", "Euler", "procentregel"], "Pythagoras"),
        mc(category, "Een regelmatige veelhoek heeft buitenhoeken van 60°. Hoeveel zijden?", ["5", "6", "8", "10"], "6"),
        mc(category, "Welke figuur heeft geen diagonalen?", ["driehoek", "vierkant", "vijfhoek", "zeshoek"], "driehoek"),
        q("Rechthoekige driehoek met rechthoekszijden 9 cm en 12 cm. Schuine zijde?", 15, "cm"),
        q("Een prisma heeft grondvlak 24 cm² en hoogte 11 cm. Volume?", 264, "cm³"),
        q("Een cirkelsector van 90° heeft straal 6 cm. Oppervlakte bij π = 3,14?", 28.26, "cm²"),
        q("Een cirkelboog van 180° in een cirkel met straal 7 cm. Lengte bij π = 22/7?", 22, "cm"),
      ];
    case 4:
      return [
        { category, question: "Een driehoek heeft zijden 9, 12 en 15 cm. Is hij rechthoekig?", answer: "ja" },
        q("Kegel r = 3 cm, h = 12 cm, π = 3,14: volume?", 113.04, "cm³"),
        q("Bol r = 3 cm, π = 3,14: volume?", 113.04, "cm³"),
        q("Boog van 90° in cirkel r = 8 cm, π = 3,14: lengte?", 12.56, "cm"),
        q("Oppervlakte van een ring met R = 5 cm en r = 3 cm, π = 3,14?", 50.24, "cm²"),
        q("Een sector van 72° in een cirkel met r = 10 cm. Oppervlakte?", 62.8, "cm²"),
        q("Een kegel heeft grondvlak 28,26 cm² en hoogte 15 cm. Volume?", 141.3, "cm³"),
        q("Een bol heeft diameter 10 cm. Volume bij π = 3,14?", 523.33, "cm³"),
        q("Een halve bol heeft straal 6 cm. Volume bij π = 3,14?", 452.16, "cm³"),
        q("Een cirkelring heeft oppervlakte 75,36 cm² en binnenstraal 3 cm. Buitenstraal?", Math.sqrt(33), "cm"),
        mc(category, "Welke transformatie behoudt vorm én grootte?", ["translatie", "vergroting", "projectie", "perspectief"], "translatie"),
        mc(category, "Welke transformatie keert een figuur om langs een lijn?", ["spiegeling", "translatie", "homothetie", "projectie"], "spiegeling"),
        mc(category, "Bij een rotatie van 360° komt een figuur…", ["op zichzelf terecht", "op halve grootte", "gespiegeld terecht", "niet terug"], "op zichzelf terecht"),
        mc(category, "Een driehoek met zijden 5, 12 en 13 is…", ["rechthoekig", "gelijkzijdig", "stomphoekig", "onmogelijk"], "rechthoekig"),
        q("Afstand tussen punten (1, 2) en (4, 6)?", 5),
        { category, question: "Spiegel punt (3, -2) in de y-as.", answer: ["(-3, -2)", "-3,-2"] },
        { category, question: "Verplaats punt (2, 5) met vector (4, -3).", answer: ["(6, 2)", "6,2"] },
        q("Een rechthoekige driehoek heeft schuine zijde 17 cm en één rechthoekszijde 8 cm. Andere zijde?", 15, "cm"),
      ];
    case 5:
      return [
        q("Rechthoek met oppervlakte 192 cm² en breedte 12 cm: omtrek?", 56, "cm"),
        q("Gelijkbenige driehoek met basis 10 cm en benen 13 cm: hoogte?", 12, "cm"),
        q("Cilinder volume 314 cm³, r = 5 cm, π = 3,14: hoogte?", 4, "cm"),
        q("Binnenhoek van een regelmatige twaalfhoek?", 150, "°"),
        q("Schaalfactor 3: oppervlaktefactor?", 9),
        q("Schaalfactor 3: volumefactor?", 27),
        q("Een model is 8 cm lang op schaal 1 : 50. Werkelijke lengte?", 4, "m"),
        q("Een planoppervlakte is 24 cm² op schaal 1 : 100. Werkelijke oppervlakte?", 240, "m²"),
        q("Een kubus wordt vergroot met factor 1,5. Het oorspronkelijke volume is 64 cm³. Nieuw volume?", 216, "cm³"),
        q("Een cirkel wordt vergroot van straal 4 cm naar 10 cm. Oppervlaktefactor?", 6.25),
        mc(category, "Welke formule hoort bij de oppervlakte van een cirkel?", ["πr²", "2πr", "πd", "r²/π"], "πr²"),
        mc(category, "Bij schaal 1 : 200 is 1 cm op de tekening werkelijk…", ["2 m", "20 m", "200 m", "0,2 m"], "2 m"),
        mc(category, "Een vergroting met factor 0,5 maakt de oppervlakte…", ["vier keer kleiner", "twee keer kleiner", "gelijk", "acht keer kleiner"], "vier keer kleiner"),
        q("Een regelmatige tienhoek heeft hoeveel diagonalen?", 35),
        q("Som binnenhoeken van een regelmatige negenhoek?", 1260, "°"),
        q("Een cilinder heeft diameter 10 cm en hoogte 12 cm. Volume bij π = 3,14?", 942, "cm³"),
        q("Een kegel heeft hetzelfde grondvlak en dezelfde hoogte als een cilinder van 600 cm³. Volume kegel?", 200, "cm³"),
        q("Een vierkante piramide heeft grondvlakzijde 9 cm en hoogte 12 cm. Volume?", 324, "cm³"),
      ];
    case 6:
      return [
        q("Rechthoek: lengte is 4 cm groter dan breedte en omtrek is 52 cm. Oppervlakte?", 165, "cm²"),
        q("Driehoek: oppervlakte 84 cm² en basis 14 cm. Hoogte?", 12, "cm"),
        q("Kegel: volume 100π cm³ en straal 5 cm. Hoogte?", 12, "cm"),
        q("Sector 72° in cirkel r = 10 cm, π = 3,14: oppervlakte?", 62.8, "cm²"),
        q("Ruimtediagonaal van een balk 3 × 4 × 12 cm?", 13, "cm"),
        q("Schaalfactor 2,5: volumefactor?", 15.625),
        q("Een bol heeft volume 904,32 cm³ bij π = 3,14. Straal?", 6, "cm"),
        q("Een cilinder en kegel hebben hetzelfde grondvlak en hoogte. Cilinderinhoud 450 cm³. Kegelinhoud?", 150, "cm³"),
        q("Een rechthoekige driehoek heeft oppervlakte 60 cm² en één rechthoekszijde 8 cm. Andere rechthoekszijde?", 15, "cm"),
        q("Een trapezium heeft oppervlakte 120 cm², hoogte 8 cm en grote basis 18 cm. Kleine basis?", 12, "cm"),
        mc(category, "Schaalfactor 2,5 geeft welke volumefactor?", ["2,5", "5", "6,25", "15,625"], "15,625"),
        mc(category, "Welke formule geeft de ruimtediagonaal van een balk?", ["√(l²+b²+h²)", "l+b+h", "l×b×h", "2(l+b+h)"], "√(l²+b²+h²)"),
        mc(category, "Een doorsnede evenwijdig aan het grondvlak van een prisma is…", ["gelijkvormig aan het grondvlak", "altijd een cirkel", "altijd kleiner", "een lijn"], "gelijkvormig aan het grondvlak"),
        q("Een regelmatige veelhoek heeft binnenhoek 156°. Aantal zijden?", 15),
        q("Een cirkel heeft koorde 16 cm op afstand 6 cm van het middelpunt. Straal?", 10, "cm"),
        q("Een piramide heeft volume 240 cm³ en grondvlak 60 cm². Hoogte?", 12, "cm"),
        q("Een bol wordt vergroot met factor 2. Het oorspronkelijke volume is 75 cm³. Nieuw volume?", 600, "cm³"),
        q("Een cilinder heeft manteloppervlakte 188,4 cm², straal 5 cm. Hoogte?", 6, "cm"),
      ];
    case 7:
      return [
        { category, question: "Rechthoek met oppervlakte 96 cm² en lengte 4 cm groter dan breedte. Afmetingen?", answer: ["8 en 12", "8 cm en 12 cm"] },
        q("Regelmatige vijfhoek: som binnenhoeken?", 540, "°"),
        q("Piramide met grondvlak 36 cm² en hoogte 10 cm: volume?", 120, "cm³"),
        q("Afstand tussen A(-2, 3) en B(4, 11)?", 10),
        { category, question: "Midden van lijnstuk met eindpunten (2, 5) en (8, -1)?", answer: ["(5, 2)", "5,2"] },
        q("Helling van de lijn door (1, 2) en (5, 10)?", 2),
        { category, question: "Vergelijking van een lijn met helling 3 en y-as-snede -2?", answer: ["y = 3x - 2", "y=3x-2"] },
        q("Oppervlakte driehoek met coördinaten (0,0), (8,0) en (3,6)?", 24),
        q("Cirkel met vergelijking x² + y² = 25: diameter?", 10),
        q("Cirkel met middelpunt (2,-1) en straal 4: oppervlakte bij π = 3,14?", 50.24),
        mc(category, "Welke hoek hoort bij loodrechte lijnen?", ["45°", "60°", "90°", "180°"], "90°"),
        mc(category, "Twee lijnen met dezelfde helling zijn…", ["evenwijdig", "loodrecht", "snijdend onder 45°", "cirkels"], "evenwijdig"),
        mc(category, "Hellingen 2 en -1/2 horen bij lijnen die…", ["loodrecht staan", "evenwijdig zijn", "samenvallen", "geen verband hebben"], "loodrecht staan"),
        q("Een cilinder met r = 4 cm en h = 9 cm: totale oppervlakte bij π = 3,14?", 326.56, "cm²"),
        q("Een kegel met r = 5 cm, schuine hoogte 13 cm: manteloppervlakte bij π = 3,14?", 204.1, "cm²"),
        q("Een afgeknotte figuur heeft parallelle vierkante vlakken 10² en 6² cm². Eenvoudig gemiddelde van beide oppervlakten?", 68, "cm²"),
        q("Een regelmatige vijfhoek heeft hoeveel diagonalen?", 5),
        q("Een twaalfhoek heeft hoeveel diagonalen?", 54),
      ];
    case 8:
      return [
        q("Rechthoek met oppervlakte 432 cm² en verhouding lengte:breedte = 3:2. Omtrek?", 60, "cm"),
        q("Een driehoek heeft zijden 13, 14 en 15 cm. Oppervlakte volgens Heron?", 84, "cm²"),
        q("Een koorde van 24 cm ligt 5 cm van het middelpunt. Straal?", 13, "cm"),
        q("Een cirkelsector heeft straal 12 cm en hoek 150°. Oppervlakte bij π = 3,14?", 188.4, "cm²"),
        q("Een cilinder is ingeschreven in een kubus met ribbe 10 cm. Cilindervolume bij π = 3,14?", 785, "cm³"),
        q("Een bol is ingeschreven in een kubus met ribbe 12 cm. Bolvolume bij π = 3,14?", 904.32, "cm³"),
        q("Afstand van punt (3,4) tot de oorsprong?", 5),
        q("Afstand tussen parallelle lijnen y = 2 en y = -5?", 7),
        { category, question: "Spiegel punt (4,-3) in de lijn y = x.", answer: ["(-3, 4)", "-3,4"] },
        { category, question: "Roteer punt (2,5) 90° tegenwijzerszin rond de oorsprong.", answer: ["(-5, 2)", "-5,2"] },
        mc(category, "Welke vergelijking beschrijft een cirkel met middelpunt (3,-2) en straal 5?", ["(x-3)²+(y+2)²=25", "(x+3)²+(y-2)²=25", "x²+y²=5", "(x-3)+(y+2)=25"], "(x-3)²+(y+2)²=25"),
        mc(category, "Een raaklijn aan een cirkel staat in het raakpunt…", ["loodrecht op de straal", "evenwijdig aan de straal", "onder 45°", "op het middelpunt"], "loodrecht op de straal"),
        q("Een regelmatige 18-hoek heeft één binnenhoek van hoeveel graden?", 160, "°"),
        q("Een kegel heeft r = 6 cm en h = 8 cm. Schuine hoogte?", 10, "cm"),
        q("Totale oppervlakte van die kegel bij π = 3,14?", 301.44, "cm²"),
        q("Een piramide heeft vierkant grondvlak 14 × 14 cm en hoogte 9 cm. Volume?", 588, "cm³"),
        q("Een bolschil heeft buitenstraal 5 cm en binnenstraal 4 cm. Volume bij π = 3,14?", 255.41, "cm³"),
        q("Een figuur wordt verkleind zodat de oppervlakte 36% wordt. Lineaire schaalfactor?", 0.6),
      ];
    case 9:
      return [
        q("Een rechthoekige driehoek heeft schuine zijde 25 cm en één zijde 7 cm. Andere zijde?", 24, "cm"),
        q("In een rechthoekige driehoek is tan(hoek) = 3/4. Als aanliggende zijde 20 cm is, overstaande zijde?", 15, "cm"),
        q("Een ladder van 10 m staat 6 m van een muur. Hoogte tegen de muur?", 8, "m"),
        q("Een helling stijgt 3 m over een horizontale afstand van 12 m. Helling in procent?", 25, "%"),
        q("Een sector heeft booglengte 10π en straal 15. Hoek in graden?", 120, "°"),
        q("Een cirkel heeft oppervlakte 49π. Omtrek?", 14 * Math.PI),
        q("Een bol heeft oppervlakte 144π. Straal?", 6),
        q("Een cilinder heeft volume 500π en hoogte 20. Straal?", 5),
        q("Een kegel heeft volume 96π en hoogte 8. Straal?", 6),
        q("Een regelmatige veelhoek heeft 44 diagonalen. Aantal zijden?", 11),
        mc(category, "Welke verhouding is sin(α) in een rechthoekige driehoek?", ["overstaande/schuine", "aanliggende/schuine", "overstaande/aanliggende", "schuine/overstaande"], "overstaande/schuine"),
        mc(category, "Welke verhouding is cos(α)?", ["aanliggende/schuine", "overstaande/schuine", "overstaande/aanliggende", "schuine/aanliggende"], "aanliggende/schuine"),
        mc(category, "Welke verhouding is tan(α)?", ["overstaande/aanliggende", "aanliggende/overstaande", "schuine/aanliggende", "overstaande/schuine"], "overstaande/aanliggende"),
        q("Een rechthoek heeft diagonaal 26 cm en breedte 10 cm. Lengte?", 24, "cm"),
        q("Een gelijkzijdige driehoek heeft zijde 12 cm. Hoogte afgerond op 2 decimalen?", 6 * Math.sqrt(3), "cm"),
        q("Oppervlakte van die gelijkzijdige driehoek?", 36 * Math.sqrt(3), "cm²"),
        q("Een punt ligt op afstand 13 van de oorsprong en heeft x = 5. Positieve y-coördinaat?", 12),
        q("Midden en straal van x²+y²-6x+8y=0: straal?", 5),
      ];
    case 10:
    default:
      return [
        q("Afstand tussen punten A(-3,4) en B(9,-1)?", 13),
        { category, question: "Midden van A(-4,7) en B(8,-5)?", answer: ["(2, 1)", "2,1"] },
        q("Helling door A(-2,3) en B(4,15)?", 2),
        { category, question: "Vergelijking van de lijn door (0,5) met helling -3?", answer: ["y = -3x + 5", "y=-3x+5"] },
        q("Afstand van punt (6,8) tot de oorsprong?", 10),
        q("Oppervlakte van driehoek met punten (1,1), (7,1), (4,9)?", 24),
        q("Straal van cirkel (x-4)²+(y+3)²=49?", 7),
        { category, question: "Middelpunt van cirkel x²+y²-8x+6y-11=0?", answer: ["(4, -3)", "4,-3"] },
        q("Straal van cirkel x²+y²-8x+6y-11=0?", 6),
        q("Een raaklijn vanuit een punt op 13 cm van het middelpunt aan een cirkel met straal 5 cm. Lengte raaklijn?", 12, "cm"),
        mc(category, "De middelloodlijn van een koorde gaat altijd door…", ["het middelpunt", "een raakpunt", "de oorsprong", "geen vast punt"], "het middelpunt"),
        mc(category, "Welke transformatie met factor -2 rond de oorsprong combineert…", ["puntspiegeling en vergroting", "translatie en rotatie", "alleen verkleining", "projectie"], "puntspiegeling en vergroting"),
        mc(category, "Twee gelijkvormige lichamen hebben schaalfactor k. Hun volumes verhouden zich als…", ["k³", "k²", "k", "2k"], "k³"),
        q("Een kegel heeft straal 9 cm en hoogte 12 cm. Schuine hoogte?", 15, "cm"),
        q("Manteloppervlakte van die kegel bij π = 3,14?", 423.9, "cm²"),
        q("Een afgeknotte kegel heeft R=6, r=3, h=4. Schuine hoogte?", 5, "cm"),
        q("Manteloppervlakte van die afgeknotte kegel bij π = 3,14?", 141.3, "cm²"),
        q("Een bol met straal 3 cm wordt vergroot tot straal 7,5 cm. Volumefactor?", 15.625),
      ];
  }
}
