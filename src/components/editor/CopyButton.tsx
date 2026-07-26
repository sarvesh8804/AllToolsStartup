"use client";

import { useToast } from "@/components/editor/ToastProvider";
import { cn } from "@/lib/cn";

export function CopyButton({
  getText,
  label = "Copy",
  className,
}: {
  getText: () => string;
  label?: string;
  className?: string;
}) {
  const { toast } = useToast();

  return (
    <button
      type="button"
      className={cn(
        "rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] transition hover:border-[var(--copper)]/50",
        className,
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          toast("Copied to clipboard");
        } catch {
          toast("Copy failed", "error");
        }
      }}
    >
      {label}
    </button>
  );
}
