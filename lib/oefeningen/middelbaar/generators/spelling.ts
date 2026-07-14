import { mc, type ExerciseInput, type Random } from "./shared";

const banks = [
  ["Hij wordt morgen zestien.", "Word jij ook uitgenodigd?", "De leerling beantwoordt de vraag."],
  ["Gisteren verhuisde zij naar Gent.", "De wedstrijd eindigde onverwacht.", "Hij downloadde het bestand."],
  ["De geüpdatete planning werd verspreid.", "Zij heeft de resultaten geanalyseerd.", "Het besluit beïnvloedt iedereen."],
  ["Omdat hij zich vergiste, verbeterde hij zijn antwoord.", "Het gebeurt vaker dan je verwacht.", "Wordt het verslag morgen ingediend?"],
  ["De docent antwoordde dat de opdracht gewijzigd werd.", "Hij heeft de tekst herschreven.", "De leerling vermoedde dat er iets ontbrak."],
  ["De geëvalueerde resultaten werden gepubliceerd.", "Zij heeft zich aan de afspraak gehouden.", "Het geüploade bestand was beschadigd."],
  ["Hoewel hij het ontkende, werd de fout bevestigd.", "De organisatie coördineert het project.", "De beïnvloede groep reageerde kritisch."],
  ["De commissie beoordeelt of de maatregel gerechtvaardigd is.", "Het onderzoek wordt voortdurend geactualiseerd.", "Hij nuanceerde zijn eerdere uitspraak."],
  ["De wetenschapper veronderstelde dat de hypothese weerlegd zou worden.", "De gegevens zijn systematisch gecategoriseerd.", "Het rapport vermeldt meerdere uitzonderingen."],
  ["Hoewel de conclusie zorgvuldig geformuleerd werd, bleven enkele veronderstellingen onbewezen.", "De geïnterviewde deelnemers reageerden genuanceerd.", "Het beleid wordt periodiek geëvalueerd en bijgestuurd."],
] as const;

export function generateSpelling(level: number, _random: Random): ExerciseInput[] {
  const category = `Spelling · niveau ${level}`;
  const s = banks[level - 1];

  return [
    { category, question: `Schrijf foutloos over: ${s[0]}`, answer: s[0] },
    { category, question: `Schrijf foutloos over: ${s[1]}`, answer: s[1] },
    { category, question: `Schrijf foutloos over: ${s[2]}`, answer: s[2] },
    mc(category, "Welke zin is correct gespeld?", ["Hij vindt dat het verandert.", "Hij vind dat het verandert.", "Hij vindt dat het veranderd.", "Hij vinddt dat het verandert."], "Hij vindt dat het verandert."),
    mc(category, "Waar staan de leestekens correct?", ["Sara vroeg: ‘Kom je morgen?’", "Sara vroeg ‘Kom je morgen’?", "Sara vroeg; ‘Kom je morgen?’", "Sara vroeg, ‘Kom je morgen’."], "Sara vroeg: ‘Kom je morgen?’"),
    { category, question: level < 6 ? "Vul correct in: Morgen ___ de resultaten bekendgemaakt. (worden)" : "Vul correct in: Het verslag is gisteren volledig ___. (herwerken)", answer: level < 6 ? "worden" : "herwerkt" },
  ];
}
