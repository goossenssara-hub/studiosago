"use client";

import { FormEvent, useEffect, useState } from "react";

type DiscountCode = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  product: string;
  email: string | null;
  customer_name: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
};

export default function DiscountCodesAdmin() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [message, setMessage] = useState("");

  async function loadCodes() {
    setLoadingCodes(true);

    const response = await fetch("/api/admin/discount-codes", {
      cache: "no-store",
    });

    const data = await response.json();

    if (response.ok) {
      setCodes(data.codes || []);
    } else {
      setMessage(data.error || "Kortingscodes konden niet geladen worden.");
    }

    setLoadingCodes(false);
  }

  useEffect(() => {
    loadCodes();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const body = {
      description: String(formData.get("description") || "").trim(),
      discount_type: String(formData.get("discount_type") || "fixed"),
      discount_value: Number(formData.get("discount_value") || 20),
      product: String(formData.get("product") || "all"),
      email: String(formData.get("email") || "").trim() || null,
      customer_name: String(formData.get("customer_name") || "").trim() || null,
      valid_until: String(formData.get("valid_until") || "").trim() || null,
      max_uses: formData.get("max_uses")
        ? Number(formData.get("max_uses"))
        : null,
    };

    const response = await fetch("/api/admin/discount-codes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Kortingscode kon niet aangemaakt worden.");
    } else {
      setMessage(`Kortingscode aangemaakt: ${data.code.code}`);
      form.reset();
      await loadCodes();
    }

    setLoading(false);
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <p className="eyebrow">Studio SaGo</p>
        <h1>Kortingscodes</h1>
        <p>Maak en beheer kortingscodes zonder code aan te passen.</p>
      </section>

      <section className="form-card">
        <h2>Nieuwe kortingscode maken</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Omschrijving
            <input
              name="description"
              placeholder="Bijv. Vicky Marken - €20 korting"
            />
          </label>

          <label>
            Type korting
            <select name="discount_type" defaultValue="fixed">
              <option value="fixed">Vast bedrag</option>
              <option value="percentage">Percentage</option>
            </select>
          </label>

          <label>
            Waarde
            <input
              name="discount_value"
              type="number"
              defaultValue="20"
              min="1"
              step="0.01"
            />
          </label>

          <label>
            Product
            <select name="product" defaultValue="10-beurtenkaart-lager">
              <option value="all">Alle producten</option>
              <option value="10-beurtenkaart-lager">
                10-beurtenkaart lager
              </option>
              <option value="10-beurtenkaart-secundair">
                10-beurtenkaart secundair
              </option>
              <option value="klaar-voor-de-sprong-middelbaar">
                Klaar voor de Sprong middelbaar
              </option>
              <option value="klaar-voor-de-sprong-eerste-leerjaar">
                Klaar voor de Sprong eerste leerjaar
              </option>
              <option value="tekstcorrectie">Tekstcorrectie</option>
            </select>
          </label>

          <label>
            Alleen voor e-mail
            <input
              name="email"
              type="email"
              placeholder="Leeg laten = iedereen"
            />
          </label>

          <label>
            Alleen voor naam
            <input
              name="customer_name"
              placeholder="Leeg laten = iedereen"
            />
          </label>

          <label>
            Geldig tot
            <input name="valid_until" type="date" />
          </label>

          <label>
            Max. aantal gebruiken
            <input
              name="max_uses"
              type="number"
              min="1"
              placeholder="Leeg laten = onbeperkt"
            />
          </label>

          <button className="primary-action" type="submit" disabled={loading}>
            {loading ? "Aanmaken..." : "Genereer kortingscode"}
          </button>
        </form>

        {message && <p className="form-message">{message}</p>}
      </section>

      <section className="form-card" style={{ marginTop: 24 }}>
        <h2>Bestaande kortingscodes</h2>

        {loadingCodes ? (
          <p>Kortingscodes laden...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Korting</th>
                  <th>Product</th>
                  <th>E-mail</th>
                  <th>Naam</th>
                  <th>Gebruik</th>
                  <th>Actief</th>
                </tr>
              </thead>

              <tbody>
                {codes.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.code}</strong>
                    </td>
                    <td>
                      {item.discount_type === "percentage"
                        ? `${item.discount_value}%`
                        : `€${Number(item.discount_value).toFixed(2)}`}
                    </td>
                    <td>{item.product}</td>
                    <td>{item.email || "Iedereen"}</td>
                    <td>{item.customer_name || "Iedereen"}</td>
                    <td>
                      {item.used_count}
                      {item.max_uses
                        ? ` / ${item.max_uses}`
                        : " / onbeperkt"}
                    </td>
                    <td>{item.active ? "Ja" : "Nee"}</td>
                  </tr>
                ))}

                {codes.length === 0 && (
                  <tr>
                    <td colSpan={7}>Nog geen kortingscodes gevonden.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}