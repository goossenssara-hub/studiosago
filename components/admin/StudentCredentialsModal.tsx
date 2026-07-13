"use client";

type Credentials = {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
};

type StudentCredentialsModalProps = {
  credentials: Credentials | null;
  onClose: () => void;
};

export default function StudentCredentialsModal({
  credentials,
  onClose,
}: StudentCredentialsModalProps) {
  if (!credentials) return null;

  const copyAll = async () => {
    const text = [
      "Studio SaGo – Leerlingportaal",
      "",
      `Leerling: ${credentials.name}`,
      `Website: ${credentials.loginUrl}`,
      `E-mail: ${credentials.email}`,
      `Wachtwoord: ${credentials.password}`,
    ].join("\n");

    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="student-credentials-backdrop" role="presentation">
      <section
        className="student-credentials-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-credentials-title"
      >
        <button
          type="button"
          className="student-credentials-close"
          onClick={onClose}
          aria-label="Sluiten"
        >
          ×
        </button>

        <div className="student-credentials-icon">✓</div>

        <h2 id="student-credentials-title">
          Leerling succesvol aangemaakt
        </h2>

        <p className="student-credentials-intro">
          Bewaar of kopieer deze inloggegevens. Het tijdelijke wachtwoord
          wordt om veiligheidsredenen alleen nu getoond.
        </p>

        <dl className="student-credentials-list">
          <div>
            <dt>Leerling</dt>
            <dd>{credentials.name}</dd>
          </div>

          <div>
            <dt>Loginpagina</dt>
            <dd>
              <a href={credentials.loginUrl} target="_blank" rel="noreferrer">
                {credentials.loginUrl}
              </a>
            </dd>
          </div>

          <div>
            <dt>E-mailadres</dt>
            <dd>{credentials.email}</dd>
          </div>

          <div>
            <dt>Tijdelijk wachtwoord</dt>
            <dd className="student-credentials-password">
              {credentials.password}
            </dd>
          </div>
        </dl>

        <div className="student-credentials-actions">
          <button type="button" onClick={copyAll}>
            Kopieer inloggegevens
          </button>

          <button type="button" className="secondary" onClick={onClose}>
            Sluiten
          </button>
        </div>
      </section>
    </div>
  );
}
