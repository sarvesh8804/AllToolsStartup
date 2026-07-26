"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME, FAMILY_LABELS } from "@/lib/urls";
import { TOOL_FAMILIES } from "@/types/tool";
import { cn } from "@/lib/cn";
import { SearchTrigger } from "@/components/search/SearchTrigger";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            className="flex size-7 items-center justify-center rounded-md bg-[var(--accent)] font-[family-name:var(--font-display)] text-sm font-bold text-[var(--ink)]"
            aria-hidden
          >
            F
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--foreground)]">
            {SITE_NAME}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {TOOL_FAMILIES.map((family) => {
            const href = `/${family}`;
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={family}
                href={href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm transition",
                  active
                    ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                {FAMILY_LABELS[family]}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchTrigger />
          <Link
            href="/blog"
            className="hidden text-sm text-[var(--muted)] hover:text-[var(--foreground)] sm:inline"
          >
            Blog
          </Link>
        </div>
      </div>
    </header>
  );
}
