"use client";

import { useEffect, useMemo, useState } from "react";

type Exercise = {
  id: string;
  category: string;
  question: string;
  answer: string | string[];
};

type LevelProgress = {
  answers: Record<string, string>;
  checked: boolean;
  percentage: number;
  score: number;
};

type SavedData = {
  level?: number;
  reachedLevels?: number[];
  savedExercises?: Record<number, Exercise[]>;
  progress?: Record<number, LevelProgress>;
};

const STORAGE_KEY = "sago-oefenklim-victor-v2";

const categories = [
  "Persoonsvorm",
  "Verenkeling en verdubbeling",
  "Maaltafels",
  "Automatisatie",
  "Vraagstukken",
  "Frans",
];

const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function normalize(value: string | number) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[.,€]/g, "")
    .replace(/\s+/g, " ");
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateExercises(level: number): Exercise[] {
  const exercises: Exercise[] = [];
  const levelIndex = Math.max(0, Math.min(level - 1, 9));

  const spellingByLevel = [
    [
      ["kat", "katten"],
      ["zon", "zonnen"],
      ["man", "mannen"],
      ["bom", "bommen"],
      ["vis", "vissen"],
      ["tak", "takken"],
      ["pot", "potten"],
      ["bal", "ballen"],
    ],
    [
      ["boom", "bomen"],
      ["raam", "ramen"],
      ["school", "scholen"],
      ["droom", "dromen"],
      ["straat", "straten"],
      ["muur", "muren"],
      ["stoel", "stoelen"],
      ["maan", "manen"],
    ],
    [
      ["brug", "bruggen"],
      ["jas", "jassen"],
      ["les", "lessen"],
      ["kam", "kammen"],
      ["bel", "bellen"],
      ["pen", "pennen"],
      ["tas", "tassen"],
      ["kom", "kommen"],
    ],
    [
      ["roos", "rozen"],
      ["doos", "dozen"],
      ["baas", "bazen"],
      ["neus", "neuzen"],
      ["huis", "huizen"],
      ["muis", "muizen"],
      ["kaas", "kazen"],
      ["prijs", "prijzen"],
    ],
    [
      ["bakker", "bakkers"],
      ["jager", "jagers"],
      ["loper", "lopers"],
      ["dromer", "dromers"],
      ["zwemmer", "zwemmers"],
      ["renner", "renners"],
      ["schrijver", "schrijvers"],
      ["denker", "denkers"],
    ],
    [
      ["pakket", "pakketten"],
      ["raket", "raketten"],
      ["etiket", "etiketten"],
      ["loket", "loketten"],
      ["sonnet", "sonnetten"],
      ["ballet", "balletten"],
      ["portret", "portretten"],
      ["banket", "banketten"],
    ],
    [
      ["agent", "agenten"],
      ["moment", "momenten"],
      ["accent", "accenten"],
      ["talent", "talenten"],
      ["document", "documenten"],
      ["instrument", "instrumenten"],
      ["experiment", "experimenten"],
      ["argument", "argumenten"],
    ],
    [
      ["station", "stations"],
      ["telefoon", "telefoons"],
      ["computer", "computers"],
      ["museum", "musea"],
      ["centrum", "centra"],
      ["datum", "data"],
      ["schema", "schema's"],
      ["foto", "foto's"],
    ],
    [
      ["baby", "baby's"],
      ["hobby", "hobby's"],
      ["pony", "pony's"],
      ["taxi", "taxi's"],
      ["menu", "menu's"],
      ["paraplu", "paraplu's"],
      ["radio", "radio's"],
      ["niveau", "niveaus"],
    ],
    [
      ["idee", "ideeën"],
      ["zee", "zeeën"],
      ["knie", "knieën"],
      ["industrie", "industrieën"],
      ["categorie", "categorieën"],
      ["melodie", "melodieën"],
      ["energie", "energieën"],
      ["theorie", "theorieën"],
    ],
  ];

  const pvByLevel = [
    [
      { question: "Duid de persoonsvorm aan: Morgen fietsen wij naar school.", answer: "fietsen" },
      { question: "Vul aan: Hij ___ een boek. (lezen)", answer: "leest" },
      { question: "Vul aan: Ik ___ naar de winkel. (lopen)", answer: "loop" },
      { question: "Duid de persoonsvorm aan: De hond blaft luid.", answer: "blaft" },
      { question: "Vul aan: Wij ___ buiten. (spelen)", answer: "spelen" },
    ],
    [
      { question: "Vul aan: Wij ___ gisteren naar huis. (wandelen)", answer: "wandelden" },
      { question: "Zet in de verleden tijd: Wij spelen buiten.", answer: "wij speelden buiten" },
      { question: "Duid de persoonsvorm aan: De leerlingen maakten hun taak.", answer: "maakten" },
      { question: "Vul aan: Jij ___ morgen naar oma. (gaan)", answer: "gaat" },
      { question: "Duid de persoonsvorm aan: Na school zullen we oefenen.", answer: "zullen" },
    ],
    [
      { question: "Zet in de verleden tijd: Ik fiets naar de winkel.", answer: "ik fietste naar de winkel" },
      { question: "Vul aan: De juf ___ de opdracht uit. (leggen)", answer: "legt" },
      { question: "Duid de persoonsvorm aan: Omdat het regende, bleven we binnen.", answer: "bleven" },
      { question: "Vul aan: Hij ___ gisteren de bal. (gooien)", answer: "gooide" },
      { question: "Duid de persoonsvorm aan: Zij heeft haar boek vergeten.", answer: "heeft" },
    ],
    [
      { question: "Duid de persoonsvorm aan: Als het straks stopt met regenen, gaan we fietsen.", answer: "stopt" },
      { question: "Vul aan: De kinderen ___ gisteren lang buiten. (spelen)", answer: "speelden" },
      { question: "Zet in de verleden tijd: Jij maakt je taak.", answer: "jij maakte je taak" },
      { question: "Duid de persoonsvorm aan: Morgen zal ik vroeger vertrekken.", answer: "zal" },
      { question: "Vul aan: Ik ___ de uitleg goed. (begrijpen)", answer: "begrijp" },
    ],
    [
      { question: "Duid de persoonsvorm aan: De leerlingen die klaar waren, lazen verder.", answer: "lazen" },
      { question: "Vul aan: Hij ___ zijn jas aan de kapstok. (hangen)", answer: "hangt" },
      { question: "Zet in de verleden tijd: De meester vertelt een verhaal.", answer: "de meester vertelde een verhaal" },
      { question: "Duid de persoonsvorm aan: Tijdens de pauze aten we onze boterhammen.", answer: "aten" },
      { question: "Vul aan: Wij ___ morgen vroeger starten. (zullen)", answer: "zullen" },
    ],
    [
      { question: "Duid de persoonsvorm aan: Toen de bel ging, stonden de leerlingen recht.", answer: "ging" },
      { question: "Vul aan: Jij ___ gisteren te laat. (komen)", answer: "kwam" },
      { question: "Zet in de verleden tijd: Ik schrijf een brief.", answer: "ik schreef een brief" },
      { question: "Duid de persoonsvorm aan: Omdat hij ziek was, bleef hij thuis.", answer: "was" },
      { question: "Vul aan: De hond ___ naar de postbode. (blaffen)", answer: "blaft" },
    ],
    [
      { question: "Duid de persoonsvorm aan: De kinderen zouden morgen zwemmen.", answer: "zouden" },
      { question: "Vul aan: Ik ___ gisteren mijn boek mee. (brengen)", answer: "bracht" },
      { question: "Zet in de verleden tijd: Wij vinden een sleutel.", answer: "wij vonden een sleutel" },
      { question: "Duid de persoonsvorm aan: Nadat hij gegeten had, vertrok hij.", answer: "had" },
      { question: "Vul aan: Zij ___ vaak aan haar oma. (denken)", answer: "denkt" },
    ],
    [
      { question: "Duid de persoonsvorm aan: Hoewel het moeilijk leek, lukte de opdracht.", answer: "leek" },
      { question: "Vul aan: De leerlingen ___ hun antwoorden na. (kijken)", answer: "kijken" },
      { question: "Zet in de verleden tijd: Jij neemt je boek.", answer: "jij nam je boek" },
      { question: "Duid de persoonsvorm aan: Ik weet niet waarom hij lachte.", answer: "weet" },
      { question: "Vul aan: Hij ___ gisteren hard. (lopen)", answer: "liep" },
    ],
    [
      { question: "Duid de persoonsvorm aan: Wanneer de zon schijnt, spelen we buiten.", answer: "schijnt" },
      { question: "Vul aan: Wij ___ het antwoord niet. (weten)", answer: "weten" },
      { question: "Zet in de verleden tijd: De kinderen zingen een lied.", answer: "de kinderen zongen een lied" },
      { question: "Duid de persoonsvorm aan: De jongen die daar staat, is mijn broer.", answer: "staat" },
      { question: "Vul aan: Ik ___ gisteren vroeg op. (staan)", answer: "stond" },
    ],
    [
      { question: "Duid de persoonsvorm aan: Als iedereen klaar is, mogen jullie vertrekken.", answer: "is" },
      { question: "Vul aan: Jij ___ het antwoord gisteren al. (weten)", answer: "wist" },
      { question: "Zet in de verleden tijd: Wij kiezen een boek.", answer: "wij kozen een boek" },
      { question: "Duid de persoonsvorm aan: Omdat de toets moeilijk was, werkten ze traag.", answer: "was" },
      { question: "Vul aan: Hij ___ zijn taak zorgvuldig. (doen)", answer: "doet" },
    ],
  ];

  const frenchByLevel: [string, string[]][][] = [
    [
      ["boek", ["le livre"]],
      ["stoel", ["la chaise"]],
      ["tafel", ["la table"]],
      ["deur", ["la porte"]],
      ["raam", ["la fenêtre", "la fenetre"]],
      ["hond", ["le chien"]],
      ["kat", ["le chat"]],
      ["school", ["l'école", "l ecole"]],
    ],
    [
      ["appel", ["la pomme"]],
      ["water", ["l'eau", "l eau"]],
      ["brood", ["le pain"]],
      ["fiets", ["le vélo", "le velo"]],
      ["schrift", ["le cahier"]],
      ["gom", ["la gomme"]],
      ["potlood", ["le crayon"]],
      ["pen", ["le stylo"]],
    ],
    [
      ["moeder", ["la mère", "la mere"]],
      ["vader", ["le père", "le pere"]],
      ["broer", ["le frère", "le frere"]],
      ["zus", ["la sœur", "la soeur"]],
      ["vriend", ["l'ami", "l ami"]],
      ["vriendin", ["l'amie", "l amie"]],
      ["kind", ["l'enfant", "l enfant"]],
      ["familie", ["la famille"]],
    ],
    [
      ["maandag", ["le lundi"]],
      ["dinsdag", ["le mardi"]],
      ["woensdag", ["le mercredi"]],
      ["donderdag", ["le jeudi"]],
      ["vrijdag", ["le vendredi"]],
      ["zaterdag", ["le samedi"]],
      ["zondag", ["le dimanche"]],
      ["week", ["la semaine"]],
    ],
    [
      ["hoofd", ["la tête", "la tete"]],
      ["hand", ["la main"]],
      ["voet", ["le pied"]],
      ["oog", ["l'œil", "l oeil"]],
      ["mond", ["la bouche"]],
      ["neus", ["le nez"]],
      ["oor", ["l'oreille", "l oreille"]],
      ["been", ["la jambe"]],
    ],
    [
      ["rood", ["le rouge"]],
      ["blauw", ["le bleu"]],
      ["groen", ["le vert"]],
      ["geel", ["le jaune"]],
      ["zwart", ["le noir"]],
      ["wit", ["le blanc"]],
      ["paars", ["le violet"]],
      ["oranje", ["l'orange", "l orange"]],
    ],
    [
      ["huis", ["la maison"]],
      ["kamer", ["la chambre"]],
      ["keuken", ["la cuisine"]],
      ["tuin", ["le jardin"]],
      ["straat", ["la rue"]],
      ["winkel", ["le magasin"]],
      ["stad", ["la ville"]],
      ["dorp", ["le village"]],
    ],
    [
      ["eten", ["manger"]],
      ["drinken", ["boire"]],
      ["spelen", ["jouer"]],
      ["lopen", ["marcher"]],
      ["kijken", ["regarder"]],
      ["luisteren", ["écouter", "ecouter"]],
      ["werken", ["travailler"]],
      ["leren", ["apprendre"]],
    ],
    [
      ["ik ben", ["je suis"]],
      ["jij bent", ["tu es"]],
      ["hij is", ["il est"]],
      ["zij is", ["elle est"]],
      ["wij zijn", ["nous sommes"]],
      ["jullie zijn", ["vous êtes", "vous etes"]],
      ["zij zijn", ["ils sont", "elles sont"]],
      ["ik heb", ["j'ai", "j ai"]],
    ],
    [
      ["ik hou van lezen", ["j'aime lire", "j aime lire"]],
      ["ik woon in België", ["j'habite en belgique", "j habite en belgique"]],
      ["ik ben elf jaar", ["j'ai onze ans", "j ai onze ans"]],
      ["ik ga naar school", ["je vais à l'école", "je vais a l ecole"]],
      ["ik speel voetbal", ["je joue au football"]],
      ["ik drink water", ["je bois de l'eau", "je bois de l eau"]],
      ["ik eet brood", ["je mange du pain"]],
      ["ik luister naar muziek", ["j'écoute de la musique", "j ecoute de la musique"]],
    ],
  ];

  for (let i = 1; i <= 8; i++) {
    const a = rand(4 + level * 2, 9 + level * 4);
    const b = rand(3 + level, 10 + level * 2);

    exercises.push({
      id: `maal-${level}-${i}`,
      category: "Maaltafels",
      question: `${a} × ${b} =`,
      answer: String(a * b),
    });
  }

  for (let i = 1; i <= 8; i++) {
    const deler = rand(3 + level, 8 + level * 2);
    const uitkomst = rand(10 + level * 10, 60 + level * 35);
    const getal = deler * uitkomst;

    exercises.push({
      id: `delen-${level}-${i}`,
      category: "Automatisatie",
      question: `${getal} ÷ ${deler} =`,
      answer: String(uitkomst),
    });
  }

  for (let i = 1; i <= 6; i++) {
    const a = rand(100 * level, 400 + level * 350);
    const b = rand(80 * level, 300 + level * 250);

    const useMinus = level >= 4 && i % 2 === 0;

    exercises.push({
      id: `auto-${level}-${i}`,
      category: "Automatisatie",
      question: useMinus
        ? `${Math.max(a, b)} - ${Math.min(a, b)} =`
        : `${a} + ${b} =`,
      answer: useMinus
        ? String(Math.max(a, b) - Math.min(a, b))
        : String(a + b),
    });
  }

  spellingByLevel[levelIndex].forEach(([word, correct], index) => {
    exercises.push({
      id: `spel-${level}-${index}`,
      category: "Verenkeling en verdubbeling",
      question: `Schrijf het meervoud van: ${word}`,
      answer: correct,
    });
  });

  pvByLevel[levelIndex].forEach((item, index) => {
    exercises.push({
      id: `pv-${level}-${index}`,
      category: "Persoonsvorm",
      question: item.question,
      answer: item.answer,
    });
  });

  for (let i = 1; i <= 6; i++) {
    const price = rand(5 + level * 2, 15 + level * 5);
    const amount = rand(3 + level, 8 + level * 3);
    const discount = level * 3;
    const total = price * amount;
    const answer = level < 5 ? total : total - discount;

    exercises.push({
      id: `vraag-${level}-${i}`,
      category: "Vraagstukken",
      question:
        level < 5
          ? `Een leerling koopt ${amount} items van €${price}. Hoeveel betaalt hij in totaal?`
          : `Een klas koopt ${amount} pakketten van €${price}. Ze krijgen €${discount} korting. Hoeveel betalen ze?`,
      answer: [`${answer}`, `€${answer}`, `${answer} euro`],
    });
  }

  frenchByLevel[levelIndex].forEach(([nl, fr], index) => {
    exercises.push({
      id: `fr-${level}-${index}`,
      category: "Frans",
      question:
        level < 8
          ? `Vertaal naar het Frans met lidwoord: ${nl}`
          : `Vertaal naar het Frans: ${nl}`,
      answer: fr,
    });
  });

  return exercises;
}

export default function OefenpaginaClient() {
  const [level, setLevel] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [reachedLevels, setReachedLevels] = useState<number[]>([1]);
  const [savedExercises, setSavedExercises] = useState<
    Record<number, Exercise[]>
  >({});
  const [progress, setProgress] = useState<Record<number, LevelProgress>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const data: SavedData = JSON.parse(stored);

        setLevel(data.level || 1);
        setReachedLevels(data.reachedLevels || [1]);
        setSavedExercises(data.savedExercises || {});
        setProgress(data.progress || {});

        const savedLevel = data.level || 1;
        const savedProgress = data.progress?.[savedLevel];

        if (savedProgress) {
          setAnswers(savedProgress.answers || {});
          setChecked(savedProgress.checked || false);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    setSavedExercises((previous) => {
      if (previous[1]) return previous;

      return {
        ...previous,
        1: generateExercises(1),
      };
    });
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        level,
        reachedLevels,
        savedExercises,
        progress,
      })
    );
  }, [level, reachedLevels, savedExercises, progress, loaded]);

  const exercises = useMemo(() => {
    return savedExercises[level] || [];
  }, [level, savedExercises]);

  const score = exercises.reduce((total, exercise) => {
    const given = normalize(answers[exercise.id] || "");
    const correctAnswers = Array.isArray(exercise.answer)
      ? exercise.answer
      : [exercise.answer];

    const correct = correctAnswers.some(
      (answer) => normalize(answer) === given
    );

    return total + (correct ? 1 : 0);
  }, 0);

  const percentage =
    exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 0;

  const savedProgress = progress[level];

  const displayedScore = savedProgress?.checked ? savedProgress.score : score;
  const displayedPercentage = savedProgress?.checked
    ? savedProgress.percentage
    : checked
      ? percentage
      : 0;

  function isCorrect(exercise: Exercise) {
    const given = normalize(answers[exercise.id] || "");
    const correctAnswers = Array.isArray(exercise.answer)
      ? exercise.answer
      : [exercise.answer];

    return correctAnswers.some((answer) => normalize(answer) === given);
  }

  function canOpenLevel(targetLevel: number) {
    return reachedLevels.includes(targetLevel);
  }

  function saveCurrentLevelProgress(newChecked = checked) {
    setProgress((previous) => ({
      ...previous,
      [level]: {
        answers,
        checked: newChecked,
        percentage: newChecked ? percentage : previous[level]?.percentage || 0,
        score: newChecked ? score : previous[level]?.score || 0,
      },
    }));
  }

  function goToLevel(newLevel: number) {
    if (!canOpenLevel(newLevel)) return;

    saveCurrentLevelProgress();

    setSavedExercises((previous) => {
      if (previous[newLevel]) return previous;

      return {
        ...previous,
        [newLevel]: generateExercises(newLevel),
      };
    });

    const saved = progress[newLevel];

    if (saved) {
      setAnswers(saved.answers);
      setChecked(saved.checked);
    } else {
      setAnswers({});
      setChecked(false);
    }

    setLevel(newLevel);
  }

  function improve() {
    setChecked(true);

    setProgress((previous) => ({
      ...previous,
      [level]: {
        answers,
        checked: true,
        percentage,
        score,
      },
    }));

    if (percentage >= 75 && level < 10) {
      const next = level + 1;

      setReachedLevels((previous) =>
        previous.includes(next) ? previous : [...previous, next]
      );

      setSavedExercises((previous) => {
        if (previous[next]) return previous;

        return {
          ...previous,
          [next]: generateExercises(next),
        };
      });
    }
  }

  function nextLevel() {
    if (!checked || percentage < 75 || level === 10) {
      setChecked(true);
      return;
    }

    goToLevel(level + 1);
  }

  function previousLevel() {
    goToLevel(Math.max(level - 1, 1));
  }

  function resetCurrentLevel() {
    const fresh = generateExercises(level);

    setSavedExercises((previous) => ({
      ...previous,
      [level]: fresh,
    }));

    setAnswers({});
    setChecked(false);

    setProgress((previous) => {
      const next = { ...previous };
      delete next[level];
      return next;
    });
  }

  function updateAnswer(id: string, value: string) {
    const nextAnswers = {
      ...answers,
      [id]: value,
    };

    setAnswers(nextAnswers);

    setProgress((previous) => ({
      ...previous,
      [level]: {
        answers: nextAnswers,
        checked,
        percentage: previous[level]?.percentage || 0,
        score: previous[level]?.score || 0,
      },
    }));
  }

  const grouped = categories
    .map((category) => ({
      category,
      items: exercises.filter((exercise) => exercise.category === category),
    }))
    .filter((group) => group.items.length > 0);

  if (!loaded || exercises.length === 0) {
    return (
      <main className="oefenpagina">
        <section className="oefen-hero">
          <p className="eyebrow">Studio SaGo Leerlingportaal</p>
          <h1>Oefenklim wordt geladen...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="oefenpagina">
      <section className="oefen-hero">
        <p className="eyebrow">Studio SaGo Leerlingportaal</p>
        <h1>Oefenklim 6e leerjaar</h1>
        <p>
          Maak oefeningen, verbeter automatisch en klim telkens een niveau hoger.
          Je hebt minstens 75% nodig om het volgende niveau vrij te spelen.
        </p>
      </section>

      <section className="learning-journey-card">
        <div className="journey-header">
          <div>
            <h2>Jouw oefenreis 🏔️</h2>
            <p>Klim naar de top en word een kei in leren! 💪</p>
          </div>

          <div className="journey-goal">
            ⭐ <span>Bereik niveau 10</span>
          </div>
        </div>

        <div className="journey-mountain">
          {levels.map((item) => (
            <button
              key={item}
              type="button"
              className={`journey-flag ${
                item === level ? "active" : ""
              } ${reachedLevels.includes(item) ? "reached" : ""}`}
              onClick={() => goToLevel(item)}
              disabled={!canOpenLevel(item)}
              aria-label={`Ga naar niveau ${item}`}
            >
              {canOpenLevel(item) ? "🚩" : "🔒"} <span>{item}</span>
            </button>
          ))}
        </div>

        <div className="journey-bottom">
          <div className="journey-box">
            <small>Huidig niveau</small>
            <strong>Niveau {level}</strong>
            <p>Je staat op plek {level} van je oefenreis.</p>
          </div>

          <div className="journey-box">
            <small>Jouw voortgang</small>
            <strong>{displayedPercentage}%</strong>
            <p>
              {savedProgress?.checked || checked
                ? `${displayedScore} / ${exercises.length} oefeningen juist`
                : "Nog niet verbeterd"}
            </p>

            <div className="progress-track">
              <span style={{ width: `${displayedPercentage}%` }} />
            </div>
          </div>

          <div className="journey-actions">
            <button type="button" onClick={previousLevel} disabled={level === 1}>
              ← Vorige niveau
            </button>

            <button type="button" className="primary" onClick={improve}>
              ✓ Verbeter antwoorden
            </button>

            <button
              type="button"
              onClick={nextLevel}
              disabled={level === 10 || !checked || percentage < 75}
            >
              Volgende niveau →
            </button>

            <button type="button" onClick={resetCurrentLevel}>
              Nieuwe oefeningen voor dit niveau
            </button>

            {checked && percentage < 75 && (
              <p className="level-warning">
                Je hebt minstens 75% nodig om het volgende niveau vrij te spelen.
              </p>
            )}
          </div>
        </div>
      </section>

      {grouped.map((group) => (
        <section className="exercise-section" key={group.category}>
          <h2>{group.category}</h2>

          <div className="exercise-grid">
            {group.items.map((exercise, index) => {
              const correct = isCorrect(exercise);

              return (
                <article
                  key={exercise.id}
                  className={`exercise-card ${
                    checked ? (correct ? "correct" : "wrong") : ""
                  }`}
                >
                  <p className="exercise-number">Vraag {index + 1}</p>
                  <h3>{exercise.question}</h3>

                  <input
                    value={answers[exercise.id] || ""}
                    onChange={(event) =>
                      updateAnswer(exercise.id, event.target.value)
                    }
                    placeholder="Typ je antwoord..."
                  />

                  {checked && (
                    <p className="feedback">
                      {correct
                        ? "Juist!"
                        : `Niet juist. Correct antwoord: ${
                            Array.isArray(exercise.answer)
                              ? exercise.answer[0]
                              : exercise.answer
                          }`}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <section className="bottom-journey-actions">
        <button type="button" onClick={previousLevel} disabled={level === 1}>
          ← Vorige niveau
        </button>

        <button type="button" className="primary" onClick={improve}>
          ✓ Verbeter antwoorden
        </button>

        <button
          type="button"
          onClick={nextLevel}
          disabled={level === 10 || !checked || percentage < 75}
        >
          Volgende niveau →
        </button>

        <button type="button" className="refresh" onClick={resetCurrentLevel}>
          Nieuwe oefeningen
        </button>

        {checked && percentage < 75 && (
          <p className="level-warning">
            Je hebt minstens 75% nodig om het volgende niveau vrij te spelen.
          </p>
        )}
      </section>
    </main>
  );
}