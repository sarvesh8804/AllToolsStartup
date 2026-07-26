"use client";

import type { ReactNode } from "react";
import { CopyButton } from "@/components/editor/CopyButton";

/** Label row above an editor with an optional Copy control. */
export function EditorPaneHeader({
  label,
  getText,
  copyLabel = "Copy",
  extra,
}: {
  label: string;
  getText?: () => string;
  copyLabel?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {extra}
        {getText ? (
          <CopyButton getText={getText} label={copyLabel} className="!py-1 !text-xs" />
        ) : null}
      </div>
    </div>
  );
}
