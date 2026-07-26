import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms",
  description: "Terms of use for Forge browser tools.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Terms
      </h1>
      <p className="mt-4 text-[var(--muted)]">Last updated: July 26, 2026</p>
      <p className="mt-6 text-[var(--muted)]">
        Forge provides free browser-based utilities as-is, without warranties of
        any kind. You are responsible for verifying outputs before relying on
        them for legal, financial, medical, or production decisions.
      </p>
      <p className="mt-4 text-[var(--muted)]">
        Do not use Forge to process data you are not allowed to handle on the
        device you are using. We may change, add, or remove tools at any time.
      </p>
      <p className="mt-4 text-[var(--muted)]">
        Calculators and converters are informational aids, not professional
        advice.
      </p>
    </article>
  );
}
