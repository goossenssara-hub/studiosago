"use client";

import Link from "next/link";
import { firstSecondarySkills } from "@/lib/oefeningen/middelbaar/skills";

const subjectOrder = ["Wiskunde", "Nederlands", "Leren leren"] as const;

export default function EersteMiddelbaarOverzichtClient() {
  return (
    <main className="oefenpagina">
      <div className="exercise-back">
        <Link className="back-button" href="/oefenen/middelbaar">
          ← Terug naar de leerjaren
        </Link>
      </div>

      <section className="oefen-hero">
        <p className="eyebrow">Studio SaGo Leerlingportaal</p>
        <h1>Oefenen voor het 1e middelbaar</h1>
        <p>
          Kies een vak en vaardigheid. De grootste nadruk ligt op het begrijpen
          van opdrachten en wiskundige vraagstukken.
        </p>
      </section>

      <section className="focus-banner">
        <div>
          <span>Persoonlijke focus</span>
          <h2>Eerst begrijpen, dan oplossen</h2>
          <p>
            Lees de vraag, markeer sleutelwoorden, zeg in je eigen woorden wat
            je moet doen en kies daarna pas een antwoord of bewerking.
          </p>
        </div>
        <div className="focus-steps">
          <span>1. Lees</span>
          <span>2. Markeer</span>
          <span>3. Vertel</span>
          <span>4. Los op</span>
          <span>5. Controleer</span>
        </div>
      </section>

      {subjectOrder.map((subject) => {
        const skills = firstSecondarySkills.filter(
          (skill) => skill.subject === subject
        );

        return (
          <section className="skill-subject-section" key={subject}>
            <div className="subject-heading">
              <p className="eyebrow">{subject}</p>
              <h2>{subject}</h2>
            </div>

            <div className="skill-grid">
              {skills.map((skill) => (
                <Link
                  className="skill-card"
                  href={`/oefenen/middelbaar/eerste/${skill.slug}`}
                  key={skill.slug}
                >
                  <span className="skill-icon">{skill.icon}</span>
                  <div>
                    <h3>{skill.title}</h3>
                    <p>{skill.description}</p>
                  </div>

                  <ul>
                    {skill.focus.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <span className="skill-open">Start oefenen →</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
