export type MetaTagsInput = {
  title: string;
  description: string;
  /** Full URL or display path shown under the title. */
  url: string;
};

export type MetaTagsPreview = {
  title: string;
  description: string;
  url: string;
  displayUrl: string;
  titleChars: number;
  descriptionChars: number;
  titleTruncated: boolean;
  descriptionTruncated: boolean;
  titleOk: boolean;
  descriptionOk: boolean;
  warnings: string[];
  htmlSnippet: string;
};

/** Soft Google desktop title limit (pixels ≈ chars for Latin). */
export const TITLE_SOFT_MAX = 60;
/** Soft Google desktop meta description limit. */
export const DESCRIPTION_SOFT_MAX = 155;

export function truncateSerp(text: string, max: number): {
  text: string;
  truncated: boolean;
} {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return { text: clean, truncated: false };
  const sliced = clean.slice(0, max - 1);
  const cut = sliced.lastIndexOf(" ");
  const base = (cut > max * 0.5 ? sliced.slice(0, cut) : sliced).trimEnd();
  return { text: `${base}…`, truncated: true };
}

export function formatDisplayUrl(url: string): string {
  const raw = url.trim();
  if (!raw) return "example.com › page";
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withProto);
    const parts = [u.hostname.replace(/^www\./, "")];
    const segs = u.pathname.split("/").filter(Boolean);
    if (segs.length) parts.push(...segs.slice(0, 3));
    return parts.join(" › ");
  } catch {
    return raw.replace(/^https?:\/\//i, "").replace(/\//g, " › ");
  }
}

export function buildMetaTagsPreview(
  input: MetaTagsInput,
): MetaTagsPreview {
  const titleRaw = input.title.trim();
  const descRaw = input.description.trim();
  const url = input.url.trim() || "https://example.com/page";

  const titleCut = truncateSerp(titleRaw || "Page title", TITLE_SOFT_MAX);
  const descCut = truncateSerp(
    descRaw || "Meta description appears here in search results.",
    DESCRIPTION_SOFT_MAX,
  );

  const titleChars = titleRaw.length;
  const descriptionChars = descRaw.length;
  const titleOk = titleChars > 0 && titleChars <= TITLE_SOFT_MAX;
  const descriptionOk =
    descriptionChars > 0 && descriptionChars <= DESCRIPTION_SOFT_MAX;

  const warnings: string[] = [];
  if (!titleRaw) warnings.push("Add a title — empty titles rarely rank well.");
  else if (titleChars > TITLE_SOFT_MAX) {
    warnings.push(
      `Title is ${titleChars} characters; Google often truncates near ~${TITLE_SOFT_MAX}.`,
    );
  } else if (titleChars < 30) {
    warnings.push("Title is short — consider adding a clearer keyword phrase.");
  }

  if (!descRaw) {
    warnings.push("Add a meta description for control over the SERP snippet.");
  } else if (descriptionChars > DESCRIPTION_SOFT_MAX) {
    warnings.push(
      `Description is ${descriptionChars} characters; snippets often truncate near ~${DESCRIPTION_SOFT_MAX}.`,
    );
  } else if (descriptionChars < 70) {
    warnings.push("Description is short — you have room for a stronger CTA.");
  }

  const safeTitle = titleRaw || "Page title";
  const safeDesc = descRaw || "";
  const htmlSnippet = [
    `<title>${escapeHtml(safeTitle)}</title>`,
    `<meta name="description" content="${escapeAttr(safeDesc)}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:title" content="${escapeAttr(safeTitle)}" />`,
    `<meta property="og:description" content="${escapeAttr(safeDesc)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
  ].join("\n");

  return {
    title: titleCut.text,
    description: descCut.text,
    url,
    displayUrl: formatDisplayUrl(url),
    titleChars,
    descriptionChars,
    titleTruncated: titleCut.truncated,
    descriptionTruncated: descCut.truncated,
    titleOk,
    descriptionOk,
    warnings,
    htmlSnippet,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
