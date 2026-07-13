export type InternalAccountType =
  | "parent"
  | "student";

function removeAccents(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeNamePart(value: string): string {
  return removeAccents(value)
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function getFirstGivenName(firstNames: string): string {
  const parts = firstNames
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return normalizeNamePart(parts[0] || "");
}

function combineLastNames(lastNames: string): string {
  return lastNames
    .trim()
    .split(/\s+/)
    .map(normalizeNamePart)
    .filter(Boolean)
    .join("");
}

export function createInternalEmailBase({
  firstNames,
  lastNames,
  type,
}: {
  firstNames: string;
  lastNames: string;
  type: InternalAccountType;
}): string {
  const firstName =
    getFirstGivenName(firstNames);

  const combinedLastName =
    combineLastNames(lastNames);

  if (!firstName || !combinedLastName) {
    throw new Error(
      "Voornaam en familienaam zijn nodig om een intern e-mailadres te maken."
    );
  }

  const domain =
    type === "student"
      ? "leerling.studiosago.be"
      : "ouder.studiosago.be";

  return `${firstName}.${combinedLastName}@${domain}`;
}

export function addNumberToInternalEmail(
  baseEmail: string,
  number: number
): string {
  if (number <= 1) {
    return baseEmail;
  }

  const [localPart, domain] =
    baseEmail.split("@");

  if (!localPart || !domain) {
    throw new Error(
      "Het interne e-mailadres is ongeldig."
    );
  }

  return `${localPart}${number}@${domain}`;
}