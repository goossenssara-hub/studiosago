"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mailbox = {
  id: string;
  internal_email: string;
  display_name: string;
  role: "student" | "admin";
};

type Message = {
  id: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
  sender_id: string;
  receiver_id: string;
};

export default function LeerlingMailboxClient() {
  const supabase = createClient();

  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [admins, setAdmins] = useState<Mailbox[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiverId, setReceiverId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMailbox();
  }, []);

  async function loadMailbox() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: ownMailbox } = await supabase
      .from("internal_mailboxes")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!ownMailbox) {
      setLoading(false);
      return;
    }

    setMailbox(ownMailbox);

    const { data: adminMailboxes } = await supabase
      .from("internal_mailboxes")
      .select("*")
      .eq("role", "admin");

    setAdmins(adminMailboxes || []);

    const { data: inboxMessages } = await supabase
      .from("internal_messages")
      .select("*")
      .or(`receiver_id.eq.${ownMailbox.id},sender_id.eq.${ownMailbox.id}`)
      .order("created_at", { ascending: false });

    setMessages(inboxMessages || []);
    setLoading(false);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!mailbox || !receiverId || !subject || !body) return;

    setSending(true);

    const { error } = await supabase.from("internal_messages").insert({
      sender_id: mailbox.id,
      receiver_id: receiverId,
      subject,
      body,
    });

    if (!error) {
      setSubject("");
      setBody("");
      setReceiverId("");
      await loadMailbox();
    }

    setSending(false);
  }

  if (loading) {
    return <main className="mailbox-page">Mailbox wordt geladen...</main>;
  }

  if (!mailbox) {
    return (
      <main className="mailbox-page">
        <h1>Mailbox niet gevonden</h1>
        <p>Er is nog geen interne Studio SaGo-mailbox gekoppeld aan dit account.</p>
      </main>
    );
  }

  return (
    <main className="mailbox-page">
      <section className="mailbox-hero">
        <p className="eyebrow">Studio SaGo Mail</p>
        <h1>Mijn mailbox</h1>
        <p>
          Je interne mailadres is <strong>{mailbox.internal_email}</strong>.
          Berichten blijven veilig binnen Studio SaGo.
        </p>
      </section>

      <section className="mailbox-grid">
        <form className="mailbox-compose" onSubmit={sendMessage}>
          <h2>Nieuw bericht</h2>

          <label>
            Naar
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              required
            >
              <option value="">Kies ontvanger</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.display_name} — {admin.internal_email}
                </option>
              ))}
            </select>
          </label>

          <label>
            Onderwerp
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Waarover gaat je bericht?"
              required
            />
          </label>

          <label>
            Bericht
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Typ hier je bericht..."
              rows={8}
              required
            />
          </label>

          <button type="submit" disabled={sending}>
            {sending ? "Verzenden..." : "Verstuur intern bericht"}
          </button>
        </form>

        <section className="mailbox-inbox">
          <h2>Berichten</h2>

          {messages.length === 0 ? (
            <p className="empty-mailbox">Nog geen berichten.</p>
          ) : (
            <div className="mail-list">
              {messages.map((message) => (
                <article key={message.id} className="mail-card">
                  <div>
                    <h3>{message.subject}</h3>
                    <span>
                      {new Date(message.created_at).toLocaleString("nl-BE")}
                    </span>
                  </div>

                  <p>{message.body}</p>

                  <small>
                    {message.sender_id === mailbox.id
                      ? "Verzonden door jou"
                      : "Ontvangen bericht"}
                  </small>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}