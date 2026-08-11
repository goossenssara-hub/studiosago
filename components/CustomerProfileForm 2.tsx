"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type StudentForm = {
  name: string;
  birthDate: string;
  school: string;
  grade: string;
  educationLevel: string;
  secondaryTrack: string;
  finality: string;
  supportNeeds: string;
  diagnosis: string;
  goals: string;
  preferredSubjects: string;
  medicalInfo: string;
  doctorName: string;
  doctorPhone: string;
  photoConsent: boolean;
  notes: string;
};

const emptyStudent: StudentForm = {
  name: "",
  birthDate: "",
  school: "",
  grade: "",
  educationLevel: "",
  secondaryTrack: "",
  finality: "",
  supportNeeds: "",
  diagnosis: "",
  goals: "",
  preferredSubjects: "",
  medicalInfo: "",
  doctorName: "",
  doctorPhone: "",
  photoConsent: false,
  notes: "",
};

const primaryGrades = [
  "1ste kleuterklas",
  "2de kleuterklas",
  "3de kleuterklas",
  "1ste leerjaar",
  "2de leerjaar",
  "3de leerjaar",
  "4de leerjaar",
  "5de leerjaar",
  "6de leerjaar",
];

const secondaryGrades = [
  "1ste middelbaar",
  "2de middelbaar",
  "3de middelbaar",
  "4de middelbaar",
  "5de middelbaar",
  "6de middelbaar",
];

type Props = {
  onSaved?: () => void;
  redirectAfterSave?: string;
  initialEmail?: string;
};
function RequiredStar() {
  return <span className="required">*</span>;
}

export default function CustomerProfileForm({
  onSaved,
  redirectAfterSave,
  initialEmail,
}: Props) {  const router = useRouter();

  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  const [parent1FirstName, setParent1FirstName] = useState("");
  const [parent1LastName, setParent1LastName] = useState("");
  const [parent1Phone, setParent1Phone] = useState("");

  const [parent2FirstName, setParent2FirstName] = useState("");
  const [parent2LastName, setParent2LastName] = useState("");
  const [parent2Phone, setParent2Phone] = useState("");
  const [parent2Email, setParent2Email] = useState("");

  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");

  const [emergencyContact, setEmergencyContact] = useState("");
  const [preferredFormat, setPreferredFormat] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [notes, setNotes] = useState("");

  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);

  const [students, setStudents] = useState<StudentForm[]>([{ ...emptyStudent }]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProfile() {
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

const accountEmail = user?.email || initialEmail || "";

if (!accountEmail) {
  setMessage("Geen account gevonden. Log opnieuw in.");
  return;
}

setEmail(accountEmail);
setNewEmail(accountEmail);

const response = await fetch(
  `/api/customer/profile?email=${encodeURIComponent(accountEmail)}`,
  { cache: "no-store" }
);
    const data = await response.json();

    if (data.profile) {
      setProfilePhotoUrl(data.profile.profile_photo_url ?? "");

      setParent1FirstName(
        data.profile.parent1_first_name ?? data.profile.first_name ?? ""
      );
      setParent1LastName(
        data.profile.parent1_last_name ?? data.profile.last_name ?? ""
      );
      setParent1Phone(data.profile.parent1_phone ?? data.profile.phone ?? "");

      setParent2FirstName(data.profile.parent2_first_name ?? "");
      setParent2LastName(data.profile.parent2_last_name ?? "");
      setParent2Phone(data.profile.parent2_phone ?? "");
      setParent2Email(data.profile.parent2_email ?? "");

      setAddress(data.profile.address ?? "");
      setPostcode(data.profile.postcode ?? "");
      setCity(data.profile.city ?? "");

      setEmergencyContact(data.profile.emergency_contact ?? "");
      setPreferredFormat(data.profile.preferred_format ?? "");
      setAvailabilityNotes(data.profile.availability_notes ?? "");
      setNotes(data.profile.notes ?? "");

      setPrivacyConsent(!!data.profile.privacy_consent);
      setPhotoConsent(!!data.profile.photo_consent);
    }

    if (data.students?.length > 0) {
      setStudents(
        data.students.map((student: any) => ({
          name: student.name ?? "",
          birthDate: student.birth_date ?? "",
          school: student.school ?? "",
          grade: student.grade ?? "",
          educationLevel: student.education_level ?? "",
          secondaryTrack: student.secondary_track ?? "",
          finality: student.finality ?? "",
          supportNeeds: student.support_needs ?? "",
          diagnosis: student.diagnosis ?? "",
          goals: student.goals ?? "",
          preferredSubjects: student.preferred_subjects ?? "",
          medicalInfo: student.medical_info ?? "",
          doctorName: student.doctor_name ?? "",
          doctorPhone: student.doctor_phone ?? "",
          photoConsent: !!student.photo_consent,
          notes: student.notes ?? "",
        }))
      );
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function updateStudent(
    index: number,
    field: keyof StudentForm,
    value: string | boolean
  ) {
    setStudents((current) =>
      current.map((student, studentIndex) =>
        studentIndex === index ? { ...student, [field]: value } : student
      )
    );
  }

  function addStudent() {
    setStudents((current) => [...current, { ...emptyStudent }]);
  }

  function removeStudent(index: number) {
    setStudents((current) => current.filter((_, i) => i !== index));
  }

  async function uploadProfilePhoto() {
    if (!profilePhotoFile || !email || !supabase) return profilePhotoUrl;

    const extension = profilePhotoFile.name.split(".").pop();
    const filePath = `${email}/profile-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, profilePhotoFile, { upsert: true });

    if (error) {
      console.error("PROFILE PHOTO UPLOAD ERROR:", error);
      setMessage("Profielfoto kon niet opgeladen worden.");
      return profilePhotoUrl;
    }

    const { data } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function resetPassword() {
    if (!email || !supabase) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setMessage(
      error
        ? "Wachtwoordreset kon niet verzonden worden."
        : "Er werd een e-mail verzonden om je wachtwoord te wijzigen."
    );
  }

  async function changeEmail() {
    if (!newEmail || newEmail === email || !supabase) {
      setMessage("Vul een nieuw e-mailadres in.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    setMessage(
      error
        ? "E-mailadres kon niet aangepast worden."
        : "Bevestig je nieuwe e-mailadres via de e-mail die je ontvangt."
    );
  }

  function validateStudents() {
    return students.every((student) => {
      if (
        !student.name ||
        !student.birthDate ||
        !student.school ||
        !student.educationLevel ||
        !student.grade
      ) {
        return false;
      }

      if (
        student.educationLevel === "middelbaar" &&
        (!student.secondaryTrack || !student.finality)
      ) {
        return false;
      }

      return true;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      if (!email) {
        setMessage("Geen account gevonden. Log opnieuw in.");
        return;
      }

      if (!validateStudents()) {
        setMessage("Vul alle verplichte leerlinggegevens in.");
        return;
      }

      if (!privacyConsent) {
        setMessage("Je moet akkoord gaan met de GDPR-toestemming.");
        return;
      }

      const uploadedPhotoUrl = await uploadProfilePhoto();

      const response = await fetch("/api/customer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          profilePhotoUrl: uploadedPhotoUrl,

          parent1FirstName,
          parent1LastName,
          parent1Phone,

          parent2FirstName,
          parent2LastName,
          parent2Phone,
          parent2Email,

          address,
          postcode,
          city,

          emergencyContact,
          preferredFormat,
          availabilityNotes,
          notes,

          privacyConsent,
          photoConsent,

          students,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Gegevens konden niet opgeslagen worden.");
        return;
      }

      setProfilePhotoUrl(uploadedPhotoUrl);
      setMessage("Gegevens opgeslagen.");

      await loadProfile();
      onSaved?.();

if (redirectAfterSave) {
  window.location.href = redirectAfterSave;
}    } catch (error) {
      console.error("PROFILE SAVE ERROR:", error);
      setMessage("Er ging iets mis bij het opslaan van je gegevens.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2>👤 Mijn gegevens</h2>
      <p>
        Velden met <RequiredStar /> zijn verplicht. Je kunt je gegevens later
        altijd aanpassen via je dashboard.
      </p>

      <form onSubmit={handleSubmit} className="booking-form-with-calendar">
        <h3>Profielfoto</h3>
        <p className="small-note">
          Optioneel. Deze foto wordt enkel gebruikt om je sneller te herkennen in
          het dashboard en de administratie.
        </p>

        {profilePhotoUrl && (
          <img
            src={profilePhotoUrl}
            alt="Profielfoto"
            style={{
              width: 120,
              height: 120,
              objectFit: "cover",
              borderRadius: "999px",
              marginBottom: 20,
            }}
          />
        )}

        <label>
          Profielfoto uploaden
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              setProfilePhotoFile(event.target.files?.[0] ?? null)
            }
          />
        </label>

        <h3 style={{ marginTop: 32 }}>Ouder 1</h3>

        <div className="form-grid">
          <label>
            Voornaam <RequiredStar />
            <input
              value={parent1FirstName}
              onChange={(e) => setParent1FirstName(e.target.value)}
              required
            />
          </label>

          <label>
            Naam <RequiredStar />
            <input
              value={parent1LastName}
              onChange={(e) => setParent1LastName(e.target.value)}
              required
            />
          </label>

          <label>
            E-mailadres account <RequiredStar />
            <input value={email} disabled />
          </label>

          <label>
            Telefoonnummer <RequiredStar />
            <input
              value={parent1Phone}
              onChange={(e) => setParent1Phone(e.target.value)}
              required
            />
          </label>
        </div>

        <h3 style={{ marginTop: 32 }}>Ouder 2</h3>
        <p className="small-note">Optioneel.</p>

        <div className="form-grid">
          <label>
            Voornaam ouder 2
            <input
              value={parent2FirstName}
              onChange={(e) => setParent2FirstName(e.target.value)}
            />
          </label>

          <label>
            Naam ouder 2
            <input
              value={parent2LastName}
              onChange={(e) => setParent2LastName(e.target.value)}
            />
          </label>

          <label>
            E-mailadres ouder 2
            <input
              type="email"
              value={parent2Email}
              onChange={(e) => setParent2Email(e.target.value)}
            />
          </label>

          <label>
            Telefoonnummer ouder 2
            <input
              value={parent2Phone}
              onChange={(e) => setParent2Phone(e.target.value)}
            />
          </label>
        </div>

        <h3 style={{ marginTop: 32 }}>Adresgegevens</h3>

        <div className="form-grid">
          <label>
            Straat en nummer <RequiredStar />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>

          <label>
            Postcode <RequiredStar />
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              required
            />
          </label>

          <label>
            Gemeente <RequiredStar />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </label>

          <label>
            Noodcontact
            <input
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Naam + telefoonnummer"
            />
          </label>

          <label>
            Voorkeur begeleiding
            <select
              value={preferredFormat}
              onChange={(e) => setPreferredFormat(e.target.value)}
            >
              <option value="">Geen voorkeur</option>
              <option value="digital">Digitaal</option>
              <option value="home">Fysiek aan huis</option>
              <option value="both">Beide mogelijk</option>
            </select>
          </label>
        </div>

        <label style={{ display: "block", marginTop: 20 }}>
          Beschikbare dagen / uren
          <textarea
            rows={3}
            value={availabilityNotes}
            onChange={(e) => setAvailabilityNotes(e.target.value)}
            placeholder="Bijvoorbeeld: maandag na 17u, woensdagmiddag..."
          />
        </label>

        <label style={{ display: "block", marginTop: 20 }}>
          Extra info ouder(s)
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Waarmee mag Studio SaGo rekening houden?"
          />
        </label>

        <h3 style={{ marginTop: 32 }}>Kinderen / leerlingen</h3>

        {students.map((student, index) => {
          const isSecondary = student.educationLevel === "middelbaar";

          return (
            <div
              key={index}
              className="admin-request-card"
              style={{ marginTop: 18 }}
            >
              <h3>Leerling {index + 1}</h3>

              <div className="form-grid">
                <label>
                  Naam leerling <RequiredStar />
                  <input
                    value={student.name}
                    onChange={(e) =>
                      updateStudent(index, "name", e.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Geboortedatum <RequiredStar />
                  <input
                    type="date"
                    value={student.birthDate}
                    onChange={(e) =>
                      updateStudent(index, "birthDate", e.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  School <RequiredStar />
                  <input
                    value={student.school}
                    onChange={(e) =>
                      updateStudent(index, "school", e.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Onderwijsniveau <RequiredStar />
                  <select
                    value={student.educationLevel}
                    onChange={(e) => {
                      updateStudent(index, "educationLevel", e.target.value);
                      updateStudent(index, "grade", "");
                      updateStudent(index, "secondaryTrack", "");
                      updateStudent(index, "finality", "");
                    }}
                    required
                  >
                    <option value="">Kies niveau</option>
                    <option value="lager">Kleuter / lager onderwijs</option>
                    <option value="middelbaar">Middelbaar onderwijs</option>
                  </select>
                </label>

                <label>
                  Leerjaar <RequiredStar />
                  <select
                    value={student.grade}
                    onChange={(e) =>
                      updateStudent(index, "grade", e.target.value)
                    }
                    required
                  >
                    <option value="">Kies leerjaar</option>
                    {(isSecondary ? secondaryGrades : primaryGrades).map(
                      (grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      )
                    )}
                  </select>
                </label>

                {isSecondary && (
                  <>
                    <label>
                      Richting <RequiredStar />
                      <input
                        value={student.secondaryTrack}
                        onChange={(e) =>
                          updateStudent(
                            index,
                            "secondaryTrack",
                            e.target.value
                          )
                        }
                        placeholder="bv. Moderne talen, STEM, Zorg..."
                        required
                      />
                    </label>

                    <label>
                      Finaliteit <RequiredStar />
                      <select
                        value={student.finality}
                        onChange={(e) =>
                          updateStudent(index, "finality", e.target.value)
                        }
                        required
                      >
                        <option value="">Kies finaliteit</option>
                        <option value="doorstroomfinaliteit">
                          Doorstroomfinaliteit
                        </option>
                        <option value="dubbele finaliteit">
                          Dubbele finaliteit
                        </option>
                        <option value="arbeidsmarktfinaliteit">
                          Arbeidsmarktfinaliteit
                        </option>
                      </select>
                    </label>
                  </>
                )}

                <label>
                  Vakken / leerinhoud
                  <input
                    value={student.preferredSubjects}
                    onChange={(e) =>
                      updateStudent(
                        index,
                        "preferredSubjects",
                        e.target.value
                      )
                    }
                    placeholder="bv. wiskunde, Frans, begrijpend lezen..."
                  />
                </label>

                <label>
                  Diagnose / zorginfo
                  <input
                    value={student.diagnosis}
                    onChange={(e) =>
                      updateStudent(index, "diagnosis", e.target.value)
                    }
                    placeholder="bv. ASS, ADHD, dyslexie..."
                  />
                </label>

                <label>
                  Huisarts
                  <input
                    value={student.doctorName}
                    onChange={(e) =>
                      updateStudent(index, "doctorName", e.target.value)
                    }
                    placeholder="Naam huisarts"
                  />
                </label>

                <label>
                  Telefoon huisarts
                  <input
                    value={student.doctorPhone}
                    onChange={(e) =>
                      updateStudent(index, "doctorPhone", e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="privacy-note">
                <strong>🔒 Bijzondere persoonsgegevens</strong>
                Medische gegevens behoren tot de bijzondere persoonsgegevens
                volgens de GDPR. Vul deze informatie enkel in wanneer dit nodig
                is om een veilige, passende en kwaliteitsvolle begeleiding te
                kunnen voorzien. Deze gegevens worden vertrouwelijk behandeld en
                uitsluitend gebruikt binnen Studio SaGo.
              </div>

              <label style={{ display: "block", marginTop: 20 }}>
                Medische gegevens / medicatie
                <textarea
                  rows={3}
                  value={student.medicalInfo}
                  onChange={(e) =>
                    updateStudent(index, "medicalInfo", e.target.value)
                  }
                  placeholder="Allergieën, medicatie, medische aandachtspunten..."
                />
              </label>

              <label style={{ display: "block", marginTop: 20 }}>
                Ondersteuningsnoden
                <textarea
                  rows={3}
                  value={student.supportNeeds}
                  onChange={(e) =>
                    updateStudent(index, "supportNeeds", e.target.value)
                  }
                />
              </label>

              <label style={{ display: "block", marginTop: 20 }}>
                Doelen van de begeleiding
                <textarea
                  rows={3}
                  value={student.goals}
                  onChange={(e) => updateStudent(index, "goals", e.target.value)}
                />
              </label>

              <label style={{ display: "block", marginTop: 20 }}>
                Extra info leerling
                <textarea
                  rows={3}
                  value={student.notes}
                  onChange={(e) => updateStudent(index, "notes", e.target.value)}
                />
              </label>

              <label className="checkbox-row" style={{ marginTop: 20 }}>
                <input
                  type="checkbox"
                  checked={student.photoConsent}
                  onChange={(e) =>
                    updateStudent(index, "photoConsent", e.target.checked)
                  }
                />
                <span>
                  Ik geef toestemming dat dit kind herkenbaar op foto’s van
                  Studio SaGo mag staan. Deze toestemming kan later ingetrokken
                  worden.
                </span>
              </label>

              {students.length > 1 && (
                <button
                  type="button"
                  className="secondary-action small-action"
                  onClick={() => removeStudent(index)}
                  style={{ marginTop: 18 }}
                >
                  Leerling verwijderen
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          className="secondary-action small-action"
          onClick={addStudent}
          style={{ marginTop: 20 }}
        >
          + Leerling toevoegen
        </button>

        <label className="checkbox-row" style={{ marginTop: 24 }}>
          <input
            type="checkbox"
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            required
          />
          <span>
            <RequiredStar /> Ik verklaar kennis genomen te hebben van het
            privacybeleid van Studio SaGo en geef toestemming voor het verwerken
            van mijn persoonsgegevens en die van mijn kind(eren) voor het
            organiseren van begeleiding, communicatie, administratie, facturatie
            en opvolging van de dienstverlening. Ik weet dat ik mijn gegevens op
            elk moment kan inkijken, aanpassen of verwijdering kan vragen
            overeenkomstig de GDPR/AVG.
          </span>
        </label>

        <label className="checkbox-row" style={{ marginTop: 14 }}>
          <input
            type="checkbox"
            checked={photoConsent}
            onChange={(e) => setPhotoConsent(e.target.checked)}
          />
          <span>
            Ik geef toestemming dat Studio SaGo algemene sfeerfoto’s waarop ik
            of mijn kind herkenbaar kan zijn, mag gebruiken voor communicatie,
            website, sociale media en drukwerk. Deze toestemming is optioneel en
            kan op elk moment ingetrokken worden.
          </span>
        </label>

        <p className="small-note">
          Je persoonsgegevens worden uitsluitend verwerkt voor de dienstverlening
          van Studio SaGo. Je kunt je gegevens op elk moment inkijken, wijzigen
          of een verwijderingsverzoek indienen.
        </p>

        <div className="dashboard-buttons" style={{ marginTop: 28 }}>
          <button
            className="primary-action small-action"
            type="submit"
            disabled={saving}
          >
            {saving ? "Gegevens opslaan..." : "Gegevens opslaan"}
          </button>

          <button
            className="secondary-action small-action"
            type="button"
            onClick={resetPassword}
            disabled={saving}
          >
            Wachtwoord aanpassen
          </button>
        </div>

        <div className="form-grid" style={{ marginTop: 24 }}>
          <label>
            Nieuw e-mailadres
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </label>

          <button
            className="secondary-action small-action"
            type="button"
            onClick={changeEmail}
            disabled={saving}
          >
            E-mailadres wijzigen
          </button>
        </div>

        {message && <p className="form-message">{message}</p>}
      </form>
    </section>
  );
}