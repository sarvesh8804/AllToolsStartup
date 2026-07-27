import Link from "next/link";
import type { ToolDefinition } from "@/types/tool";
import { toolPath } from "@/lib/urls";

/** Curated homepage anchors for crawl + conversion (not alphabetical). */
const FEATURED_SLUGS = [
  "json-formatter",
  "jwt-decoder",
  "pdf-merge",
  "image-resizer",
  "regex-tester",
  "uuid-v4-generator",
  "base64-encode-decode",
  "emi-loan-calculator",
  "sip-calculator",
] as const;

export function FeaturedTools({ tools }: { tools: ToolDefinition[] }) {
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const featured = FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (t): t is ToolDefinition => t != null,
  );
  const extras =
    featured.length < 9
      ? tools
          .filter(
            (t) =>
              !FEATURED_SLUGS.includes(
                t.slug as (typeof FEATURED_SLUGS)[number],
              ),
          )
          .slice(0, 9 - featured.length)
      : [];
  const list = [...featured, ...extras].slice(0, 9);

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
        Popular tools
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        High-intent starters across developer, PDF, image, calculator, and
        convert families.
      </p>
      {list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
            Workshop opening
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            Tools are shipping — check back shortly.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((tool) => (
            <li key={`${tool.family}-${tool.slug}`}>
              <Link
                href={toolPath(tool.family, tool.slug)}
                className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:border-[var(--copper)]/45"
              >
                <p className="font-medium text-[var(--foreground)]">
                  {tool.name}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {tool.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
