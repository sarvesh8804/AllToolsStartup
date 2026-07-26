import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, FAMILY_LABELS } from "@/lib/urls";
import { TOOL_FAMILIES } from "@/types/tool";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 py-12 sm:px-6 lg:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
            {SITE_NAME}
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            {SITE_TAGLINE} Browser-first utilities. No account. No uploads when
            we can help it.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Families
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {TOOL_FAMILIES.map((family) => (
              <li key={family}>
                <Link
                  href={`/${family}`}
                  className="text-[var(--foreground)] hover:text-[var(--copper-bright)]"
                >
                  {FAMILY_LABELS[family]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Site
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/about"
                className="hover:text-[var(--copper-bright)]"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-[var(--copper-bright)]"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[var(--copper-bright)]">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-[var(--copper-bright)]">
                Blog
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} {SITE_NAME}. Built to ship daily.
      </div>
    </footer>
  );
}
