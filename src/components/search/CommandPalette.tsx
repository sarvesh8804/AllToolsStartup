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

export function CommandPalette({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const openSearch = useCallback(() => {
    // Drop focus from editors (e.g. CodeMirror) so ⌘K can land in search.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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
      if (e.key === "Escape") setOpen(false);
    };

    const onCustom = () => openSearch();
    window.addEventListener("keydown", onKey);
    window.addEventListener("forge:open-search", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("forge:open-search", onCustom);
    };
  }, [openSearch]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const empty = useMemo(() => items.length === 0, [items.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        className="absolute inset-0 bg-[var(--ink)]/35"
        onClick={() => setOpen(false)}
      />
      <div className="relative mx-auto mt-[12vh] w-[min(640px,calc(100%-1.5rem))] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <Command label="Search tools" className="bg-transparent">
          <Command.Input
            ref={inputRef}
            autoFocus
            placeholder={
              empty
                ? "No shipped tools yet — check back after P001"
                : "Search shipped tools…"
            }
            className="w-full border-b border-[var(--border)] bg-transparent px-4 py-3 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
          <Command.List className="max-h-80 overflow-auto p-2">
            <Command.Empty className="px-3 py-8 text-center text-sm text-[var(--muted)]">
              {empty
                ? "Forge is live. Tools start shipping in phase P001."
                : "No matching tools."}
            </Command.Empty>
            <Command.Group heading="Tools">
              {items.map((item) => (
                <Command.Item
                  key={item.href}
                  value={`${item.name} ${item.category} ${item.keywords.join(" ")}`}
                  onSelect={() => {
                    track({ name: "search_select", tool: item.slug });
                    setOpen(false);
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
