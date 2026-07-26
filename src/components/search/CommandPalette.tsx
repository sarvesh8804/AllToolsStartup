"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { track } from "@/lib/analytics";

export type SearchItem = {
  slug: string;
  name: string;
  family: string;
  category: string;
  summary: string;
  href: string;
  keywords: string[];
};

/** Prefer name / keyword hits so the first visible row is the best match. */
function searchScore(value: string, search: string): number {
  if (!search) return 1;
  const v = value.toLowerCase();
  const s = search.toLowerCase().trim();
  if (!s) return 1;
  if (!v.includes(s)) return 0;
  if (v.startsWith(s)) return 100;
  const name = v.split("\u0000")[0] ?? v;
  if (name.startsWith(s)) return 90;
  if (name.includes(s)) return 70;
  return 40;
}

export function CommandPalette({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const openSearch = useCallback(() => {
    // Drop focus from editors (e.g. CodeMirror) so ⌘K can land in search.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setQuery("");
    setOpen(true);
    track({ name: "search_open" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (
          e.key === "/" &&
          (tag === "INPUT" ||
            tag === "TEXTAREA" ||
            (e.target as HTMLElement).isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") closeSearch();
    };

    const onCustom = () => openSearch();
    window.addEventListener("keydown", onKey);
    window.addEventListener("forge:open-search", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("forge:open-search", onCustom);
    };
  }, [openSearch, closeSearch]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
      listRef.current?.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Keep the first (best) match in view when the query changes.
  // cmdk may call scrollIntoView on the selected item afterward — reset after that.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = 0;
    const id = window.setTimeout(() => {
      list.scrollTop = 0;
    }, 0);
    return () => window.clearTimeout(id);
  }, [query, open]);

  const empty = useMemo(() => items.length === 0, [items.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        className="absolute inset-0 bg-[var(--ink)]/35"
        onClick={closeSearch}
      />
      <div className="relative mx-auto mt-[12vh] w-[min(640px,calc(100%-1.5rem))] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <Command
          label="Search tools"
          className="bg-transparent"
          filter={searchScore}
          shouldFilter
          loop
        >
          <Command.Input
            ref={inputRef}
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder={
              empty
                ? "No shipped tools yet — check back after P001"
                : "Search shipped tools…"
            }
            className="w-full border-b border-[var(--border)] bg-transparent px-4 py-3 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
          <Command.List
            ref={listRef}
            className="max-h-80 overflow-y-auto overscroll-contain p-2"
          >
            <Command.Empty className="px-3 py-8 text-center text-sm text-[var(--muted)]">
              {empty
                ? "Forge is live. Tools start shipping in phase P001."
                : "No matching tools."}
            </Command.Empty>
            <Command.Group heading="Tools">
              {items.map((item) => (
                <Command.Item
                  key={item.href}
                  value={`${item.name}\u0000${item.category} ${item.keywords.join(" ")} ${item.summary}`}
                  keywords={[item.name, item.category, ...item.keywords]}
                  onSelect={() => {
                    track({ name: "search_select", tool: item.slug });
                    closeSearch();
                    router.push(item.href);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-2 aria-selected:bg-[var(--surface-2)]"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-[var(--foreground)]">
                      {item.name}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      {item.family}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {item.summary}
                  </p>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
