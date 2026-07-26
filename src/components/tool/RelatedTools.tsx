import Link from "next/link";
import type { ToolDefinition } from "@/types/tool";
import { toolPath } from "@/lib/urls";

export function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (!tools.length) return null;

  return (
    <section className="mt-12" aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]"
      >
        Related tools
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={`${tool.family}-${tool.slug}`}>
            <Link
              href={toolPath(tool.family, tool.slug)}
              className="block rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition hover:border-[var(--copper)]/50 hover:bg-[var(--surface-2)]"
            >
              <div className="font-medium text-[var(--foreground)]">
                {tool.name}
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{tool.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
