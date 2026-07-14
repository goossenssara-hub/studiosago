import { mc, shuffle, type ExerciseInput, type Random } from "./shared";

type Choice = readonly [question: string, options: readonly string[], answer: string];
type Correction = readonly [wrong: string, correct: string];

type LevelBank = {
  focus: string;
  copy: readonly string[];
  choices: readonly Choice[];
  corrections: readonly Correction[];
};

const levels: readonly LevelBank[] = [
  {
    focus: "hoofdletters, leestekens en eenvoudige werkwoorden",
    copy: [
      "Morgen begint de sportdag om negen uur.",
      "Waar ligt mijn blauwe pennenzak?",
      "Sara en Noor fietsen samen naar school.",
      "In juli reizen we naar Frankrijk.",
      "De directeur verwelkomt de nieuwe leerlingen.",
      "Mijn broer wordt morgen twaalf jaar.",
      "Heb jij je agenda al ingevuld?",
      "Op maandag hebben we Nederlands en wiskunde.",
    ],
    choices: [
      ["Welke zin is correct geschreven?", ["morgen gaan we naar Hasselt.", "Morgen gaan we naar hasselt.", "Morgen gaan we naar Hasselt.", "morgen gaan we naar hasselt."], "Morgen gaan we naar Hasselt."],
      ["Welke zin eindigt met het juiste leesteken?", ["Wanneer begint de les.", "Wanneer begint de les?", "Wanneer begint de les!", "Wanneer begint de les,"], "Wanneer begint de les?"],
      ["Kies de juiste vorm: Hij ___ elke dag naar school. (fietsen)", ["fiets", "fietst", "fietsd", "fietstt"], "fietst"],
      ["Kies de juiste vorm: Ik ___ mijn boek. (pakken)", ["pakt", "pak", "pakk", "pakd"], "pak"],
      ["Welke schrijfwijze is correct?", ["woensdag", "Woensdag", "woens-dag", "woensdaag"], "woensdag"],
      ["Welke zin heeft de juiste hoofdletters?", ["Wij wonen in België.", "wij wonen in België.", "Wij wonen in belgië.", "wij wonen in belgië."], "Wij wonen in België."],
      ["Kies het juiste meervoud van ‘boek’.", ["boeks", "boeken", "boeke", "boekken"], "boeken"],
      ["Kies het juiste meervoud van ‘klas’.", ["klasen", "klasssen", "klassen", "klasses"], "klassen"],
      ["Welke zin is correct?", ["Jij word morgen twaalf.", "Jij wordt morgen twaalf.", "Jij wort morgen twaalf.", "Jij worddt morgen twaalf."], "Jij wordt morgen twaalf."],
      ["Waar staan de leestekens correct?", ["Wat een mooie tekening!", "Wat een mooie tekening?", "Wat een mooie tekening,", "Wat een mooie tekening."], "Wat een mooie tekening!"],
    ],
    corrections: [
      ["mijn zus heet Emma.", "Mijn zus heet Emma."],
      ["Kom je morgen mee.", "Kom je morgen mee?"],
      ["Hij loop naar de bus.", "Hij loopt naar de bus."],
      ["Wij woonen in Peer.", "Wij wonen in Peer."],
      ["De hond blafd luid.", "De hond blaft luid."],
      ["Op Vrijdag zwemmen we.", "Op vrijdag zwemmen we."],
    ],
  },
  {
    focus: "lange en korte klinkers, meervouden en tegenwoordige tijd",
    copy: [
      "De katten slapen op zachte kussens.",
      "Gisteren tekende ik twee grote bomen.",
      "De leerling rekent zorgvuldig verder.",
      "Mijn oma bakt heerlijke pannenkoeken.",
      "Jullie antwoorden staan in het schrift.",
      "De paarden lopen door de groene weide.",
      "Hij verhuist volgende maand naar Gent.",
      "De wedstrijd eindigt om kwart over vier.",
    ],
    choices: [
      ["Kies de juiste schrijfwijze.", ["ramen", "rammen", "raamen", "raamen"], "ramen"],
      ["Kies het juiste meervoud van ‘kat’.", ["katen", "katten", "kats", "kattenn"], "katten"],
      ["Kies de juiste vorm: Zij ___ haar taak. (maken)", ["maak", "maakt", "maakd", "maakte"], "maakt"],
      ["Kies de juiste vorm: Wij ___ de oefening. (herhalen)", ["herhaalt", "herhalen", "herhaald", "herhaalen"], "herhalen"],
      ["Welke schrijfwijze is correct?", ["bomen", "bommen", "boomen", "boomen"], "bomen"],
      ["Welke zin is correct?", ["De jongen tekent een kaart.", "De jongen tekend een kaart.", "De jongen teken een kaart.", "De jongen tekendt een kaart."], "De jongen tekent een kaart."],
      ["Kies het juiste meervoud van ‘brief’.", ["briefen", "brieven", "briefs", "brievenn"], "brieven"],
      ["Kies de juiste schrijfwijze.", ["verhuisde", "verhuizde", "verhuistte", "verhuisdde"], "verhuisde"],
      ["Welke vorm past? Jij ___ snel. (rekenen)", ["rekent", "reken", "rekend", "rekendt"], "rekent"],
      ["Welke zin is correct gespeld?", ["De kinderen spelen buiten.", "De kindderen spelen buiten.", "De kinderen speelen buiten.", "De kindere spelen buiten."], "De kinderen spelen buiten."],
    ],
    corrections: [
      ["De maanen schijnen helder.", "De manen schijnen helder."],
      ["Hij werk elke avond.", "Hij werkt elke avond."],
      ["De paarden draaven snel.", "De paarden draven snel."],
      ["Wij maaken onze taak.", "Wij maken onze taak."],
      ["Zij antwoort vriendelijk.", "Zij antwoordt vriendelijk."],
      ["De buss stopt voor school.", "De bus stopt voor school."],
    ],
  },
  {
    focus: "d, t en dt in de tegenwoordige tijd",
    copy: [
      "Hij vindt de nieuwe opdracht interessant.",
      "Word jij morgen door je vader gebracht?",
      "De leerling beantwoordt alle vragen.",
      "Jij houdt je schrift netjes bij.",
      "De leraar vermeldt de deadline op het bord.",
      "Wat gebeurt er tijdens de pauze?",
      "Mijn zus rijdt elke dag met de fiets.",
      "Je verwacht een duidelijk antwoord.",
    ],
    choices: [
      ["Kies de juiste vorm: Hij ___ de oplossing. (vinden)", ["vind", "vindt", "vint", "vinddt"], "vindt"],
      ["Kies de juiste vorm: ___ jij morgen zestien? (worden)", ["Word", "Wordt", "Wort", "Worddt"], "Word"],
      ["Kies de juiste vorm: Jij ___ goed op. (letten)", ["let", "lett", "letd", "led"], "let"],
      ["Welke zin is correct?", ["Hij antwoord op de vraag.", "Hij antwoordt op de vraag.", "Hij antwoort op de vraag.", "Hij antwoorddt op de vraag."], "Hij antwoordt op de vraag."],
      ["Kies de juiste vorm: De bus ___ om acht uur. (vertrekken)", ["vertrek", "vertrekt", "vertrekd", "vertrektd"], "vertrekt"],
      ["Welke zin is correct?", ["Jij vindt dit moeilijk.", "Jij vind dit moeilijk.", "Jij vinddt dit moeilijk.", "Jij vint dit moeilijk."], "Jij vindt dit moeilijk."],
      ["Kies de juiste vorm: Wat ___ er nu? (gebeuren)", ["gebeurd", "gebeurt", "gebeurdtt", "gebeur"], "gebeurt"],
      ["Kies de juiste vorm: Je ___ het verslag vandaag. (versturen)", ["verstuurd", "verstuurt", "verstuurdt", "verstuur"], "verstuurt"],
      ["Welke zin is correct?", ["Rijd jij mee?", "Rijdt jij mee?", "Rijt jij mee?", "Rijtd jij mee?"], "Rijd jij mee?"],
      ["Kies de juiste vorm: Hij ___ zijn fiets goed. (onderhouden)", ["onderhoud", "onderhoudt", "onderhoudtt", "onderhout"], "onderhoudt"],
    ],
    corrections: [
      ["Hij vind zijn sleutel niet.", "Hij vindt zijn sleutel niet."],
      ["Wordt jij ook uitgenodigd?", "Word jij ook uitgenodigd?"],
      ["De leerling beantwoord de vraag.", "De leerling beantwoordt de vraag."],
      ["Wat gebeurd er morgen?", "Wat gebeurt er morgen?"],
      ["Jij houd je aan de afspraak.", "Jij houdt je aan de afspraak."],
      ["Hij rijd voorzichtig.", "Hij rijdt voorzichtig."],
    ],
  },
  {
    focus: "verleden tijd en voltooid deelwoord",
    copy: [
      "Gisteren verbeterde hij zijn antwoord.",
      "De leerlingen hebben aandachtig geluisterd.",
      "Zij verhuisde vorige zomer naar Antwerpen.",
      "Het verslag werd gisteren ingediend.",
      "We hebben de route zorgvuldig gepland.",
      "De leraar vertelde een boeiend verhaal.",
      "De wedstrijd eindigde onverwacht.",
      "Hij heeft zijn fiets gerepareerd.",
    ],
    choices: [
      ["Kies de juiste verleden tijd van ‘werken’.", ["werkte", "werkde", "werktee", "gewerkt"], "werkte"],
      ["Kies het juiste voltooid deelwoord van ‘maken’.", ["gemaakt", "gemaken", "gemaakd", "maakt"], "gemaakt"],
      ["Kies de juiste verleden tijd van ‘verhuizen’.", ["verhuisde", "verhuizde", "verhuiste", "geverhuisd"], "verhuisde"],
      ["Welke zin is correct?", ["Hij heeft geantwoord.", "Hij heeft geantwoort.", "Hij heeft geantwoordt.", "Hij heeft antwoord."], "Hij heeft geantwoord."],
      ["Kies het juiste voltooid deelwoord van ‘bestellen’.", ["bestelt", "besteld", "gebesteld", "bestelld"], "besteld"],
      ["Kies de juiste vorm: De les is om vier uur ___. (eindigen)", ["geëindigt", "geëindigd", "geeindigd", "eindigde"], "geëindigd"],
      ["Welke vorm is correct?", ["gebeurd", "gebeurt", "gebeurdt", "gebuurt"], "gebeurd"],
      ["Kies de juiste verleden tijd van ‘reizen’.", ["reisde", "reiste", "gereisd", "reizde"], "reisde"],
      ["Welke zin is correct?", ["Zij heeft de tekst verbeterd.", "Zij heeft de tekst verbetert.", "Zij heeft de tekst verbeterdt.", "Zij heeft de tekst geverbeterd."], "Zij heeft de tekst verbeterd."],
      ["Kies het juiste voltooid deelwoord van ‘downloaden’.", ["gedownload", "gedownloadt", "gedownloadd", "downloadde"], "gedownload"],
    ],
    corrections: [
      ["Hij heeft de taak gemaakd.", "Hij heeft de taak gemaakt."],
      ["De wedstrijd is geëindigt.", "De wedstrijd is geëindigd."],
      ["Zij antwoorde meteen.", "Zij antwoordde meteen."],
      ["We hebben lang gewachtt.", "We hebben lang gewacht."],
      ["Het pakket werd verstuurt.", "Het pakket werd verstuurd."],
      ["Hij heeft de tekst verandert.", "Hij heeft de tekst veranderd."],
    ],
  },
  {
    focus: "tussenletters, samenstellingen en afleidingen",
    copy: [
      "De pannenkoekenbakker opent vroeg.",
      "Het paardenbloemzaad verspreidt zich snel.",
      "De stationsstraat wordt opnieuw aangelegd.",
      "Zij draagt een donkerblauwe regenjas.",
      "De klas bespreekt het klimaatbeleid.",
      "Het woordenboek ligt op de boekenkast.",
      "De gemeenteraad neemt een beslissing.",
      "Zijn verantwoordelijkheid is duidelijk omschreven.",
    ],
    choices: [
      ["Welke samenstelling is correct?", ["pannekoek", "pannenkoek", "panneskoek", "panne-koek"], "pannenkoek"],
      ["Welke schrijfwijze is correct?", ["paardebloem", "paardenbloem", "paardensbloem", "paarde-bloem"], "paardenbloem"],
      ["Kies de juiste samenstelling.", ["stationsstraat", "stationstraat", "station'sstraat", "stations straat"], "stationsstraat"],
      ["Welke schrijfwijze is correct?", ["klimaat beleid", "klimaat-beleid", "klimaatbeleid", "klimaatsbeleid"], "klimaatbeleid"],
      ["Kies het juiste woord.", ["verantwoordelijkheid", "verantwoordlijkheid", "verantwoordelikheid", "verantwoordelijk heid"], "verantwoordelijkheid"],
      ["Welke samenstelling is correct?", ["boekenkast", "boekekast", "boekenkastt", "boeken kast"], "boekenkast"],
      ["Kies de correcte schrijfwijze.", ["zonneschijn", "zonenschijn", "zonne schijn", "zonnes-schijn"], "zonneschijn"],
      ["Welke schrijfwijze is correct?", ["beslissing", "besliscing", "beslissingg", "beslising"], "beslissing"],
      ["Kies de juiste samenstelling.", ["langeafstandsloper", "lange afstandsloper", "lange-afstands-loper", "langafstandsloper"], "langeafstandsloper"],
      ["Welke afleiding is correct?", ["waarschijnlijk", "waarschijnelijk", "waarschijnnlijk", "waarschijn-lijk"], "waarschijnlijk"],
    ],
    corrections: [
      ["Ik eet graag pannekoeken.", "Ik eet graag pannenkoeken."],
      ["De boekekast staat in de hoek.", "De boekenkast staat in de hoek."],
      ["We bespreken het milieu beleid.", "We bespreken het milieubeleid."],
      ["Dat is een belangrijke beslising.", "Dat is een belangrijke beslissing."],
      ["De lange afstandsloper traint dagelijks.", "De langeafstandsloper traint dagelijks."],
      ["Het is waarschijnelijk te laat.", "Het is waarschijnlijk te laat."],
    ],
  },
  {
    focus: "trema, koppelteken, apostrof en leenwoorden",
    copy: [
      "De reünie vindt plaats in juni.",
      "Zij heeft haar ideeën duidelijk uitgelegd.",
      "De geüpdatete planning staat online.",
      "Mijn oma's recepten zijn populair.",
      "De ex-leerling bezoekt de school.",
      "Het e-mailadres werd correct ingevoerd.",
      "De ski-uitrusting ligt in de auto.",
      "Hij downloadde de nieuwste software-update.",
    ],
    choices: [
      ["Welke schrijfwijze is correct?", ["reunie", "reünie", "re-ünie", "réunie"], "reünie"],
      ["Welke schrijfwijze is correct?", ["ideëen", "ideeën", "idee-en", "ideeen"], "ideeën"],
      ["Kies de juiste schrijfwijze.", ["geupdate", "geüpdatet", "geüpdate", "ge-update"], "geüpdatet"],
      ["Welke schrijfwijze is correct?", ["oma's", "omas", "oma,s", "oma´s"], "oma's"],
      ["Kies de correcte vorm.", ["exleerling", "ex-leerling", "ex leerling", "ex--leerling"], "ex-leerling"],
      ["Welke schrijfwijze is correct?", ["emailadres", "e-mailadres", "e mailadres", "email-adres"], "e-mailadres"],
      ["Kies de juiste schrijfwijze.", ["skiuitrusting", "ski-uitrusting", "ski uitrusting", "skiïtrusting"], "ski-uitrusting"],
      ["Welke vorm is correct?", ["softwareupdate", "software-update", "software update", "soft-ware-update"], "software-update"],
      ["Kies de juiste schrijfwijze.", ["coordineren", "coördineren", "co-ordineren", "coördineeren"], "coördineren"],
      ["Welke schrijfwijze is correct?", ["cafés", "café's", "cafes", "café,s"], "cafés"],
    ],
    corrections: [
      ["De reunie begint om acht uur.", "De reünie begint om acht uur."],
      ["Zij heeft goede ideeen.", "Zij heeft goede ideeën."],
      ["Het emailadres klopt niet.", "Het e-mailadres klopt niet."],
      ["De ex leerling kwam op bezoek.", "De ex-leerling kwam op bezoek."],
      ["Wij bezoeken twee café's.", "Wij bezoeken twee cafés."],
      ["Hij coordineert het project.", "Hij coördineert het project."],
    ],
  },
  {
    focus: "moeilijke werkwoordsvormen en formele spelling",
    copy: [
      "Hoewel hij het ontkende, werd de fout bevestigd.",
      "De organisatie coördineert het volledige project.",
      "De beïnvloede groep reageerde kritisch.",
      "De resultaten worden zorgvuldig geëvalueerd.",
      "Zij heeft zich aan de afspraak gehouden.",
      "Het geüploade bestand was beschadigd.",
      "De docent nuanceerde zijn eerdere uitspraak.",
      "Het onderzoek wordt voortdurend geactualiseerd.",
    ],
    choices: [
      ["Welke zin is correct?", ["De fout werd bevestigt.", "De fout werd bevestigd.", "De fout werd bevestigtd.", "De fout werdt bevestigd."], "De fout werd bevestigd."],
      ["Kies de juiste vorm.", ["beïnvloedde", "beinvloedde", "beïnvloede", "beïnvloedtte"], "beïnvloedde"],
      ["Welke schrijfwijze is correct?", ["geëvalueerd", "geevalueerd", "geëvalueert", "ge-evalueerd"], "geëvalueerd"],
      ["Kies de juiste vorm: Het bestand is ___.", ["geüpload", "geupload", "geüploadt", "ge-upload"], "geüpload"],
      ["Welke zin is correct?", ["De docent nuanceerd zijn uitspraak.", "De docent nuanceert zijn uitspraak.", "De docent nuanceertt zijn uitspraak.", "De docent nuanseert zijn uitspraak."], "De docent nuanceert zijn uitspraak."],
      ["Kies de juiste vorm.", ["geactualiseerd", "geactualiseert", "ge-actualiseerd", "geäctualiseerd"], "geactualiseerd"],
      ["Welke schrijfwijze is correct?", ["coördineert", "coordineert", "coördineerd", "coördineertt"], "coördineert"],
      ["Kies de juiste vorm: Zij ___ het probleem. (erkennen)", ["erkent", "erkend", "erkendt", "erkendt"], "erkent"],
      ["Welke zin is correct?", ["Hij heeft zich vergist.", "Hij heeft zich vergistt.", "Hij heeft zich vergisd.", "Hij heeft zich gevergist."], "Hij heeft zich vergist."],
      ["Kies het correcte woord.", ["onmiddellijk", "onmidelijk", "onmiddelijk", "on-middellijk"], "onmiddellijk"],
    ],
    corrections: [
      ["De fout werd bevestigt.", "De fout werd bevestigd."],
      ["Het bestand is geupload.", "Het bestand is geüpload."],
      ["De groep werd beinvloed.", "De groep werd beïnvloed."],
      ["Zij evalueerd de resultaten.", "Zij evalueert de resultaten."],
      ["Hij heeft zijn uitspraak genuanceert.", "Hij heeft zijn uitspraak genuanceerd."],
      ["De organisatie coordineert het project.", "De organisatie coördineert het project."],
    ],
  },
  {
    focus: "complexe samenstellingen, Engelse werkwoorden en academische woorden",
    copy: [
      "De commissie beoordeelt de langetermijneffecten.",
      "Het onderzoeksresultaat werd gepubliceerd.",
      "De projectcoördinator mailde alle deelnemers.",
      "Zij heeft de gegevens zorgvuldig gescand.",
      "De beleidsmaatregel is juridisch gerechtvaardigd.",
      "Het team brainstormde over een vervolgonderzoek.",
      "De kwaliteitscontrole wordt halfjaarlijks uitgevoerd.",
      "De docent heeft de presentatie geüpdatet.",
    ],
    choices: [
      ["Welke samenstelling is correct?", ["langetermijneffecten", "lange-termijneffecten", "lange termijn effecten", "langetermijn effecten"], "langetermijneffecten"],
      ["Kies de juiste schrijfwijze.", ["onderzoeksresultaat", "onderzoekresultaat", "onderzoeks resultaat", "onderzoek'sresultaat"], "onderzoeksresultaat"],
      ["Wat is de juiste verleden tijd van ‘mailen’?", ["mailde", "mailte", "gemaild", "maillde"], "mailde"],
      ["Wat is het juiste voltooid deelwoord van ‘scannen’?", ["gescand", "gescant", "gescanned", "gescannd"], "gescand"],
      ["Welke schrijfwijze is correct?", ["gerechtvaardigd", "gerechtvaardigt", "gerechtvaardigd", "gerechtvaardigt"], "gerechtvaardigd"],
      ["Wat is de juiste verleden tijd van ‘brainstormen’?", ["brainstormde", "brainstormte", "gebrainstormd", "brainstormdde"], "brainstormde"],
      ["Welke samenstelling is correct?", ["kwaliteitscontrole", "kwaliteitcontrole", "kwaliteits controle", "kwaliteit'scontrole"], "kwaliteitscontrole"],
      ["Kies het juiste voltooid deelwoord van ‘updaten’.", ["geüpdatet", "geüpdate", "geupdated", "geupdatet"], "geüpdatet"],
      ["Welke schrijfwijze is correct?", ["projectcoördinator", "project coordinator", "project-coordinator", "projectcoordinator"], "projectcoördinator"],
      ["Kies de juiste vorm.", ["halfjaarlijks", "half-jaarlijks", "half jaarlijks", "halfjaar-lijks"], "halfjaarlijks"],
    ],
    corrections: [
      ["De lange termijn effecten zijn groot.", "De langetermijneffecten zijn groot."],
      ["Hij mailte alle deelnemers.", "Hij mailde alle deelnemers."],
      ["De documenten zijn gescant.", "De documenten zijn gescand."],
      ["Het onderzoeks resultaat is duidelijk.", "Het onderzoeksresultaat is duidelijk."],
      ["Zij heeft de presentatie geupdated.", "Zij heeft de presentatie geüpdatet."],
      ["De kwaliteits controle duurde lang.", "De kwaliteitscontrole duurde lang."],
    ],
  },
  {
    focus: "wetenschappelijke en beleidsmatige spelling",
    copy: [
      "De wetenschapper formuleerde een falsifieerbare hypothese.",
      "De gegevens zijn systematisch gecategoriseerd.",
      "Het rapport vermeldt verscheidene uitzonderingen.",
      "De steekproef was onvoldoende representatief.",
      "De onderzoeksmethodologie werd transparant beschreven.",
      "De statistische significantie is beperkt.",
      "De commissie herformuleerde de beleidsdoelstelling.",
      "De resultaten werden geïnterpreteerd in hun context.",
    ],
    choices: [
      ["Welke schrijfwijze is correct?", ["falsifieerbaar", "falsificeerbaar", "falsifieërbaar", "falsifieer-baar"], "falsifieerbaar"],
      ["Kies de juiste vorm.", ["gecategoriseerd", "gecategoriseert", "ge-categoriseerd", "gecatagoriseerd"], "gecategoriseerd"],
      ["Welke schrijfwijze is correct?", ["verscheidene", "verschijdende", "verscheidenen", "verscheide"], "verscheidene"],
      ["Kies de correcte vorm.", ["representatief", "reprensentatief", "representatiev", "representatiefd"], "representatief"],
      ["Welke schrijfwijze is correct?", ["onderzoeksmethodologie", "onderzoeks methodologie", "onderzoekmethodologie", "onderzoek'smethodologie"], "onderzoeksmethodologie"],
      ["Kies het correcte woord.", ["significantie", "signifikantie", "significansie", "significantieë"], "significantie"],
      ["Welke vorm is correct?", ["herformuleerde", "herformuleerdde", "herformuliseerde", "herformuleerdee"], "herformuleerde"],
      ["Kies de juiste schrijfwijze.", ["geïnterpreteerd", "geinterperteerd", "geïnterpreteert", "ge-interpreteerd"], "geïnterpreteerd"],
      ["Welke schrijfwijze is correct?", ["steekproefgrootte", "steekproef grootte", "steekproef-grootte", "steekproevengrootte"], "steekproefgrootte"],
      ["Kies de correcte vorm.", ["beleidsdoelstelling", "beleiddoelstelling", "beleids doelstelling", "beleid'sdoelstelling"], "beleidsdoelstelling"],
    ],
    corrections: [
      ["De steekproef was niet representatiev.", "De steekproef was niet representatief."],
      ["De gegevens werden gecategoriseert.", "De gegevens werden gecategoriseerd."],
      ["De onderzoek methodologie is duidelijk.", "De onderzoeksmethodologie is duidelijk."],
      ["De resultaten zijn geinterperteerd.", "De resultaten zijn geïnterpreteerd."],
      ["De signifiekantie is beperkt.", "De significantie is beperkt."],
      ["De beleids doelstelling werd aangepast.", "De beleidsdoelstelling werd aangepast."],
    ],
  },
  {
    focus: "examenniveau: complexe zinnen, academische spelling en revisie",
    copy: [
      "Hoewel de conclusie zorgvuldig geformuleerd werd, bleven enkele veronderstellingen onbewezen.",
      "De geïnterviewde deelnemers reageerden genuanceerd op de controversiële stelling.",
      "Het beleid wordt periodiek geëvalueerd en, indien nodig, bijgestuurd.",
      "De multidisciplinaire onderzoeksgroep publiceerde haar bevindingen.",
      "De sociaaleconomische omstandigheden beïnvloeden de onderwijsresultaten.",
      "De auteursrechtelijke verantwoordelijkheid blijft bij de oorspronkelijke maker.",
      "De langetermijnprognose werd opnieuw gekwantificeerd.",
      "De hypothese is theoretisch aannemelijk, maar empirisch onvoldoende onderbouwd.",
    ],
    choices: [
      ["Welke zin is volledig correct?", ["Hoewel de conclusie zorgvuldig geformuleert werd, bleef twijfel bestaan.", "Hoewel de conclusie zorgvuldig geformuleerd werd, bleef twijfel bestaan.", "Hoewel de conclusie zorgvuldig geformuleerd werdt, bleef twijfel bestaan.", "Hoewel de conclusie zorgvuldig geformuleerd werd bleef twijfel bestaan."], "Hoewel de conclusie zorgvuldig geformuleerd werd, bleef twijfel bestaan."],
      ["Welke schrijfwijze is correct?", ["geïnterviewde", "geinterviewde", "geïntervieuwde", "ge-interviewde"], "geïnterviewde"],
      ["Kies de correcte vorm.", ["multidisciplinair", "multi-disciplinair", "multidiciplinair", "multi disciplinair"], "multidisciplinair"],
      ["Welke samenstelling is correct?", ["sociaaleconomisch", "sociaal-economisch", "sociaal economisch", "socialeconomisch"], "sociaaleconomisch"],
      ["Kies de juiste schrijfwijze.", ["auteursrechtelijk", "auteurrechtelijk", "auteurs-rechtelijk", "auteurs rechtelijk"], "auteursrechtelijk"],
      ["Welke vorm is correct?", ["langetermijnprognose", "lange-termijnprognose", "lange termijn prognose", "langetermijn prognose"], "langetermijnprognose"],
      ["Kies het juiste voltooid deelwoord van ‘kwantificeren’.", ["gekwantificeerd", "gekwantificeert", "gequantificeerd", "ge-kwantificeerd"], "gekwantificeerd"],
      ["Welke schrijfwijze is correct?", ["empirisch", "empierisch", "empiries", "em-pirisch"], "empirisch"],
      ["Kies de juiste vorm.", ["onderbouwd", "onderbouwt", "onderbouwdt", "geonderbouwd"], "onderbouwd"],
      ["Waar staan de komma's correct?", ["Het beleid wordt periodiek geëvalueerd en indien nodig bijgestuurd.", "Het beleid wordt periodiek geëvalueerd en, indien nodig, bijgestuurd.", "Het beleid, wordt periodiek geëvalueerd en indien nodig, bijgestuurd.", "Het beleid wordt, periodiek geëvalueerd, en indien nodig bijgestuurd."], "Het beleid wordt periodiek geëvalueerd en, indien nodig, bijgestuurd."],
    ],
    corrections: [
      ["De conclusie werd zorgvuldig geformuleert.", "De conclusie werd zorgvuldig geformuleerd."],
      ["De geinterviewde deelnemers reageerden genuanceerd.", "De geïnterviewde deelnemers reageerden genuanceerd."],
      ["De sociaal-economische omstandigheden spelen een rol.", "De sociaaleconomische omstandigheden spelen een rol."],
      ["De lange termijn prognose is onzeker.", "De langetermijnprognose is onzeker."],
      ["De hypothese is onvoldoende onderbouwt.", "De hypothese is onvoldoende onderbouwd."],
      ["De resultaten werden opnieuw gequantificeerd.", "De resultaten werden opnieuw gekwantificeerd."],
    ],
  },
] as const;

function makeCorrectionExercise(
  category: string,
  wrong: string,
  correct: string
): ExerciseInput {
  return {
    category,
    question: `Verbeter deze zin volledig: ${wrong}`,
    answer: correct,
  };
}

export function generateSpelling(
  level: number,
  random: Random
): ExerciseInput[] {
  const safeLevel = Math.max(1, Math.min(10, Math.round(level || 1)));
  const bank = levels[safeLevel - 1];
  const category = `Spelling · niveau ${safeLevel} · ${bank.focus}`;

  const exercises: ExerciseInput[] = [
    ...bank.copy.map((sentence) => ({
      category,
      question: `Schrijf foutloos over: ${sentence}`,
      answer: sentence,
    })),
    ...bank.choices.map(([question, options, answer]) =>
      mc(category, question, [...options], answer)
    ),
    ...bank.corrections.map(([wrong, correct]) =>
      makeCorrectionExercise(category, wrong, correct)
    ),
  ];

  // De centrale generator selecteert opnieuw maximaal 15 oefeningen. Door hier
  // al te mengen, varieert de reeks ook wanneer deze functie rechtstreeks wordt gebruikt.
  return shuffle(random, exercises);
}
