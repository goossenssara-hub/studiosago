"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
} from "lucide-react";

export default function ContactForm() {
  const [accepted, setAccepted] = useState(false);

  return (
    <section className="contact-wrapper">
      <form className="contact-form">

        <div className="input-group">
          <label>Naam</label>

          <div className="input-icon">
            <User size={20} />
            <input
              type="text"
              placeholder="Jouw naam"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>E-mailadres</label>

          <div className="input-icon">
            <Mail size={20} />
            <input
              type="email"
              placeholder="naam@email.be"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Telefoonnummer</label>

          <div className="input-icon">
            <Phone size={20} />
            <input
              type="tel"
              placeholder="+32..."
            />
          </div>
        </div>

        <div className="input-group">
          <label>Vraag</label>

          <div className="input-icon textarea">
            <MessageSquare size={20} />
            <textarea
              rows={6}
              placeholder="Waarmee kan ik je helpen?"
              required
            />
          </div>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />

          <span>
            Ik ga akkoord dat Studio SaGo mijn gegevens bewaart om mijn
            vraag te beantwoorden.
          </span>
        </label>

        <button
          type="submit"
          disabled={!accepted}
          className="submit-btn"
        >
          <Send size={18} />
          Vraag verzenden
        </button>

      </form>
    </section>
  );
}