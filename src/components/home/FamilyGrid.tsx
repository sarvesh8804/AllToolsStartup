import Link from "next/link";
import {
  FAMILY_DESCRIPTIONS,
  FAMILY_LABELS,
  familyPath,
} from "@/lib/urls";
import { TOOL_FAMILIES, type ToolFamily } from "@/types/tool";

export function FamilyGrid({
  counts,
}: {
  counts: Record<ToolFamily, number>;
}) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-14 sm:px-6 lg:px-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
        Families
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Only shipped tools appear in hubs. Planned tools stay out of the
        sitemap.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOL_FAMILIES.map((family) => (
          <Link
            key={family}
            href={familyPath(family)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--copper)]/45"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
                {FAMILY_LABELS[family]}
              </h3>
              <span className="text-xs text-[var(--muted)]">
                {counts[family]} shipped
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {FAMILY_DESCRIPTIONS[family]}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
