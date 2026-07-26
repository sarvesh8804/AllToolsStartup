import Link from "next/link";
import type { ToolDefinition } from "@/types/tool";
import { toolPath } from "@/lib/urls";

export function FeaturedTools({ tools }: { tools: ToolDefinition[] }) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
        Featured
      </h2>
      {tools.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
            Workshop opening
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            Foundation is live. The first shipped tools arrive in phase{" "}
            <strong>P001</strong> (JSON Formatter & Validator). Until then,
            explore families and the blog.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/tools/json-formatter"
              className="text-sm text-[var(--copper-bright)] hover:underline"
            >
              Preview upcoming: JSON Formatter
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.slice(0, 6).map((tool) => (
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
