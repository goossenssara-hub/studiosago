"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/app/styles/leerling-login.css";

const leerlingAccounts: Record<string, string> = {
  "victor.koolen": "victor.koolen@studiosago.be",
  "victor.koolen@studiosago.be": "victor.koolen@studiosago.be",

  "lou.koolen": "lou.koolen@studiosago.be",
  "lou.koolen@studiosago.be": "lou.koolen@studiosago.be",

  "shaniyah.kinsabil": "shaniyah.kinsabil@leerling.studiosago.be",
  "shaniyah.kinsabil@leerling.studiosago.be":
    "shaniyah.kinsabil@leerling.studiosago.be",
};

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="login-svg-icon"
    >
      <path
        d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.7 20c.8-3.6 3.5-5.5 7.3-5.5s6.5 1.9 7.3 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="login-svg-icon"
    >
      <rect
        x="5.2"
        y="10.2"
        width="13.6"
        height="10"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8.3 10.2V7.8a3.7 3.7 0 0 1 7.4 0v2.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 14.3v2.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="button-arrow-icon"
    >
      <path
        d="M5 12h13M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="feature-check-icon"
    >
      <path
        d="m6.5 12.2 3.4 3.4 7.7-8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LeerlingLoginClient() {
  const router = useRouter();

  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [toonWachtwoord, setToonWachtwoord] = useState(false);
  const [onthoudMij, setOnthoudMij] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const opgeslagenGebruikersnaam = localStorage.getItem(
      "studio-sago-leerling",
    );

    if (opgeslagenGebruikersnaam) {
      setGebruikersnaam(opgeslagenGebruikersnaam);
      setOnthoudMij(true);
    }
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const key = gebruikersnaam.toLowerCase().trim();

    if (!key || !wachtwoord.trim()) {
      setError("Vul je gebruikersnaam en wachtwoord in.");
      return;
    }

    const email = leerlingAccounts[key];

    if (!email) {
      setError(
        "Deze gebruikersnaam bestaat niet. Controleer of je alles juist hebt geschreven.",
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password: wachtwoord,
        });

      if (loginError) {
        setError(
          "De gebruikersnaam of het wachtwoord is niet juist. Probeer opnieuw.",
        );
        return;
      }

      if (onthoudMij) {
        localStorage.setItem("studio-sago-leerling", key);
      } else {
        localStorage.removeItem("studio-sago-leerling");
      }

      router.replace("/dashboard/oefenen");
      router.refresh();
    } catch {
      setError(
        "Aanmelden lukt momenteel niet. Controleer je internetverbinding en probeer opnieuw.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="leerling-login-page">
      <span
        className="login-background-shape login-background-shape-one"
        aria-hidden="true"
      />

      <span
        className="login-background-shape login-background-shape-two"
        aria-hidden="true"
      />

      <span
        className="login-background-shape login-background-shape-three"
        aria-hidden="true"
      />

      <section
        className="leerling-login-shell"
        aria-label="Studio SaGo leerlingportaal"
      >
        <div className="leerling-login-left">
          <Link
            href="/"
            className="back-home-button"
            aria-label="Terug naar de homepagina"
          >
            <span className="back-home-arrow" aria-hidden="true">
              ←
            </span>

            <span>Terug naar home</span>
          </Link>

          <form
            onSubmit={handleLogin}
            className="leerling-login-form"
            noValidate
          >
            <div className="login-heading">
              <p className="portal-pill">
                <span
                  className="portal-pill-dot"
                  aria-hidden="true"
                />

                Studio SaGo leerlingportaal
              </p>

              <h1>
                Welkom
                <br />
                <span>terug!</span>
              </h1>

              <p className="login-subtitle">
                Meld je aan en ga meteen verder met je planner,
                oefeningen, huistaken en to-do&apos;s.
              </p>
            </div>

            <div className="login-fields">
              <label className="login-field">
                <span className="login-label">
                  Gebruikersnaam
                </span>

                <div className="login-input-wrap">
                  <span className="login-icon">
                    <UserIcon />
                  </span>

                  <input
                    type="text"
                    value={gebruikersnaam}
                    onChange={(event) => {
                      setGebruikersnaam(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="voornaam.achternaam"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={Boolean(error)}
                  />
                </div>
              </label>

              <label className="login-field">
                <span className="login-label">
                  Wachtwoord
                </span>

                <div className="login-input-wrap">
                  <span className="login-icon">
                    <LockIcon />
                  </span>

                  <input
                    type={toonWachtwoord ? "text" : "password"}
                    value={wachtwoord}
                    onChange={(event) => {
                      setWachtwoord(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Vul je wachtwoord in"
                    autoComplete="current-password"
                    aria-invalid={Boolean(error)}
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setToonWachtwoord(
                        (huidigeWaarde) => !huidigeWaarde,
                      )
                    }
                    aria-label={
                      toonWachtwoord
                        ? "Wachtwoord verbergen"
                        : "Wachtwoord tonen"
                    }
                  >
                    {toonWachtwoord ? "Verberg" : "Toon"}
                  </button>
                </div>
              </label>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={onthoudMij}
                  onChange={(event) =>
                    setOnthoudMij(event.target.checked)
                  }
                />

                <span
                  className="custom-checkbox"
                  aria-hidden="true"
                >
                  <CheckIcon />
                </span>

                <span>Onthoud mijn gebruikersnaam</span>
              </label>

              <Link
                href="/wachtwoord-vergeten"
                className="forgot-password"
              >
                Wachtwoord vergeten?
              </Link>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span
                  className="login-error-icon"
                  aria-hidden="true"
                >
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Even aanmelden..."
                  : "Naar mijn portaal"}
              </span>

              <span className="login-submit-arrow">
                {loading ? (
                  <span
                    className="login-spinner"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowIcon />
                )}
              </span>
            </button>

            <div className="account-note">
              <span
                className="account-note-icon"
                aria-hidden="true"
              >
                ?
              </span>

              <p>
                Nog geen account of lukt aanmelden niet?
                <br />
                <span>Vraag hulp aan Studio SaGo.</span>
              </p>
            </div>
          </form>
        </div>

        <aside
          className="leerling-login-right"
          aria-label="Illustratie van het leerlingportaal"
        >
          <img
            className="portal-bg"
            src="/assets/leerling-login/portal-panel-bg.png"
            alt=""
            aria-hidden="true"
          />

          <div className="portal-overlay" aria-hidden="true" />
          <div className="portal-glow" aria-hidden="true" />

          <div className="portal-top-content">
            <p className="portal-eyebrow">
              Jouw persoonlijke leeromgeving
            </p>

            <h2>
              Alles wat je nodig hebt,
              <span>op één rustige plek.</span>
            </h2>

            <div className="portal-features">
              <span>
                <CheckIcon />
                Planner
              </span>

              <span>
                <CheckIcon />
                Oefeningen
              </span>

              <span>
                <CheckIcon />
                To-do&apos;s
              </span>
            </div>
          </div>

          <div className="student-circle-wrap">
            <span
              className="student-circle-ring student-circle-ring-one"
              aria-hidden="true"
            />

            <span
              className="student-circle-ring student-circle-ring-two"
              aria-hidden="true"
            />

            <img
              className="student-circle"
              src="/assets/leerling-login/student-circle.png"
              alt=""
              aria-hidden="true"
            />

            <span className="student-status">
              <span aria-hidden="true" />
              Klaar om te leren
            </span>
          </div>

          <div className="portal-card-grid">
            <div className="portal-card portal-card-today">
              <span className="portal-card-icon">
                <img
                  src="/assets/leerling-login/today-icon.png"
                  alt=""
                  aria-hidden="true"
                />
              </span>

              <div className="portal-card-copy">
                <span>Vandaag</span>
                <strong>3 taken klaar</strong>
              </div>

              <span
                className="portal-card-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </div>

            <div className="portal-card portal-card-planner">
              <span className="portal-card-icon">
                <img
                  src="/assets/leerling-login/planner-icon.png"
                  alt=""
                  aria-hidden="true"
                />
              </span>

              <div className="portal-card-copy">
                <span>Planner</span>
                <strong>Bekijk je week</strong>
              </div>

              <span
                className="portal-card-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </div>
          </div>

          <p className="portal-footer-note">
            Stap voor stap groeien met Studio SaGo
          </p>
        </aside>
      </section>
    </main>
  );
}