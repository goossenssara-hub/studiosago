import { acceptedNumber, mc, type ExerciseInput, type Random } from "./shared";

export function generateMeetkunde(level: number, _random: Random): ExerciseInput[] {
  const category = `Meetkunde · niveau ${level}`;
  const banks: Record<number, ExerciseInput[]> = {
    1: [
      { category, question: "Rechthoek 18 cm bij 12 cm: omtrek?", answer: acceptedNumber(60, "cm") },
      { category, question: "Rechthoek 18 cm bij 12 cm: oppervlakte?", answer: acceptedNumber(216, "cm²") },
      { category, question: "Driehoek basis 14 cm, hoogte 9 cm: oppervlakte?", answer: acceptedNumber(63, "cm²") },
      mc(category, "Derde hoek bij 48° en 67°?", ["55°", "65°", "75°", "85°"], "65°"),
      { category, question: "Vierkant met oppervlakte 144 cm²: omtrek?", answer: acceptedNumber(48, "cm") },
      { category, question: "Balk 8 × 5 × 4 cm: volume?", answer: acceptedNumber(160, "cm³") },
    ],
    2: [
      { category, question: "Parallellogram basis 16 cm, hoogte 7 cm: oppervlakte?", answer: acceptedNumber(112, "cm²") },
      { category, question: "Trapezium met evenwijdige zijden 8 en 14 cm, hoogte 6 cm: oppervlakte?", answer: acceptedNumber(66, "cm²") },
      { category, question: "Cirkel straal 7 cm, π=22/7: omtrek?", answer: acceptedNumber(44, "cm") },
      { category, question: "Cirkel straal 7 cm, π=22/7: oppervlakte?", answer: acceptedNumber(154, "cm²") },
      mc(category, "Welke driehoek heeft drie gelijke zijden?", ["gelijkzijdige", "gelijkbenige", "rechthoekige", "stomphoekige"], "gelijkzijdige"),
      { category, question: "Kubus ribbe 6 cm: totale oppervlakte?", answer: acceptedNumber(216, "cm²") },
    ],
    3: [
      { category, question: "Samengestelde figuur: rechthoek 12×8 min rechthoek 4×3. Oppervlakte?", answer: acceptedNumber(84, "cm²") },
      { category, question: "Een regelmatige zeshoek heeft zijde 5 cm. Omtrek?", answer: acceptedNumber(30, "cm") },
      { category, question: "Buitenhoek van regelmatige achthoek?", answer: acceptedNumber(45, "°") },
      { category, question: "Cilinder r=3 cm, h=10 cm, π=3,14: volume?", answer: acceptedNumber(282.6, "cm³") },
      mc(category, "Som van binnenhoeken vierhoek?", ["180°", "270°", "360°", "540°"], "360°"),
      { category, question: "Diagonaal rechthoek 6 bij 8 cm?", answer: acceptedNumber(10, "cm") },
    ],
    4: [
      { category, question: "Driehoek zijden 9, 12, 15. Is hij rechthoekig?", answer: "ja" },
      { category, question: "Kegel r=3, h=12, π=3,14: volume?", answer: acceptedNumber(113.04, "cm³") },
      { category, question: "Bol r=3, π=3,14: volume?", answer: acceptedNumber(113.04, "cm³") },
      { category, question: "Boog van 90° in cirkel r=8, π=3,14: lengte?", answer: acceptedNumber(12.56, "cm") },
      mc(category, "Welke transformatie behoudt vorm én grootte?", ["translatie", "vergroting", "projectie", "perspectief"], "translatie"),
      { category, question: "Oppervlakte ring R=5, r=3, π=3,14?", answer: acceptedNumber(50.24, "cm²") },
    ],
    5: [
      { category, question: "Rechthoek oppervlakte 192 cm², breedte 12 cm: omtrek?", answer: acceptedNumber(56, "cm") },
      { category, question: "Gelijkbenige driehoek basis 10, benen 13: hoogte?", answer: acceptedNumber(12, "cm") },
      { category, question: "Cilinder volume 314 cm³, r=5, π=3,14: hoogte?", answer: acceptedNumber(4, "cm") },
      { category, question: "Binnenhoek regelmatige twaalfhoek?", answer: acceptedNumber(150, "°") },
      mc(category, "Welke formule hoort bij oppervlakte cirkel?", ["πr²", "2πr", "πd", "r²/π"], "πr²"),
      { category, question: "Schaalfactor 3: oppervlaktefactor?", answer: "9" },
    ],
    6: [
      { category, question: "Rechthoek lengte 4 cm groter dan breedte, omtrek 52. Oppervlakte?", answer: acceptedNumber(165, "cm²") },
      { category, question: "Driehoek oppervlakte 84, basis 14. Hoogte?", answer: acceptedNumber(12, "cm") },
      { category, question: "Kegel volume 100π, r=5. Hoogte?", answer: acceptedNumber(12, "cm") },
      { category, question: "Sector 72° in cirkel r=10, π=3,14: oppervlakte?", answer: acceptedNumber(62.8, "cm²") },
      mc(category, "Schaalfactor 2,5: volumefactor?", ["2,5", "5", "6,25", "15,625"], "15,625"),
      { category, question: "Ruimtediagonaal balk 3×4×12?", answer: acceptedNumber(13, "cm") },
    ],
    7: [
      { category, question: "Rechthoek oppervlakte 96, lengte 4 meer dan breedte. Afmetingen?", answer: ["8 en 12", "8 m en 12 m"] },
      { category, question: "Regelmatige vijfhoek: som binnenhoeken?", answer: acceptedNumber(540, "°") },
      { category, question: "Frustum-opgave: groot vlak 10², klein vlak 6², hoogte 12. Gemiddelde doorsnede eenvoudig?", answer: acceptedNumber(68, "cm²") },
      { category, question: "Cirkelvergelijking straal 5: diameter?", answer: acceptedNumber(10, "cm") },
      mc(category, "Welke hoek hoort bij loodrechte lijnen?", ["45°", "60°", "90°", "180°"], "90°"),
      { category, question: "Piramide grondvlak 36 cm², hoogte 10 cm: volume?", answer: acceptedNumber(120, "cm³") },
    ],
    8: [
      { category, question: "Rechthoek oppervlakte 432, lengte 6 meer dan breedte. Omtrek?", answer: acceptedNumber(84, "m") },
      { category, question: "Driehoek zijden 13,14,15: oppervlakte?", answer: acceptedNumber(84, "cm²") },
      { category, question: "Boloppervlakte r=6, π=3,14?", answer: acceptedNumber(452.16, "cm²") },
      { category, question: "Cilinder en kegel zelfde grondvlak/hoogte. Cilinder is hoeveel keer volume kegel?", answer: "3" },
      mc(category, "Bij gelijkvormigheid factor 4, omtrekfactor?", ["4", "8", "16", "64"], "4"),
      { category, question: "Afstand tussen (1,2) en (7,10)?", answer: acceptedNumber(10) },
    ],
    9: [
      { category, question: "Rechthoek diagonaal 25, breedte 15. Lengte?", answer: acceptedNumber(20, "cm") },
      { category, question: "Sector 135°, r=8, π=3,14: booglengte?", answer: acceptedNumber(18.84, "cm") },
      { category, question: "Kegel mantel met r=5, schuine hoogte 13, π=3,14?", answer: acceptedNumber(204.1, "cm²") },
      { category, question: "Piramide vierkant grondvlak zijde 9, h=12: volume?", answer: acceptedNumber(324, "cm³") },
      mc(category, "Welke stelling gebruik je voor een rechthoekige driehoek?", ["Pythagoras", "Thales", "Euler", "Pascal"], "Pythagoras"),
      { category, question: "Middenpunt van (2,5) en (8,11)?", answer: ["(5,8)", "5,8"] },
    ],
    10: [
      { category, question: "Lengte = 3×breedte - 4, omtrek 72. Oppervlakte?", answer: acceptedNumber(243, "cm²") },
      { category, question: "Snijlijn cirkel door middelpunt heet?", answer: "diameter" },
      { category, question: "Bolvolume r=6, π=3,14?", answer: acceptedNumber(904.32, "cm³") },
      { category, question: "Afstand punt (4,7) tot lijn y=1?", answer: "6" },
      mc(category, "Welke schaalfactor geeft oppervlaktefactor 49?", ["5", "6", "7", "14"], "7"),
      { category, question: "Rechte door (0,3) en (4,11): richtingscoëfficiënt?", answer: "2" },
    ],
  };
  return banks[level];
}
