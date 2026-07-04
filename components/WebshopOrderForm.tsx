"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  calculateCorrectionPrice,
  webshopProducts,
} from "@/lib/webshopProducts";

type Props = {
  product: string;
};

export default function WebshopOrderForm({ product }: Props) {
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState("");
  const [error, setError] = useState("");

  const isTextCorrection = product === "tekstcorrectie";

  const correctionPrice = useMemo(() => {
    const words = Number(wordCount || 0);
    if (!words) return 20;
    return calculateCorrectionPrice(words);
  }, [wordCount]);

  const productInfo =
    product in webshopProducts
      ? webshopProducts[product as keyof typeof webshopProducts]
      : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    formData.set("product", product);

    if (isTextCorrection) {
      formData.set("amount", String(correctionPrice));
    }

    const response = await fetch("/api/checkout/webshop", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      setLoading(false);
      setError(data.error || "De betaling kon niet gestart worden.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <form className="form-card booking-form-with-calendar" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Naam ouder / klant
          <input name="parent_name" required />
        </label>

        <label>
          E-mail
          <input name="email" type="email" required />
        </label>

        <label>
          Telefoon
          <input name="phone" type="tel" required />
        </label>

        {!isTextCorrection && (
          <>
            <label>
              Naam leerling
              <input name="student_name" required />
            </label>

            <label>
              Leeftijd leerling
              <input name="student_age" type="number" min="4" max="20" required />
            </label>

            <label>
              Studiejaar / leerjaar
              <select name="school_year" required>
                <option value="">Kies studiejaar</option>

                {product === "10-beurtenkaart-lager" && (
                  <>
                    <option value="1e leerjaar">1e leerjaar</option>
                    <option value="2e leerjaar">2e leerjaar</option>
                    <option value="3e leerjaar">3e leerjaar</option>
                    <option value="4e leerjaar">4e leerjaar</option>
                    <option value="5e leerjaar">5e leerjaar</option>
                    <option value="6e leerjaar">6e leerjaar</option>
                  </>
                )}

                {product === "10-beurtenkaart-secundair" && (
                  <>
                    <option value="1e middelbaar">1e middelbaar</option>
                    <option value="2e middelbaar">2e middelbaar</option>
                    <option value="3e middelbaar">3e middelbaar</option>
                    <option value="4e middelbaar">4e middelbaar</option>
                    <option value="5e middelbaar">5e middelbaar</option>
                    <option value="6e middelbaar">6e middelbaar</option>
                  </>
                )}

                {product === "klaar-voor-de-sprong-middelbaar" && (
                  <>
                    <option value="6e leerjaar">6e leerjaar</option>
                    <option value="1e middelbaar">1e middelbaar</option>
                  </>
                )}

                {product === "klaar-voor-de-sprong-eerste-leerjaar" && (
                  <>
                    <option value="3e kleuterklas">3e kleuterklas</option>
                    <option value="1e leerjaar">1e leerjaar</option>
                  </>
                )}
              </select>
            </label>

            <label>
              School
              <input name="school" />
            </label>
          </>
        )}

        {isTextCorrection && (
          <>
            <label>
              Aantal woorden
              <input
                name="word_count"
                type="number"
                min="1"
                value={wordCount}
                onChange={(event) => setWordCount(event.target.value)}
                required
              />
            </label>

            <label>
              Type tekst
              <select name="text_type" required>
                <option value="">Kies type tekst</option>
                <option value="cursus">Cursus</option>
                <option value="paper">Paper</option>
                <option value="taak">Taak</option>
                <option value="scriptie">Scriptie</option>
                <option value="sollicitatie">Sollicitatiebrief</option>
                <option value="andere">Andere</option>
              </select>
            </label>

            <label>
              Bestand uploaden
              <input name="file" type="file" accept=".pdf,.doc,.docx" required />
            </label>
          </>
        )}
      </div>

      <label style={{ marginTop: 20, display: "block" }}>
        Opmerkingen
        <textarea
          name="notes"
          rows={5}
          placeholder="Zijn er zaken waarmee ik rekening kan houden?"
        />
      </label>

      <p className="form-message">
        Te betalen:{" "}
        <strong>
          €
          {isTextCorrection
            ? correctionPrice
            : productInfo?.amount.replace(".00", "")}
        </strong>
      </p>

      {error && (
        <p className="form-message" style={{ color: "#fe2020" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
        <button className="primary-action" type="submit" disabled={loading}>
          {loading ? "Betaling starten..." : "Betaal nu"}
        </button>
      </div>
    </form>
  );
}