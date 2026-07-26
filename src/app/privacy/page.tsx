import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy",
  description:
    "Forge processes files and text in your browser whenever possible. We do not require accounts for MVP tools.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Privacy
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        Last updated: July 26, 2026
      </p>
      <h2 className="mt-10 font-[family-name:var(--font-display)] text-2xl">
        Browser-first processing
      </h2>
      <p className="mt-3 text-[var(--muted)]">
        Forge tools are built to run in your browser. Text you paste and files
        you select are intended to stay in your device memory for processing.
        We do not operate an upload pipeline for MVP tools.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-display)] text-2xl">
        Analytics
      </h2>
      <p className="mt-3 text-[var(--muted)]">
        We may use privacy-friendly analytics (for example Cloudflare Web
        Analytics) to understand aggregate traffic. Tool analytics events never
        include the contents of your files or pasted text.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-display)] text-2xl">
        Accounts
      </h2>
      <p className="mt-3 text-[var(--muted)]">
        The MVP has no authentication and no user database.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-display)] text-2xl">
        Contact
      </h2>
      <p className="mt-3 text-[var(--muted)]">
        Questions about privacy can be opened as issues on the project
        repository once published.
      </p>
    </article>
  );
}
