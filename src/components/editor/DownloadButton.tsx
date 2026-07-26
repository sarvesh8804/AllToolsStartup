"use client";

import { cn } from "@/lib/cn";

export function DownloadButton({
  filename,
  getBlob,
  label = "Download",
  className,
}: {
  filename: string;
  getBlob: () => Blob | string;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--accent-bright)]",
        className,
      )}
      onClick={() => {
        const data = getBlob();
        const blob =
          typeof data === "string"
            ? new Blob([data], { type: "text/plain;charset=utf-8" })
            : data;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      {label}
    </button>
  );
}
