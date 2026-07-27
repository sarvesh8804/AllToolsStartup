export type VCardInput = {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  note?: string;
};

/**
 * Escape text for vCard 3.0 property values.
 */
export function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function line(key: string, value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return `${key}:${escapeVCardValue(trimmed)}`;
}

/**
 * Build a vCard 3.0 string suitable for QR encoding.
 * Requires a displayable name (FN) from first and/or last name.
 */
export function buildVCard(input: VCardInput): string {
  const first = input.firstName.trim();
  const last = input.lastName.trim();
  const fn = [first, last].filter(Boolean).join(" ").trim();
  if (!fn) {
    throw new Error("Enter a first or last name.");
  }

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCardValue(last)};${escapeVCardValue(first)};;;`,
    `FN:${escapeVCardValue(fn)}`,
  ];

  const optional = [
    line("ORG", input.organization),
    line("TITLE", input.title),
    line("TEL;TYPE=CELL", input.phone),
    line("EMAIL;TYPE=INTERNET", input.email),
    line("URL", input.url),
  ];

  const street = input.street?.trim() ?? "";
  const city = input.city?.trim() ?? "";
  const region = input.region?.trim() ?? "";
  const postal = input.postalCode?.trim() ?? "";
  const country = input.country?.trim() ?? "";
  if (street || city || region || postal || country) {
    const adr = ["", "", street, city, region, postal, country]
      .map(escapeVCardValue)
      .join(";");
    optional.push(`ADR;TYPE=HOME:${adr}`);
  }

  optional.push(line("NOTE", input.note));

  for (const l of optional) {
    if (l) lines.push(l);
  }

  lines.push("END:VCARD");
  return lines.join("\n");
}
