export type SitemapChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapUrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: SitemapChangeFreq | "";
  priority?: string;
};

export type SitemapOptions = {
  urls: string[];
  /** Apply the same lastmod (YYYY-MM-DD) to all entries when set. */
  lastmod?: string;
  changefreq?: SitemapChangeFreq | "";
  priority?: string;
};

export type SitemapResult =
  | { ok: true; xml: string; count: number }
  | { ok: false; error: string };

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function parseSitemapUrlLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"));
}

export function isLikelyUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildSitemapXml(options: SitemapOptions): SitemapResult {
  const urls = options.urls.map((u) => u.trim()).filter(Boolean);
  if (urls.length === 0) {
    return { ok: false, error: "Add at least one URL (one per line)." };
  }
  if (urls.length > 500) {
    return { ok: false, error: "Limit is 500 URLs for this tool." };
  }

  const invalid = urls.filter((u) => !isLikelyUrl(u));
  if (invalid.length) {
    return {
      ok: false,
      error: `Invalid URL (need http/https): ${invalid[0]}`,
    };
  }

  if (options.lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(options.lastmod)) {
    return { ok: false, error: "lastmod must be YYYY-MM-DD when set." };
  }

  if (options.priority) {
    const p = Number(options.priority);
    if (!Number.isFinite(p) || p < 0 || p > 1) {
      return { ok: false, error: "priority must be between 0.0 and 1.0." };
    }
  }

  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ];

  for (const loc of urls) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(loc)}</loc>`);
    if (options.lastmod) {
      lines.push(`    <lastmod>${options.lastmod}</lastmod>`);
    }
    if (options.changefreq) {
      lines.push(`    <changefreq>${options.changefreq}</changefreq>`);
    }
    if (options.priority) {
      lines.push(`    <priority>${options.priority}</priority>`);
    }
    lines.push("  </url>");
  }

  lines.push(`</urlset>`);
  lines.push("");

  return { ok: true, xml: lines.join("\n"), count: urls.length };
}
