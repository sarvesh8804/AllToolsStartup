"use client";

import { useCallback, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";

export function FileDropzone({
  accept,
  onFile,
  label = "Drop a file here, or click to browse",
  className,
}: {
  accept?: string;
  onFile: (file: File) => void;
  label?: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <label
      onDragEnter={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setActive(false)}
      onDrop={onDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition",
        active
          ? "border-[var(--copper)] bg-[var(--copper)]/10"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--copper)]/40",
        className,
      )}
    >
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="mt-2 text-xs text-[var(--muted)]">
        Files stay in your browser memory — never uploaded to Forge.
      </span>
      <input
        type="file"
        className="sr-only"
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </label>
  );
}
