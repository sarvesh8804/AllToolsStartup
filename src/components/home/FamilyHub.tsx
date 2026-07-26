import Link from "next/link";
import type { ToolDefinition, ToolFamily } from "@/types/tool";
import {
  FAMILY_DESCRIPTIONS,
  FAMILY_LABELS,
  toolPath,
} from "@/lib/urls";

export function FamilyHub({
  family,
  shipped,
}: {
  family: ToolFamily;
  shipped: ToolDefinition[];
}) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        Family
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)]">
        {FAMILY_LABELS[family]}
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        {FAMILY_DESCRIPTIONS[family]}
      </p>

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
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shipped.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={toolPath(tool.family, tool.slug)}
                className="block h-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:border-[var(--copper)]/45"
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
    </div>
  );
}
