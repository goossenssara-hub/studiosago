const DOMAIN = "leerling.studiosago.be";

function normalizePart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function splitStudentName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return {
      firstName: parts[0] ?? "",
      lastName: "leerling",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(""),
  };
}

export function generateStudentEmail(fullName: string) {
  const { firstName, lastName } = splitStudentName(fullName);
  const safeFirstName = normalizePart(firstName);
  const safeLastName = normalizePart(lastName);

  return `${safeFirstName}.${safeLastName}@${DOMAIN}`;
}

export function generateStudentPassword(length = 14) {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%";
  const all = uppercase + lowercase + numbers + symbols;

  const required = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const remaining = Array.from({ length: Math.max(length - required.length, 0) }, () => {
    return all[Math.floor(Math.random() * all.length)];
  });

  return [...required, ...remaining]
    .sort(() => Math.random() - 0.5)
    .join("");
}
