export type CaseStyle =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant";

/** Split mixed identifiers into lowercase words. */
export function splitWords(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  return trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function toUpperCase(input: string): string {
  return input.toUpperCase();
}

export function toLowerCase(input: string): string {
  return input.toLowerCase();
}

export function toTitleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/(^|[^\p{L}\p{N}'])(\p{L})/gu, (_, sep: string, ch: string) =>
      sep + ch.toUpperCase(),
    );
}

export function toSentenceCase(input: string): string {
  const lower = input.toLowerCase();
  return lower.replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toUpperCase());
}

export function toCamelCase(input: string): string {
  const words = splitWords(input);
  if (words.length === 0) return "";
  return words[0] + words.slice(1).map(capitalize).join("");
}

export function toPascalCase(input: string): string {
  return splitWords(input).map(capitalize).join("");
}

export function toSnakeCase(input: string): string {
  return splitWords(input).join("_");
}

export function toKebabCase(input: string): string {
  return splitWords(input).join("-");
}

export function toConstantCase(input: string): string {
  return splitWords(input)
    .map((w) => w.toUpperCase())
    .join("_");
}

export function convertCase(input: string, style: CaseStyle): string {
  switch (style) {
    case "upper":
      return toUpperCase(input);
    case "lower":
      return toLowerCase(input);
    case "title":
      return toTitleCase(input);
    case "sentence":
      return toSentenceCase(input);
    case "camel":
      return toCamelCase(input);
    case "pascal":
      return toPascalCase(input);
    case "snake":
      return toSnakeCase(input);
    case "kebab":
      return toKebabCase(input);
    case "constant":
      return toConstantCase(input);
  }
}

export const CASE_STYLES: { id: CaseStyle; label: string }[] = [
  { id: "upper", label: "UPPERCASE" },
  { id: "lower", label: "lowercase" },
  { id: "title", label: "Title Case" },
  { id: "sentence", label: "Sentence case" },
  { id: "camel", label: "camelCase" },
  { id: "pascal", label: "PascalCase" },
  { id: "snake", label: "snake_case" },
  { id: "kebab", label: "kebab-case" },
  { id: "constant", label: "CONSTANT_CASE" },
];
