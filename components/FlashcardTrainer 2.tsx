"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./FlashcardTrainer.module.css";

export type Flashcard = { id: string; term: string; definition: string; hint?: string };
export type MainCategory = "anatomie" | "fysiologie" | "infectiebeheersing" | "farmacologie";
export type FlashcardSet = { id: string; title: string; description?: string; category?: MainCategory; cards: Flashcard[] };

type CardStatus = "new" | "learning" | "known";
type StoredProgress = {
  cardStatuses: Record<string, CardStatus>;
  masteredSets: Record<string, boolean>;
};

const STORAGE_KEY = "studio-sago-flashcards-progress-v2";

const CATEGORY_META: Record<MainCategory, { title: string; description: string; icon: string }> = {
  anatomie: { title: "Anatomie", description: "Bouw, ligging en structuur van het menselijk lichaam", icon: "🫀" },
  fysiologie: { title: "Fysiologie", description: "Werking en samenwerking van cellen, weefsels en organen", icon: "⚡" },
  infectiebeheersing: { title: "Infectiebeheersing", description: "Hygiëne, preventie en veilig werken in de zorg", icon: "🛡️" },
  farmacologie: { title: "Farmacologie", description: "Werking, gebruik en veilige toediening van geneesmiddelen", icon: "💊" },
};

const CATEGORY_BY_SET: Record<string, MainCategory> = {
  "beenderstelsel":"anatomie","gewrichten-beweging":"anatomie","axiaal-skelet":"anatomie","appendiculair-skelet":"anatomie","belangrijkste-spieren":"anatomie","hersenen":"anatomie","mond-slikken":"anatomie","maag-darmen":"anatomie","lever-gal-pancreas":"anatomie","ademhalingsstelsel-bouw":"anatomie","oog":"anatomie","oor-reuk-smaak":"anatomie","topografie":"anatomie","cytologie":"anatomie","histologie":"anatomie","voortplantingsstelsel":"anatomie","bloed":"anatomie","hart":"anatomie","bloedvaten":"anatomie","lymfestelsel":"anatomie","huid":"anatomie","urinair-stelsel":"anatomie",
  "spierstelsel":"fysiologie","zenuwstelsel-bouw":"fysiologie","ruggenmerg-reflexen":"fysiologie","autonoom-zenuwstelsel":"fysiologie","vertering-opname":"fysiologie","ademhalingsmechanisme":"fysiologie","gasuitwisseling":"fysiologie","algemene-zintuigen":"fysiologie","moleculaire-organisatie":"fysiologie","stofwisseling":"fysiologie","endocrien-stelsel":"fysiologie",
  "hygiene":"infectiebeheersing","infectiepreventie":"infectiebeheersing","ziekenhuishygiene":"infectiebeheersing","veilig-werken":"infectiebeheersing",
  "farmacologie-basis":"farmacologie","geneesmiddelen":"farmacologie",
};

const TOPIC_ICONS: Record<string, string> = {
  "beenderstelsel": "🦴",
  "gewrichten-beweging": "🦿",
  "axiaal-skelet": "🩻",
  "appendiculair-skelet": "🦾",
  "belangrijkste-spieren": "💪",
  "hersenen": "🧠",
  "mond-slikken": "👄",
  "maag-darmen": "🫃",
  "lever-gal-pancreas": "🧬",
  "ademhalingsstelsel-bouw": "🫁",
  "oog": "👁️",
  "oor-reuk-smaak": "👂",
  "topografie": "🧭",
  "cytologie": "🔬",
  "histologie": "🧫",
  "voortplantingsstelsel": "🌱",
  "bloed": "🩸",
  "hart": "❤️",
  "bloedvaten": "🫀",
  "lymfestelsel": "🛡️",
  "huid": "🖐️",
  "urinair-stelsel": "💧",
  "spierstelsel": "⚙️",
  "zenuwstelsel-bouw": "⚡",
  "ruggenmerg-reflexen": "🔁",
  "autonoom-zenuwstelsel": "🌿",
  "vertering-opname": "🍽️",
  "ademhalingsmechanisme": "🌬️",
  "gasuitwisseling": "♻️",
  "algemene-zintuigen": "✨",
  "moleculaire-organisatie": "⚛️",
  "stofwisseling": "🔥",
  "endocrien-stelsel": "🧪",
  "hygiene": "🧼",
  "infectiepreventie": "🧴",
  "ziekenhuishygiene": "🏥",
  "veilig-werken": "⛑️",
  "farmacologie-basis": "💊",
  "geneesmiddelen": "🩺",
};


function FlashcardIcon() {
  return (
    <svg viewBox="0 0 96 96" role="img" aria-label="Flashcards" className={styles.flashcardSvg}>
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="28" y="14" width="48" height="62" rx="8" transform="rotate(7 52 45)" opacity=".45" />
        <rect x="19" y="20" width="50" height="64" rx="9" />
        <path d="M31 39h27M31 51h21M31 63h16" />
        <path d="M41 27l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="currentColor" strokeWidth="2" />
      </g>
    </svg>
  );
}

function StatIcon({ type }: { type: "topics" | "cards" | "known" | "progress" }) {
  const symbols = { topics: "▦", cards: "▣", known: "✓", progress: "✦" } as const;
  return <span className={`${styles.statIcon} ${styles[`statIcon_${type}`]}`} aria-hidden="true">{symbols[type]}</span>;
}

function AnimatedIcon({ icon, mastered = false, subtle = false }: { icon: string; mastered?: boolean; subtle?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(node, { scale: 0.55, rotate: -12, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.58, ease: "back.out(1.9)" });
      if (!subtle) {
        gsap.to(node, { y: -3, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: Math.random() * 0.5 });
      }
      if (mastered) {
        gsap.fromTo(node, { scale: 0.85 }, { scale: 1.12, repeat: 1, yoyo: true, duration: 0.22, ease: "power2.out" });
      }
    }, node);
    return () => ctx.revert();
  }, [mastered, subtle]);

  const onEnter = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { scale: 1.16, rotate: 7, duration: 0.25, ease: "back.out(2)" });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { scale: 1, rotate: 0, duration: 0.25, ease: "power2.out" });
  };

  return (
    <span ref={ref} className={styles.animatedIcon} aria-hidden="true" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {mastered ? "✓" : icon}
    </span>
  );
}

export default function FlashcardTrainer({ sets }: { sets: FlashcardSet[] }) {
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<MainCategory | null>(null);
  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [onlyLearning, setOnlyLearning] = useState(false);
  const [cardStatuses, setCardStatuses] = useState<Record<string, CardStatus>>({});
  const [masteredSets, setMasteredSets] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const catalogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StoredProgress;
        setCardStatuses(parsed.cardStatuses ?? {});
        setMasteredSets(parsed.masteredSets ?? {});
      }
    } catch {
      // Ongeldige lokale gegevens worden veilig genegeerd.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cardStatuses, masteredSets }));
  }, [cardStatuses, masteredSets, hydrated]);

  const categorizedSets = useMemo(() => sets.map((set) => ({ ...set, category: set.category ?? CATEGORY_BY_SET[set.id] ?? "fysiologie" })), [sets]);
  const activeSet = categorizedSets.find((set) => set.id === activeSetId) ?? null;
  const activeCategoryResolved = activeSet?.category ?? activeCategory;
  const siblingSets = activeCategoryResolved ? categorizedSets.filter((set) => set.category === activeCategoryResolved) : [];

  const filteredSets = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = activeCategory ? categorizedSets.filter((set) => set.category === activeCategory) : categorizedSets;
    if (!query) return source;
    return source.filter((set) => `${set.title} ${set.description ?? ""}`.toLowerCase().includes(query));
  }, [search, categorizedSets, activeCategory]);

  const availableCards = useMemo(() => {
    if (!activeSet) return [];
    const cards = onlyLearning ? activeSet.cards.filter((card) => cardStatuses[card.id] !== "known") : activeSet.cards;
    return isShuffled ? [...cards].sort(() => Math.random() - 0.5) : cards;
  }, [activeSet, cardStatuses, onlyLearning, isShuffled]);

  const currentCard = availableCards[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeSetId, onlyLearning, isShuffled]);

  useEffect(() => {
    if (!cardRef.current || !currentCard) return;
    gsap.fromTo(cardRef.current, { opacity: 0, y: 14, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: "power2.out" });
  }, [currentCard?.id]);

  useEffect(() => {
    if (!catalogRef.current || activeSet) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.heroContent}`, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .75, ease: "power3.out" });
      gsap.fromTo(`.${styles.heroStats}`, { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: .75, delay: .12, ease: "power3.out" });
      gsap.fromTo(`.${styles.categoryCard}`, { opacity: 0, y: 24, scale: .985 }, { opacity: 1, y: 0, scale: 1, duration: .55, stagger: .09, delay: .18, ease: "power3.out" });
      gsap.to(`.${styles.heroFlashcardIcon}`, { y: -7, rotate: 1.8, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(`.${styles.ambientOrb}`, { x: 18, y: -12, duration: 5.5, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: .7 });
    }, catalogRef);
    return () => ctx.revert();
  }, [activeSet, activeCategory]);

  const openSet = (setId: string) => {
    const nextSet = categorizedSets.find((set) => set.id === setId);
    if (nextSet?.category) setActiveCategory(nextSet.category);
    setActiveSetId(setId);
    setCurrentIndex(0);
    setIsFlipped(false);
    setOnlyLearning(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goTo = (index: number) => {
    if (!availableCards.length) return;
    setCurrentIndex((index + availableCards.length) % availableCards.length);
    setIsFlipped(false);
  };

  const markCard = (status: CardStatus) => {
    if (!currentCard) return;
    setCardStatuses((previous) => ({ ...previous, [currentCard.id]: status }));
    goTo(currentIndex + 1);
  };

  const resetSet = () => {
    if (!activeSet) return;
    const ids = new Set(activeSet.cards.map((card) => card.id));
    setCardStatuses((previous) => Object.fromEntries(Object.entries(previous).filter(([id]) => !ids.has(id))));
    setMasteredSets((previous) => ({ ...previous, [activeSet.id]: false }));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!activeSet) {
    const masteredCount = sets.filter((set) => masteredSets[set.id]).length;
    const totalCards = sets.reduce((sum, set) => sum + set.cards.length, 0);
    const knownCards = sets.reduce((sum, set) => sum + set.cards.filter((card) => cardStatuses[card.id] === "known").length, 0);
    const globalProgress = totalCards ? Math.round((knownCards / totalCards) * 100) : 0;

    return (
      <main ref={catalogRef} className={styles.catalogShell}>
        <span className={`${styles.ambientOrb} ${styles.orbOne}`} aria-hidden="true" />
        <span className={`${styles.ambientOrb} ${styles.orbTwo}`} aria-hidden="true" />
        <header className={styles.catalogHeader}>
          <div className={styles.heroMain}>
            <div className={styles.heroFlashcardIcon}><FlashcardIcon /></div>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>Studio SaGo Academy</span>
              <h1>Flashcards</h1>
              <p>Kies een onderwerp, oefen op je eigen tempo en duid zelf aan wat je volledig beheerst.</p>
              <div className={styles.overallProgress}><span className={styles.progressPulse} /><strong>{masteredCount} van {sets.length}</strong> onderwerpen onder de knie</div>
            </div>
            <div className={styles.heroStats}>
              <div><StatIcon type="topics" /><strong>{sets.length}</strong><span>onderwerpen</span></div>
              <div><StatIcon type="cards" /><strong>{totalCards}</strong><span>flashcards</span></div>
              <div><StatIcon type="known" /><strong>{knownCards}</strong><span>gekend</span></div>
              <div><StatIcon type="progress" /><strong>{globalProgress}%</strong><span>voortgang</span></div>
            </div>
          </div>
          <div className={styles.searchWrap}><span aria-hidden="true">⌕</span><input className={styles.searchInput} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Zoek een onderwerp…" aria-label="Zoek een onderwerp" /></div>
        </header>

        {!activeCategory ? (
          <section className={styles.categoryGrid} aria-label="Hoofdcategorieën">
            {(Object.entries(CATEGORY_META) as [MainCategory, typeof CATEGORY_META[MainCategory]][]).map(([key, meta]) => {
              const categorySets = categorizedSets.filter((set) => set.category === key);
              const total = categorySets.reduce((sum, set) => sum + set.cards.length, 0);
              return (
                <button key={key} className={styles.categoryCard} onClick={() => setActiveCategory(key)}>
                  <span className={styles.categoryIcon}><AnimatedIcon icon={meta.icon} /></span>
                  <span><strong>{meta.title}</strong><small>{meta.description}</small><em>{categorySets.length} onderwerpen · {total} flashcards</em></span>
                  <b>›</b>
                </button>
              );
            })}
          </section>
        ) : (
          <>
            <button className={styles.categoryBack} onClick={() => setActiveCategory(null)}>← Alle hoofdcategorieën</button>
            <div className={styles.categoryHeading}>
              <span className={styles.categoryHeadingIcon}><AnimatedIcon icon={CATEGORY_META[activeCategory].icon} /></span>
              <div><h2 className={styles.categoryTitle}>{CATEGORY_META[activeCategory].title}</h2><p>{CATEGORY_META[activeCategory].description}</p></div>
            </div>
          </>
        )}

        {activeCategory && (
          <section className={styles.setGrid} aria-label="Flashcardonderwerpen">
            {filteredSets.map((set) => {
              const known = set.cards.filter((card) => cardStatuses[card.id] === "known").length;
              const progress = set.cards.length ? Math.round((known / set.cards.length) * 100) : 0;
              const mastered = Boolean(masteredSets[set.id]);
              return (
                <article key={set.id} className={`${styles.setCard} ${mastered ? styles.setMastered : ""}`}>
                  <button className={styles.setOpenButton} onClick={() => openSet(set.id)}>
                    <span className={styles.setIcon}><AnimatedIcon icon={TOPIC_ICONS[set.id] ?? CATEGORY_META[set.category ?? "fysiologie"].icon} mastered={mastered} subtle /></span>
                    <span className={styles.setContent}>
                      <strong>{set.title}</strong><small>{set.cards.length} flashcards</small>
                      <span className={styles.miniTrack}><i style={{ width: `${progress}%` }} /></span>
                      <span className={styles.miniProgress}>{known} gekend · {progress}%</span>
                    </span>
                    <span className={styles.chevron}>›</span>
                  </button>
                  <label className={styles.masterToggle}><input type="checkbox" checked={mastered} onChange={(event) => setMasteredSets((previous) => ({ ...previous, [set.id]: event.target.checked }))} /><span>Dit onderwerp heb ik onder de knie</span></label>
                </article>
              );
            })}
          </section>
        )}
      </main>
    );
  }

  const knownCount = activeSet.cards.filter((card) => cardStatuses[card.id] === "known").length;
  const learningCount = activeSet.cards.filter((card) => cardStatuses[card.id] === "learning").length;
  const progress = activeSet.cards.length ? Math.round((knownCount / activeSet.cards.length) * 100) : 0;
  const currentStatus = currentCard ? cardStatuses[currentCard.id] ?? "new" : "new";

  return (
    <main className={styles.studyDashboard}>
      <div className={styles.studyTopbar}>
        <button className={styles.backButton} onClick={() => setActiveSetId(null)}>← Alle onderwerpen</button>
        <div className={styles.studyBrand}><span className={styles.studyBrandIcon}><AnimatedIcon icon={CATEGORY_META[activeSet.category ?? "fysiologie"].icon} /></span><div><span className={styles.eyebrow}>Studio SaGo Academy</span><strong>{CATEGORY_META[activeSet.category ?? "fysiologie"].title}</strong></div></div>
        <button className={styles.secondaryButton} onClick={resetSet}>Voortgang wissen</button>
      </div>

      <div className={styles.studyLayout}>
        <aside className={styles.topicSidebar}>
          <div className={styles.sidebarHeader}><span>{siblingSets.length} onderwerpen</span><strong>{CATEGORY_META[activeSet.category ?? "fysiologie"].title}</strong></div>
          <nav className={styles.topicList} aria-label="Onderwerpen binnen deze categorie">
            {siblingSets.map((set) => {
              const known = set.cards.filter((card) => cardStatuses[card.id] === "known").length;
              const isActive = set.id === activeSet.id;
              return (
                <button key={set.id} className={`${styles.topicItem} ${isActive ? styles.topicItemActive : ""}`} onClick={() => openSet(set.id)}>
                  <span className={styles.topicItemIcon}><AnimatedIcon icon={TOPIC_ICONS[set.id] ?? "•"} mastered={Boolean(masteredSets[set.id])} subtle /></span>
                  <span className={styles.topicItemLabel}>{set.title}</span>
                  <span className={styles.topicItemCount}>{known}/{set.cards.length}</span>
                </button>
              );
            })}
          </nav>
          <label className={styles.sidebarMasterToggle}><input type="checkbox" checked={Boolean(masteredSets[activeSet.id])} onChange={(event) => setMasteredSets((previous) => ({ ...previous, [activeSet.id]: event.target.checked }))} /><span>Dit onderwerp heb ik onder de knie</span></label>
        </aside>

        <section className={styles.studyWorkspace}>
          <header className={styles.workspaceHeader}>
            <div><span className={styles.eyebrow}>Actief onderwerp</span><h1>{activeSet.title}</h1><p>{activeSet.description ?? "Draai de kaart om en beoordeel daarna zelf je kennis."}</p></div>
            <div className={styles.workspaceProgress}><strong>{knownCount} / {activeSet.cards.length}</strong><span>gekend · {progress}%</span></div>
          </header>

          <div className={styles.progressPanel}>
            <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
            <div className={styles.statusToolbar}>
              <span className={styles.statusChip}><i className={styles.dotNew} />{activeSet.cards.length - knownCount - learningCount} Nieuw</span>
              <span className={styles.statusChip}><i className={styles.dotLearning} />{learningCount} Nog oefenen</span>
              <span className={styles.statusChip}><i className={styles.dotKnown} />{knownCount} Gekend</span>
              <button className={`${styles.toolButton} ${isShuffled ? styles.toolButtonActive : ""}`} onClick={() => setIsShuffled((value) => !value)}>⇄ Willekeurig</button>
              <button className={`${styles.toolButton} ${onlyLearning ? styles.toolButtonActive : ""}`} onClick={() => setOnlyLearning((value) => !value)}>Alleen nog oefenen</button>
            </div>
          </div>

          {currentCard ? (
            <>
              <div className={styles.studyArea}>
                <button className={styles.navButton} onClick={() => goTo(currentIndex - 1)} aria-label="Vorige kaart">←</button>
                <button ref={cardRef} className={`${styles.cardScene} ${isFlipped ? styles.isFlipped : ""}`} onClick={() => setIsFlipped((value) => !value)}>
                  <span className={styles.cardInner}>
                    <span className={`${styles.cardFace} ${styles.cardFront}`}>
                      <span className={styles.cardMeta}><span>{currentIndex + 1} / {availableCards.length}</span><span className={styles.statusPill} data-status={currentStatus}>{currentStatus === "known" ? "Gekend" : currentStatus === "learning" ? "Nog oefenen" : "Nieuw"}</span></span>
                      <span className={styles.cardContent}><small>Vraag</small><strong>{currentCard.term}</strong></span>
                      <span className={styles.flipInstruction}>Klik om het antwoord te bekijken</span>
                    </span>
                    <span className={`${styles.cardFace} ${styles.cardBack}`}>
                      <span className={styles.cardMeta}><span>{currentIndex + 1} / {availableCards.length}</span><span className={styles.statusPill} data-status={currentStatus}>{currentStatus === "known" ? "Gekend" : currentStatus === "learning" ? "Nog oefenen" : "Nieuw"}</span></span>
                      <span className={styles.cardContent}><small>Antwoord</small><strong>{currentCard.definition}</strong></span>
                      <span className={styles.flipInstruction}>Klik om de vraag opnieuw te tonen</span>
                    </span>
                  </span>
                </button>
                <button className={styles.navButton} onClick={() => goTo(currentIndex + 1)} aria-label="Volgende kaart">→</button>
              </div>
              <div className={styles.answerActions}>
                <button className={styles.learningButton} onClick={() => markCard("learning")}><span>↻</span>Nog oefenen</button>
                <button className={styles.knownButton} onClick={() => markCard("known")}><span>✓</span>Ik ken dit</button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}><h2>Alles uit deze oefenlijst is gekend</h2><p>Zet “Alleen nog oefenen” uit om alle kaarten opnieuw te bekijken.</p></div>
          )}
        </section>
      </div>
    </main>
  );
}
