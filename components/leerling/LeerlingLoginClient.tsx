"use client";

import { useState } from "react";

export default function LeerlingLoginClient() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="leerling-login-page">
      <section className="leerling-login-card">
        <div className="leerling-login-left">
          <p className="leerling-login-badge">Studio SaGo leerlingportaal</p>

          <h1>Welkom terug!</h1>

          <p className="leerling-login-text">
            Meld je aan om je planner, huistaken en to-do’s te bekijken.
          </p>

          <form className="leerling-login-form">
            <label>
              Gebruikersnaam
              <div className="leerling-input">
                <span>✉️</span>
                <input
                  type="email"
                  placeholder="voornaam.achternaam@studiosago.be"
                />
              </div>
            </label>

            <label>
              Wachtwoord
              <div className="leerling-input">
                <span>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Wachtwoord"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Verberg" : "Toon"}
                </button>
              </div>
            </label>

            <div className="leerling-options">
              <label>
                <input type="checkbox" />
                Onthoud mij
              </label>

              <a href="/forgot-password">Wachtwoord vergeten?</a>
            </div>

            <button className="leerling-submit" type="submit">
              Aanmelden →
            </button>
          </form>

          <p className="leerling-help">
            Nog geen account? Vraag je account aan bij Studio SaGo.
          </p>
        </div>

        <div className="leerling-login-right">
          <div className="leerling-icon">📚</div>

          <div className="leerling-mini-card">
            <strong>Vandaag</strong>
            <span>3 taken klaar</span>
          </div>

          <div className="leerling-mini-card second">
            <strong>Planner</strong>
            <span>Weekoverzicht</span>
          </div>
        </div>
      </section>
    </main>
  );
}