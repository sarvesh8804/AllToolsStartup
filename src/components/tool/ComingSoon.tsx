import Link from "next/link";
import type { ToolDefinition } from "@/types/tool";
import { PrivacyBadge } from "@/components/tool/PrivacyBadge";
import { FaqList } from "@/components/tool/FaqList";
import { FAMILY_LABELS, familyPath } from "@/lib/urls";

export function ComingSoon({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--copper-bright)]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={familyPath(tool.family)}
          className="hover:text-[var(--copper-bright)]"
        >
          {FAMILY_LABELS[tool.family]}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{tool.name}</span>
      </nav>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <p className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          Coming soon
        </p>
        <PrivacyBadge local={tool.privacyLocal} />
      </div>

      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)]">
        {tool.name}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
        {tool.description}
      </p>

      <div className="mt-10 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
          On the forge bench
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
          This tool is in the registry as <strong>planned</strong>. It will ship
          in a daily phase and appear here with full client-side processing—no
          uploads required.
        </p>
        <Link
          href={familyPath(tool.family)}
          className="mt-6 inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--accent-bright)]"
        >
          Browse {FAMILY_LABELS[tool.family]}
        </Link>
      </div>

      <FaqList faqs={tool.faqs} />
    </div>
  );
}
