"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  initialError?: string;
};

type CompleteActivationResponse = {
  success?: boolean;
  error?: string;
};

function validatePassword(
  password: string
): string | null {
  if (password.length < 12) {
    return "Je wachtwoord moet minstens 12 tekens bevatten.";
  }

  if (!/[a-z]/.test(password)) {
    return "Gebruik minstens één kleine letter.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Gebruik minstens één hoofdletter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Gebruik minstens één cijfer.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Gebruik minstens één speciaal teken.";
  }

  return null;
}

export default function AccountActivationForm({
  initialError = "",
}: Props) {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [sessionAvailable, setSessionAvailable] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState(initialError);

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setSessionAvailable(false);

        if (!initialError) {
          setErrorMessage(
            "Open deze pagina via de beveiligde link in je uitnodigingsmail."
          );
        }
      } else {
        setSessionAvailable(true);
      }

      setCheckingSession(false);
    }

    void checkSession();
  }, [initialError]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const passwordError =
      validatePassword(password);

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "De twee wachtwoorden zijn niet gelijk."
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      /*
       * De ouder kiest hier zelf het wachtwoord.
       * Het wachtwoord wordt rechtstreeks door Supabase Auth verwerkt
       * en wordt niet in een eigen databasetabel opgeslagen.
       */
      const { error: updatePasswordError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updatePasswordError) {
        throw new Error(
          updatePasswordError.message ||
            "Het wachtwoord kon niet ingesteld worden."
        );
      }

      const response = await fetch(
        "/api/account/complete-activation",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result =
        (await response.json()) as CompleteActivationResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Het profiel kon niet geactiveerd worden."
        );
      }

      setSuccessMessage(
        "Je account is geactiveerd. Je wordt doorgestuurd naar je dashboard."
      );

      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error(
        "COMPLETE ACCOUNT ACTIVATION ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Je account kon niet geactiveerd worden."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <section className="account-activation-card">
        <p className="account-activation-eyebrow">
          Studio SaGo
        </p>

        <h1>Activatielink controleren...</h1>

        <p>
          Even geduld. Je beveiligde sessie wordt gecontroleerd.
        </p>
      </section>
    );
  }

  if (!sessionAvailable) {
    return (
      <section className="account-activation-card">
        <p className="account-activation-eyebrow">
          Account activeren
        </p>

        <h1>De activatielink werkt niet</h1>

        <div className="account-activation-error">
          {errorMessage ||
            "De link is ongeldig of verlopen."}
        </div>

        <p>
          Vraag een nieuwe uitnodiging aan via Studio SaGo.
        </p>
      </section>
    );
  }

  return (
    <section className="account-activation-card">
      <div className="account-activation-icon">
        🔐
      </div>

      <p className="account-activation-eyebrow">
        Welkom bij Studio SaGo
      </p>

      <h1>Kies je wachtwoord</h1>

      <p className="account-activation-intro">
        Stel zelf een veilig wachtwoord in. Daarna kun je
        aanmelden en vind je de gekoppelde leerlingen,
        aankopen en afspraken in je dashboard.
      </p>

      {errorMessage && (
        <div
          className="account-activation-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          className="account-activation-success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="account-activation-form"
      >
        <label>
          <span>Nieuw wachtwoord</span>

          <div className="account-activation-password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              minLength={12}
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              aria-label={
                showPassword
                  ? "Wachtwoord verbergen"
                  : "Wachtwoord tonen"
              }
            >
              {showPassword ? "Verbergen" : "Tonen"}
            </button>
          </div>
        </label>

        <label>
          <span>Herhaal het wachtwoord</span>

          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            autoComplete="new-password"
            minLength={12}
            required
          />
        </label>

        <div className="account-activation-requirements">
          <strong>Een veilig wachtwoord bevat:</strong>

          <span>minstens 12 tekens</span>
          <span>een hoofdletter en kleine letter</span>
          <span>een cijfer</span>
          <span>een speciaal teken</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="account-activation-submit"
        >
          {loading
            ? "Account activeren..."
            : "Wachtwoord instellen en doorgaan"}
        </button>
      </form>
    </section>
  );
}