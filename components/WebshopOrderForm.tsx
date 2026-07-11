"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import type {
  WebshopOrderMetadata,
  WebshopPaymentMethod,
} from "@/lib/fulfillWebshopOrder";

type WebshopOrderFormProps = {
  product: string;
};

type DiscountResult = {
  valid: boolean;
  discountId: string | null;
  discountCode: string;
  discountAmount: number;
  finalAmount: number;
  paymentMethod?: WebshopPaymentMethod;
  message?: string;
};

type CheckoutResponse = {
  success?: boolean;
  checkoutUrl?: string;
  redirectUrl?: string;
  url?: string;
  isFreeOrder?: boolean;
  message?: string;
  error?: string;
};

type ProductConfiguration = {
  name: string;
  amount: number;
  category:
    | "pass"
    | "workshop"
    | "text"
    | "general";
  requiresStudentData: boolean;
};

const PRODUCT_CONFIG: Record<
  string,
  ProductConfiguration
> = {
  "10-beurtenkaart-lager": {
    name: "10-beurtenkaart Lager onderwijs",
    amount: 320,
    category: "pass",
    requiresStudentData: true,
  },

  "10-beurtenkaart-secundair": {
    name: "10-beurtenkaart Secundair onderwijs",
    amount: 380,
    category: "pass",
    requiresStudentData: true,
  },

  "klaar-voor-de-sprong-middelbaar": {
    name: "Klaar voor de Sprong – Naar het middelbaar",
    amount: 250,
    category: "workshop",
    requiresStudentData: true,
  },

  "klaar-voor-de-sprong-eerste-leerjaar": {
    name: "Klaar voor de Sprong – Naar het eerste leerjaar",
    amount: 180,
    category: "workshop",
    requiresStudentData: true,
  },

  tekstcorrectie: {
    name: "Tekstcorrectie",
    amount: 20,
    category: "text",
    requiresStudentData: false,
  },
};

function roundCurrency(value: number): number {
  return (
    Math.round(
      (value + Number.EPSILON) * 100
    ) / 100
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(roundCurrency(value));
}

function calculateTextCorrectionPrice(
  wordCount: number
): number {
  if (
    !Number.isFinite(wordCount) ||
    wordCount <= 0
  ) {
    return 20;
  }

  if (wordCount <= 2000) {
    return 20;
  }

  const extraWords = wordCount - 2000;
  const extraBlocks = Math.ceil(
    extraWords / 1000
  );

  return 20 + extraBlocks * 8;
}

export default function WebshopOrderForm({
  product,
}: WebshopOrderFormProps) {
  const productConfig =
    PRODUCT_CONFIG[product] ?? {
      name: product,
      amount: 0,
      category: "general" as const,
      requiresStudentData: true,
    };

  const [parentName, setParentName] =
    useState("");

  const [studentName, setStudentName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [studentAge, setStudentAge] =
    useState("");

  const [schoolYear, setSchoolYear] =
    useState("");

  const [school, setSchool] =
    useState("");

  const [wordCount, setWordCount] =
    useState("");

  const [textType, setTextType] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [discountCode, setDiscountCode] =
    useState("");

  const [discount, setDiscount] =
    useState<DiscountResult | null>(null);

  const [
    discountMessage,
    setDiscountMessage,
  ] = useState("");

  const [isCheckingDiscount, setIsCheckingDiscount] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const originalAmount = useMemo(() => {
    if (product === "tekstcorrectie") {
      return calculateTextCorrectionPrice(
        Number(wordCount)
      );
    }

    return productConfig.amount;
  }, [
    product,
    productConfig.amount,
    wordCount,
  ]);

  const finalAmount = useMemo(() => {
    if (!discount?.valid) {
      return originalAmount;
    }

    return Math.max(
      roundCurrency(
        originalAmount -
          discount.discountAmount
      ),
      0
    );
  }, [
    discount,
    originalAmount,
  ]);

  const isFreeOrder =
    finalAmount === 0;

  function clearDiscount(): void {
    setDiscount(null);
    setDiscountMessage("");
  }

  async function handleCheckDiscount(): Promise<void> {
    const code = discountCode
      .trim()
      .toUpperCase();

    setErrorMessage("");
    setSuccessMessage("");
    setDiscountMessage("");

    if (!code) {
      clearDiscount();
      setDiscountMessage(
        "Vul eerst een kortingscode in."
      );
      return;
    }

    setIsCheckingDiscount(true);

    try {
      const response = await fetch(
        "/api/discount-codes/validate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            code,
            product,
            email:
              email.trim().toLowerCase(),
            amount: originalAmount,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();

        console.error(
          "DISCOUNT API GAF GEEN JSON TERUG:",
          response.status,
          responseText.slice(0, 300)
        );

        throw new Error(
          response.status === 404
            ? "De kortingscode-route werd niet gevonden."
            : "De server gaf een ongeldig antwoord terug."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "De kortingscode kon niet gecontroleerd worden."
        );
      }

      const discountAmount = Math.max(
        Number(data.discountAmount || 0),
        0
      );

      const calculatedFinalAmount =
        Math.max(
          roundCurrency(
            originalAmount -
              discountAmount
          ),
          0
        );

      setDiscount({
        valid: true,
        discountId:
          data.discountId ?? null,
        discountCode:
          data.discountCode ?? code,
        discountAmount,
        finalAmount:
          Number.isFinite(
            Number(data.finalAmount)
          )
            ? Math.max(
                Number(data.finalAmount),
                0
              )
            : calculatedFinalAmount,
        paymentMethod:
          calculatedFinalAmount === 0
            ? "waardebon"
            : "mollie",
        message:
          data.message ||
          "Kortingscode toegepast.",
      });

      setDiscountMessage(
        data.message ||
          `Kortingscode toegepast: ${formatCurrency(
            discountAmount
          )} korting.`
      );
    } catch (error) {
      clearDiscount();

      setDiscountMessage(
        error instanceof Error
          ? error.message
          : "De kortingscode is niet geldig."
      );
    } finally {
      setIsCheckingDiscount(false);
    }
  }

  function validateForm(): string | null {
    if (!parentName.trim()) {
      return "Vul de naam van de ouder of klant in.";
    }

    if (!email.trim()) {
      return "Vul je e-mailadres in.";
    }

    if (
      !email.includes("@") ||
      !email.includes(".")
    ) {
      return "Vul een geldig e-mailadres in.";
    }

    if (
      productConfig.requiresStudentData &&
      !studentName.trim()
    ) {
      return "Vul de naam van de leerling in.";
    }

    if (
      product === "tekstcorrectie" &&
      Number(wordCount) <= 0
    ) {
      return "Vul het aantal woorden in.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentMethod: WebshopPaymentMethod =
        isFreeOrder
          ? discount?.paymentMethod ??
            "gratis"
          : "mollie";

      const metadata: WebshopOrderMetadata =
        {
          product,
          productName:
            productConfig.name,

          amount:
            finalAmount.toFixed(2),

          originalAmount:
            originalAmount.toFixed(2),

          discountId:
            discount?.discountId ??
            null,

          discountCode:
            discount?.discountCode ??
            "",

          discountAmount:
            (
              discount?.discountAmount ??
              0
            ).toFixed(2),

          parentName:
            parentName.trim(),

          studentName:
            studentName.trim(),

          email:
            email
              .trim()
              .toLowerCase(),

          phone: phone.trim(),

          studentAge:
            studentAge.trim(),

          schoolYear:
            schoolYear.trim(),

          school: school.trim(),

          wordCount:
            wordCount.trim(),

          textType:
            textType.trim(),

          notes: notes.trim(),

          paymentMethod,
          isFreeOrder,
        };

      const checkoutEndpoint =
        product === "10-beurtenkaart-lager" ||
        product === "10-beurtenkaart-secundair"
          ? "/api/checkout/ten-beurtenkaart"
          : "/api/mollie/create-payment";

      const response = await fetch(
        checkoutEndpoint,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            product,
            productName:
              productConfig.name,

            parentName:
              parentName.trim(),

            studentName:
              studentName.trim(),

            email:
              email
                .trim()
                .toLowerCase(),

            phone: phone.trim(),

            studentAge:
              studentAge.trim(),

            schoolYear:
              schoolYear.trim(),

            school: school.trim(),

            notes: notes.trim(),

            discountCode:
              discount?.discountCode ||
              discountCode
                .trim()
                .toUpperCase(),

            amount:
              finalAmount.toFixed(2),

            originalAmount:
              originalAmount.toFixed(2),

            metadata,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();

        console.error(
          "CHECKOUT API GAF GEEN JSON TERUG:",
          response.status,
          responseText.slice(0, 300)
        );

        throw new Error(
          response.status === 404
            ? "De betaalroute werd niet gevonden."
            : "De server gaf een ongeldig antwoord terug."
        );
      }

      const data =
        (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "De bestelling kon niet verwerkt worden."
        );
      }

      const checkoutUrl =
        data.checkoutUrl ||
        data.redirectUrl ||
        data.url;

      if (
        checkoutUrl &&
        !isFreeOrder
      ) {
        window.location.href =
          checkoutUrl;

        return;
      }

      if (
        data.success ||
        data.isFreeOrder ||
        isFreeOrder
      ) {
        setSuccessMessage(
          data.message ||
            "Je bestelling werd correct geregistreerd."
        );

        return;
      }

      throw new Error(
        "Er werd geen betaalpagina ontvangen."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Er ging iets mis bij het verwerken van je bestelling."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="webshop-order-section">
      <div className="webshop-order-card">
        <div className="webshop-order-summary">
          <p className="eyebrow">
            Jouw bestelling
          </p>

          <h2>{productConfig.name}</h2>

          <div className="webshop-price-overview">
            {discount?.valid && (
              <>
                <div className="webshop-price-row">
                  <span>
                    Oorspronkelijke prijs
                  </span>

                  <span>
                    {formatCurrency(
                      originalAmount
                    )}
                  </span>
                </div>

                <div className="webshop-price-row webshop-discount-row">
                  <span>Korting</span>

                  <span>
                    −{" "}
                    {formatCurrency(
                      discount.discountAmount
                    )}
                  </span>
                </div>
              </>
            )}

            <div className="webshop-price-row webshop-total-row">
              <strong>
                {isFreeOrder
                  ? "Te betalen"
                  : "Totaal"}
              </strong>

              <strong>
                {formatCurrency(
                  finalAmount
                )}
              </strong>
            </div>

            {isFreeOrder && (
              <p className="webshop-free-notice">
                Deze bestelling is volledig
                voldaan. Je wordt niet naar
                Mollie doorgestuurd.
              </p>
            )}
          </div>
        </div>

        <form
          className="webshop-order-form"
          onSubmit={handleSubmit}
        >
          <div className="webshop-form-grid">
            <label className="webshop-field">
              <span>
                Naam ouder of klant *
              </span>

              <input
                type="text"
                value={parentName}
                onChange={(event) =>
                  setParentName(
                    event.target.value
                  )
                }
                autoComplete="name"
                required
              />
            </label>

            {productConfig.requiresStudentData && (
              <label className="webshop-field">
                <span>
                  Naam leerling *
                </span>

                <input
                  type="text"
                  value={studentName}
                  onChange={(event) =>
                    setStudentName(
                      event.target.value
                    )
                  }
                  required
                />
              </label>
            )}

            <label className="webshop-field">
              <span>E-mailadres *</span>

              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );

                  if (discount) {
                    clearDiscount();
                  }
                }}
                autoComplete="email"
                required
              />
            </label>

            <label className="webshop-field">
              <span>Telefoonnummer</span>

              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                autoComplete="tel"
              />
            </label>

            {productConfig.requiresStudentData && (
              <>
                <label className="webshop-field">
                  <span>
                    Leeftijd leerling
                  </span>

                  <input
                    type="text"
                    value={studentAge}
                    onChange={(event) =>
                      setStudentAge(
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="webshop-field">
                  <span>
                    Leerjaar of studiejaar
                  </span>

                  <input
                    type="text"
                    value={schoolYear}
                    onChange={(event) =>
                      setSchoolYear(
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="webshop-field webshop-field-full">
                  <span>School</span>

                  <input
                    type="text"
                    value={school}
                    onChange={(event) =>
                      setSchool(
                        event.target.value
                      )
                    }
                  />
                </label>
              </>
            )}

            {product === "tekstcorrectie" && (
              <>
                <label className="webshop-field">
                  <span>
                    Aantal woorden *
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={wordCount}
                    onChange={(event) => {
                      setWordCount(
                        event.target.value
                      );

                      if (discount) {
                        clearDiscount();
                      }
                    }}
                    required
                  />
                </label>

                <label className="webshop-field">
                  <span>Soort tekst</span>

                  <input
                    type="text"
                    value={textType}
                    onChange={(event) =>
                      setTextType(
                        event.target.value
                      )
                    }
                    placeholder="Bijvoorbeeld eindwerk of cursus"
                  />
                </label>
              </>
            )}

            <label className="webshop-field webshop-field-full">
              <span>
                Extra opmerkingen
              </span>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                rows={4}
              />
            </label>
          </div>

          <div className="webshop-discount-box">
            <label className="webshop-field">
              <span>
                Kortingscode of waardebon
              </span>

              <div className="webshop-discount-controls">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(event) => {
                    setDiscountCode(
                      event.target.value
                        .toUpperCase()
                    );

                    if (discount) {
                      clearDiscount();
                    }
                  }}
                  placeholder="Vul je code in"
                />

                <button
                  type="button"
                  onClick={
                    handleCheckDiscount
                  }
                  disabled={
                    isCheckingDiscount ||
                    !discountCode.trim()
                  }
                >
                  {isCheckingDiscount
                    ? "Controleren..."
                    : "Toepassen"}
                </button>
              </div>
            </label>

            {discountMessage && (
              <p
                className={
                  discount?.valid
                    ? "webshop-message webshop-message-success"
                    : "webshop-message webshop-message-error"
                }
              >
                {discountMessage}
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="webshop-message webshop-message-error">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="webshop-message webshop-message-success">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className="webshop-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Even geduld..."
              : isFreeOrder
                ? "Bestelling bevestigen"
                : `Veilig betalen – ${formatCurrency(
                    finalAmount
                  )}`}
          </button>

          <p className="webshop-payment-note">
            {isFreeOrder
              ? "Voor deze bestelling is geen online betaling nodig."
              : "Je wordt veilig doorgestuurd naar Mollie om met Bancontact te betalen."}
          </p>
        </form>
      </div>
    </section>
  );
}