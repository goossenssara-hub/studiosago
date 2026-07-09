"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  calculateCorrectionPrice,
  webshopProducts,
} from "@/lib/webshopProducts";

type Props = {
  product: string;
};

const DISCOUNT_CODES = [
  "4KX9-MP7Q-L2ZT-81NR",
  "Q7LP-82XM-V4KT-9R31",
  "ZX81-TQ7M-NP46-KL2R",
];

export default function WebshopOrderForm({ product }: Props) {
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState("");
  const [error, setError] = useState("");
  const [discountCode, setDiscountCode] = useState("");

  const isTextCorrection = product === "tekstcorrectie";

  const isTenBeurtenkaart =
    product === "10-beurtenkaart-lager" ||
    product === "10-beurtenkaart-secundair";

  const correctionPrice = useMemo(() => {
    const words = Number(wordCount || 0);
    if (!words) return 20;
    return calculateCorrectionPrice(words);
  }, [wordCount]);

  const productInfo =
    product in webshopProducts
      ? webshopProducts[product as keyof typeof webshopProducts]
      : null;

  const basePrice = isTextCorrection
    ? correctionPrice
    : Number(productInfo?.amount || 0);

  const discountCodeLooksValid =
    isTenBeurtenkaart &&
    DISCOUNT_CODES.includes(discountCode.trim().toUpperCase());

  const visiblePrice =
    discountCodeLooksValid ? Math.max(basePrice - 20, 0) : basePrice;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("product", product);

      if (isTextCorrection) {
        formData.set("amount", String(correctionPrice));
      }

      const response = await fetch("/api/checkout/webshop", {
        method: "POST",
        body: formData,
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        throw new Error("De server stuurde geen geldige JSON terug.");
      }

      if (!response.ok) {
        throw new Error(data.error || `Serverfout (${response.status}).`);
      }

      if (!data.url) {
        throw new Error("Geen Mollie-betaallink ontvangen.");
      }

      window.location.assign(data.url);
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Er ging iets mis bij het starten van de betaling."
      );

      setLoading(false);
    }
  }

  return (
    <form
      className="form-card booking-form-with-calendar"
      onSubmit={handleSubmit}
    >
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

        {isTenBeurtenkaart && (
          <label>
            Kortingscode
            <input
              name="discount_code"
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Bijvoorbeeld 1234-ABCD-5E6F-G7H8"
            />
          </label>
        )}

        {!isTextCorrection && (
          <>
            <label>
              Naam leerling
              <input name="student_name" required />
            </label>

            <label>
              Leeftijd leerling
              <input
                name="student_age"
                type="number"
                min="4"
                max="20"
                required
              />
            </label>

            <label>
              Studiejaar / leerjaar
              <select name="school_year" required>
                <option value="">Kies studiejaar</option>

                {product === "10-beurtenkaart-lager" && (
                  <>
                    <option>1e leerjaar</option>
                    <option>2e leerjaar</option>
                    <option>3e leerjaar</option>
                    <option>4e leerjaar</option>
                    <option>5e leerjaar</option>
                    <option>6e leerjaar</option>
                  </>
                )}

                {product === "10-beurtenkaart-secundair" && (
                  <>
                    <option>1e middelbaar</option>
                    <option>2e middelbaar</option>
                    <option>3e middelbaar</option>
                    <option>4e middelbaar</option>
                    <option>5e middelbaar</option>
                    <option>6e middelbaar</option>
                  </>
                )}

                {product === "klaar-voor-de-sprong-middelbaar" && (
                  <>
                    <option>6e leerjaar</option>
                    <option>1e middelbaar</option>
                  </>
                )}

                {product === "klaar-voor-de-sprong-eerste-leerjaar" && (
                  <>
                    <option>3e kleuterklas</option>
                    <option>1e leerjaar</option>
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
                required
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
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
              <input
                name="file"
                type="file"
                accept=".pdf,.doc,.docx"
                required
              />
            </label>
          </>
        )}
      </div>

      {discountCodeLooksValid && (
        <p
          className="form-message"
          style={{
            color: "#54955c",
            fontWeight: 800,
          }}
        >
          Kortingscode herkend. De korting wordt definitief gecontroleerd bij
          betaling.
        </p>
      )}

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
          €{visiblePrice.toFixed(0)}
          {discountCodeLooksValid && " i.p.v. €" + basePrice.toFixed(0)}
        </strong>
      </p>

      {error && (
        <p
          className="form-message"
          style={{
            color: "#fe2020",
            fontWeight: 700,
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 24,
        }}
      >
        <button className="primary-action" type="submit" disabled={loading}>
          {loading ? "Betaling starten..." : "Betaal nu"}
        </button>
      </div>
    </form>
  );
}