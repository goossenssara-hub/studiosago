type CertificateInput = {
  studentName: string;
  score: number;
  completedAt: Date;
};

function escapePdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Brussels",
  }).format(date);
}

function textLine(
  text: string,
  x: number,
  y: number,
  size: number,
  font = "F1"
) {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(
    text
  )}) Tj ET`;
}

export function generateFrenchCertificatePdf({
  studentName,
  score,
  completedAt,
}: CertificateInput) {
  const content = [
    "q",
    "0.012 0.212 0.388 rg",
    "0 0 842 595 re f",
    "Q",
    "q",
    "1 1 1 rg",
    "34 34 774 527 re f",
    "Q",
    "q",
    "0.157 0.725 0.667 RG",
    "6 w",
    "48 48 746 499 re S",
    "Q",

    textLine("STUDIO SAGO", 336, 500, 18, "F2"),
    textLine("CERTIFICAAT", 270, 440, 42, "F2"),
    textLine("Dit certificaat wordt uitgereikt aan", 286, 392, 17),
    textLine(studentName, 250, 340, 31, "F2"),

    textLine(
      `Je behaalde ${score}% voor de voorbereiding`,
      235,
      282,
      19,
      "F2"
    ),
    textLine(
      "Frans voor het middelbaar.",
      292,
      251,
      19,
      "F2"
    ),

    textLine(
      "Je oefende woordenschat, grammatica, lezen, luisteren,",
      203,
      205,
      14
    ),
    textLine(
      "spreken, schrijven en Franstalige cultuur.",
      263,
      182,
      14
    ),

    textLine(`Behaald op ${formatDate(completedAt)}`, 310, 120, 14),
    textLine("Sara Goossens - Studio SaGo", 298, 82, 13, "F2"),
  ].join("\n");

  const objects: string[] = [];

  objects.push(
    "<< /Type /Catalog /Pages 2 0 R >>"
  );
  objects.push(
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"
  );
  objects.push(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] " +
      "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> " +
      "/Contents 6 0 R >>"
  );
  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );
  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  );
  objects.push(
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`
  );

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(pdf, "ascii");
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "ascii");

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf +=
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "ascii");
}
