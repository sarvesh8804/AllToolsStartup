"use client";

export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("forge:open-search"))
      }
      className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--copper)]/40 hover:text-[var(--foreground)]"
      aria-label="Open search"
    >
      <span>Search</span>
      <kbd className="hidden rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)] sm:inline">
        ⌘K
      </kbd>
      <span className="sr-only">or press /</span>
    </button>
  );
}
