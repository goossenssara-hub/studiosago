"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Contact = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

type LessonCard = {
  id: string;
  title: string;
  total_sessions: number;
  used_sessions: number;
  price: number | null;
  active: boolean;
  contacts?: Contact[] | null;
};

export default function AdminLessonCards() {
  const [cards, setCards] = useState<LessonCard[]>([]);
  const [message, setMessage] = useState("Laden...");

  async function loadCards() {
    const { data, error } = await supabase
      .from("lesson_cards")
      .select(`
        id,
        title,
        total_sessions,
        used_sessions,
        price,
        active,
        contacts(first_name,last_name,email)
      `)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Kon beurtenkaarten niet laden.");
      return;
    }

    setCards(((data ?? []) as unknown) as LessonCard[]);
    setMessage(data?.length ? "" : "Nog geen beurtenkaarten.");
  }

  useEffect(() => {
    loadCards();
  }, []);

  async function useSession(card: LessonCard) {
    const remaining = card.total_sessions - card.used_sessions;

    if (remaining <= 0) {
      setMessage("Deze beurtenkaart is volledig opgebruikt.");
      return;
    }

    const { error: sessionError } = await supabase
      .from("lesson_card_sessions")
      .insert({
        lesson_card_id: card.id,
        note: "Beurt afgetekend via admin",
      });

    if (sessionError) {
      setMessage("Beurt kon niet worden afgetekend.");
      return;
    }

    const { error: updateError } = await supabase
      .from("lesson_cards")
      .update({
        used_sessions: card.used_sessions + 1,
      })
      .eq("id", card.id);

    if (updateError) {
      setMessage("Beurtenkaart kon niet worden bijgewerkt.");
      return;
    }

    setMessage("Beurt afgetekend.");
    loadCards();
  }

  return (
    <section className="table-card">
      <h2>Beurtenkaarten</h2>

      {message && <p>{message}</p>}

      <div className="lesson-card-list">
        {cards.map((card) => {
          const contact = card.contacts?.[0];
          const remaining = card.total_sessions - card.used_sessions;

          return (
            <article className="lesson-card-admin" key={card.id}>
              <div>
                <h3>{card.title}</h3>

                <p>
                  {contact?.first_name} {contact?.last_name}
                  <br />
                  <small>{contact?.email}</small>
                </p>

                <p>
                  <strong>{remaining}</strong> van {card.total_sessions} beurten over
                </p>
              </div>

              <button
                type="button"
                onClick={() => useSession(card)}
                disabled={remaining <= 0}
              >
                {remaining <= 0 ? "Opgebruikt" : "Beurt aftekenen"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}