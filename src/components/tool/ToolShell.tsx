import Link from "next/link";
import type { ReactNode } from "react";
import type { ToolDefinition } from "@/types/tool";
import { PrivacyBadge } from "@/components/tool/PrivacyBadge";
import { FaqList } from "@/components/tool/FaqList";
import { RelatedTools } from "@/components/tool/RelatedTools";
import { FAMILY_LABELS, familyPath } from "@/lib/urls";

export function ToolShell({
  tool,
  related,
  children,
}: {
  tool: ToolDefinition;
  related: ToolDefinition[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[var(--copper-bright)]">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={familyPath(tool.family)}
              className="hover:text-[var(--copper-bright)]"
            >
              {FAMILY_LABELS[tool.family]}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-[var(--foreground)]">{tool.name}</li>
        </ol>
      </nav>

      <header className="mt-6 flex flex-col gap-4 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <PrivacyBadge local={tool.privacyLocal} />
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {tool.category}
            </span>
          </div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl">
            {tool.name}
          </h1>
          <p className="mt-3 max-w-3xl text-[var(--muted)]">{tool.summary}</p>
        </div>
      </header>

      <div className="mt-8">{children}</div>

      <FaqList faqs={tool.faqs} />
      <RelatedTools tools={related} />
    </div>
  );
}

export function ToolEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-[var(--muted)]">
      {message}
    </div>
  );
}

export function ToolErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]"
    >
      {message}
    </div>
  );
}
