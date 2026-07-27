import Link from "next/link";
import type { ToolDefinition, ToolFamily } from "@/types/tool";
import {
  FAMILY_DESCRIPTIONS,
  FAMILY_LABELS,
  toolPath,
} from "@/lib/urls";
import { HUB_CONTENT } from "@/lib/seo/hubs";
import { FaqList } from "@/components/tool/FaqList";

export function FamilyHub({
  family,
  shipped,
}: {
  family: ToolFamily;
  shipped: ToolDefinition[];
}) {
  const hub = HUB_CONTENT[family];
  const startHere = hub.startHere
    .map((slug) => shipped.find((t) => t.slug === slug))
    .filter((t): t is ToolDefinition => t != null);
  const rest = shipped.filter(
    (t) => !startHere.some((s) => s.slug === t.slug),
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[var(--copper-bright)]">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-[var(--foreground)]">
            {FAMILY_LABELS[family]}
          </li>
        </ol>
      </nav>

      <p className="mt-6 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        Category
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)]">
        {FAMILY_LABELS[family]}
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        {FAMILY_DESCRIPTIONS[family]}
      </p>
      <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-[var(--muted)]">
        {hub.intro.map((para) => (
          <p key={para.slice(0, 48)}>{para}</p>
        ))}
      </div>

      {shipped.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
            No shipped tools here yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            This hub only lists live tools. Planned entries stay out of search
            indexes until they ship.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex text-sm text-[var(--copper-bright)] hover:underline"
          >
            Back home
          </Link>
        </div>
      ) : (
        <>
          {startHere.length > 0 ? (
            <section className="mt-10" aria-labelledby="start-here-heading">
              <h2
                id="start-here-heading"
                className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]"
              >
                Start here
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {startHere.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-12" aria-labelledby="all-tools-heading">
            <h2
              id="all-tools-heading"
              className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]"
            >
              All {FAMILY_LABELS[family].toLowerCase()}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(startHere.length ? rest : shipped).map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </ul>
          </section>

          <FaqList faqs={hub.faqs} />
        </>
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <li>
      <Link
        href={toolPath(tool.family, tool.slug)}
        className="block h-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:border-[var(--copper)]/45"
      >
        <p className="font-medium text-[var(--foreground)]">{tool.name}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{tool.summary}</p>
      </Link>
    </li>
  );
}
