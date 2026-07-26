import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { InternalLink } from "@/components/ui/InternalLink";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "Forge is a browser-first tools platform. Everything runs locally when possible. No accounts, no paid APIs for MVP.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
        About Forge
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        Forge is a static-first workshop of browser utilities — formatters,
        converters, PDF and image tools, calculators — designed to finish small
        jobs without accounts or uploads when we can help it.
      </p>
      <h2 className="mt-10 font-[family-name:var(--font-display)] text-2xl">
        Constraints (by design)
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--muted)]">
        <li>Client-side processing whenever possible</li>
        <li>Hostable on Vercel Free</li>
        <li>No paid APIs, no AI inference, no database for MVP</li>
        <li>No authentication for MVP</li>
        <li>Ship daily, index only what works</li>
      </ul>
      <p className="mt-8 text-[var(--muted)]">
        Read the{" "}
        <InternalLink href="/privacy">privacy policy</InternalLink> and browse{" "}
        <InternalLink href="/tools">tools</InternalLink>.
      </p>
    </article>
  );
}
