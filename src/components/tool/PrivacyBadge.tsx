import { cn } from "@/lib/cn";

export function PrivacyBadge({
  local = true,
  className,
}: {
  local?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        local
          ? "border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--copper-bright)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          local ? "bg-[var(--accent)]" : "bg-[var(--muted)]",
        )}
        aria-hidden
      />
      {local ? "Runs in your browser" : "Processing details"}
    </span>
  );
}
