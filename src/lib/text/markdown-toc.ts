export type TocHeading = {
  level: number;
  text: string;
  slug: string;
};

export type TocStyle = "bullet" | "numbered";

export type MarkdownTocOptions = {
  minLevel?: number;
  maxLevel?: number;
  style?: TocStyle;
};

export const SAMPLE_MARKDOWN_TOC = `# Project Guide

Intro paragraph.

## Installation

Download and install.

### macOS

Use Homebrew.

### Windows

Use the installer.

## Usage

Run the tool locally.

### Options

Configure as needed.

## FAQ

Common questions.
`;

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .trim();
}

/** GitHub-style heading slug for anchor links. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(markdown: string): Omit<TocHeading, "slug">[] {
  const headings: Omit<TocHeading, "slug">[] = [];
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) continue;

    const level = match[1]!.length;
    const text = stripInlineMarkdown(match[2]!);
    if (!text) continue;
    headings.push({ level, text });
  }

  return headings;
}

function assignSlugs(
  headings: Omit<TocHeading, "slug">[],
): TocHeading[] {
  const counts = new Map<string, number>();
  return headings.map((heading) => {
    const base = slugifyHeading(heading.text) || "section";
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    const slug = seen === 0 ? base : `${base}-${seen}`;
    return { ...heading, slug };
  });
}

function indentForLevel(level: number, baseLevel: number): string {
  return "  ".repeat(Math.max(0, level - baseLevel));
}

/** Build a Markdown table of contents from heading lines. */
export function generateMarkdownToc(
  markdown: string,
  options: MarkdownTocOptions = {},
): { ok: true; toc: string; headings: TocHeading[] } | { ok: false; error: string } {
  const minLevel = options.minLevel ?? 1;
  const maxLevel = options.maxLevel ?? 6;
  const style = options.style ?? "bullet";

  if (minLevel < 1 || maxLevel > 6 || minLevel > maxLevel) {
    return { ok: false, error: "Heading levels must be between 1 and 6." };
  }

  const raw = markdown.trim();
  if (!raw) {
    return { ok: false, error: "Paste Markdown with headings to build a table of contents." };
  }

  const filtered = assignSlugs(extractHeadings(raw)).filter(
    (h) => h.level >= minLevel && h.level <= maxLevel,
  );

  if (filtered.length === 0) {
    return {
      ok: false,
      error: "No headings found. Use # syntax (e.g. ## Section).",
    };
  }

  const baseLevel = Math.min(...filtered.map((h) => h.level));
  const lines: string[] = [];
  const counters: number[] = [];

  filtered.forEach((heading, index) => {
    const indent = indentForLevel(heading.level, baseLevel);
    const link = `[${heading.text}](#${heading.slug})`;

    if (style === "numbered") {
      while (counters.length < heading.level) counters.push(0);
      counters.length = heading.level;
      counters[heading.level - 1] = (counters[heading.level - 1] ?? 0) + 1;
      for (let i = heading.level; i < counters.length; i++) {
        counters[i] = 0;
      }
      const number = counters.slice(0, heading.level).join(".");
      lines.push(`${indent}${number}. ${link}`);
    } else {
      lines.push(`${indent}- ${link}`);
    }

    if (index === filtered.length - 1) return;
  });

  return { ok: true, toc: lines.join("\n"), headings: filtered };
}
