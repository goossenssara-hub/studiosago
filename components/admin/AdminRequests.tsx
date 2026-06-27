"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Contact = {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export default function AdminRequests() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState("Laden...");

  async function loadContacts() {
    const { data, error } = await supabase
      .from("contacts")
      .select("id,created_at,first_name,last_name,email,phone,notes")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Kon aanvragen niet laden.");
      return;
    }

    setContacts(data ?? []);
    setMessage(data?.length ? "" : "Nog geen aanvragen.");
  }

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <section className="table-card">
      <div className="admin-section-header">
        <div>
          <p className="eyebrow">Inbox</p>
          <h2>Nieuwe aanvragen</h2>
        </div>
      </div>

      {message && <p>{message}</p>}

      <div className="admin-request-list">
        {contacts.map((contact) => (
          <article className="admin-request-card" key={contact.id}>
            <div>
              <h3>
                {contact.first_name} {contact.last_name}
              </h3>
              <p>{contact.email}</p>
              <p>{contact.phone}</p>
            </div>

            <div className="admin-request-notes">
              <pre>{contact.notes}</pre>
            </div>

            <div className="admin-request-actions">
              <button type="button">✅ Goedkeuren</button>
              <button type="button">📅 Les inplannen</button>
              <button type="button">📄 Factuur</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}