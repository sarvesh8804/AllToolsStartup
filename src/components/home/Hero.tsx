import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/urls";
import { PrivacyBadge } from "@/components/tool/PrivacyBadge";
import { SearchTrigger } from "@/components/search/SearchTrigger";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 15% -5%, rgba(223,198,42,0.45), transparent 55%), radial-gradient(ellipse 55% 40% at 90% 0%, rgba(196,167,10,0.18), transparent 50%), linear-gradient(180deg, #fff6b8 0%, var(--background) 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M0 80L80 0M-20 20L20 -20M60 100L100 60' stroke='%23c4a70a' stroke-width='1' fill='none'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <p className="font-[family-name:var(--font-display)] text-5xl tracking-tight text-[var(--foreground)] sm:text-7xl">
          {SITE_NAME}
        </p>
        <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--foreground)] sm:text-3xl">
          {SITE_TAGLINE}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          Everything runs securely inside your browser. No account. No uploads
          for private tools. Formatters, PDFs, images, calculators, and
          converters — one place.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <PrivacyBadge />
          <SearchTrigger />
          <Link
            href="/tools"
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--accent-bright)]"
          >
            Browse developer tools
          </Link>
        </div>
      </div>
    </section>
  );
}
