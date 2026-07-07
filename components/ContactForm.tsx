"use client";

import { useState } from "react";
import { User, Mail, Phone, MessageSquare, Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Er ging iets mis.");
      }

      event.currentTarget.reset();
      setPrivacyAccepted(false);
      setTermsAccepted(false);
      setStatus("success");
      setMessage("Je vraag werd succesvol verzonden. Ik neem zo snel mogelijk contact met je op.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Er ging iets mis bij het verzenden."
      );
    }
  }

  return (
    <section className="contact-wrapper">
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Naam</label>
          <div className="input-icon">
            <User size={20} />
            <input type="text" name="name" placeholder="Jouw naam" required />
          </div>
        </div>

        <div className="input-group">
          <label>E-mailadres</label>
          <div className="input-icon">
            <Mail size={20} />
            <input type="email" name="email" placeholder="naam@email.be" required />
          </div>
        </div>

        <div className="input-group">
          <label>Telefoonnummer</label>
          <div className="input-icon">
            <Phone size={20} />
            <input type="tel" name="phone" placeholder="+32..." required />
          </div>
        </div>

        <div className="input-group">
          <label>Vraag</label>
          <div className="input-icon textarea">
            <MessageSquare size={20} />
            <textarea
              name="question"
              rows={6}
              placeholder="Waarmee kan ik je helpen?"
              required
            />
          </div>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="privacyConsent"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
          />
          <span>
            Ik heb de{" "}
            <a href="/algemene-voorwaarden#privacy" target="_blank">
              Privacyverklaring
            </a>{" "}
            gelezen.
          </span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="termsConsent"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <span>
            Ik ga akkoord met de{" "}
            <a href="/algemene-voorwaarden" target="_blank">
              Algemene Voorwaarden
            </a>.
          </span>
        </label>

        {message && (
          <p className={`form-message ${status}`}>
            {status === "success" && <CheckCircle size={18} />}
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={!privacyAccepted || !termsAccepted || status === "loading"}
          className="submit-btn"
        >
          <Send size={18} />
          {status === "loading" ? "Verzenden..." : "Vraag verzenden"}
        </button>
      </form>
    </section>
  );
}