export type SlugOptions = {
  separator?: string;
  lowercase?: boolean;
  strict?: boolean;
};

/** Convert arbitrary text into a URL-friendly slug. */
export function slugify(input: string, options: SlugOptions = {}): string {
  const { separator = "-", lowercase = true, strict = true } = options;

  let text = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

  if (lowercase) text = text.toLowerCase();

  const allowed = strict ? "a-zA-Z0-9" : "\\p{L}\\p{N}";
  const stripPattern = new RegExp(`[^${allowed}]+`, "gu");

  text = text.replace(stripPattern, " ").trim();
  const words = text.split(/\s+/).filter(Boolean);

  return words.join(separator);
}
