"use client";

import { useCallback, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  ALIGN_CONTENTS,
  ALIGN_ITEMS,
  DEFAULT_FLEXBOX_OPTIONS,
  FLEX_DIRECTIONS,
  FLEX_WRAPS,
  JUSTIFY_CONTENTS,
  buildFlexboxCss,
  type AlignContent,
  type AlignItems,
  type FlexDirection,
  type FlexWrap,
  type JustifyContent,
} from "@/lib/css/flexbox";
import { track } from "@/lib/analytics";

const ITEM_COLORS = [
  "#c4a70a",
  "#6b8f3c",
  "#3d6b8a",
  "#a35c3a",
  "#7a5ea8",
  "#3a8a7a",
];

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CssFlexboxPlaygroundTool() {
  const [direction, setDirection] = useState<FlexDirection>(
    DEFAULT_FLEXBOX_OPTIONS.direction,
  );
  const [wrap, setWrap] = useState<FlexWrap>(DEFAULT_FLEXBOX_OPTIONS.wrap);
  const [justifyContent, setJustifyContent] = useState<JustifyContent>(
    DEFAULT_FLEXBOX_OPTIONS.justifyContent,
  );
  const [alignItems, setAlignItems] = useState<AlignItems>(
    DEFAULT_FLEXBOX_OPTIONS.alignItems,
  );
  const [alignContent, setAlignContent] = useState<AlignContent>(
    DEFAULT_FLEXBOX_OPTIONS.alignContent,
  );
  const [gap, setGap] = useState(DEFAULT_FLEXBOX_OPTIONS.gap);
  const [itemCount, setItemCount] = useState(5);
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "css-flexbox-playground",
        family: "tools",
      });
    }
  }, [started]);

  const css = useMemo(
    () =>
      buildFlexboxCss({
        direction,
        wrap,
        justifyContent,
        alignItems,
        alignContent,
        gap,
      }),
    [direction, wrap, justifyContent, alignItems, alignContent, gap],
  );

  const copyCss = async () => {
    markStart();
    try {
      await navigator.clipboard.writeText(css.rule);
      setCopied(true);
      track({
        name: "tool_complete",
        tool: "css-flexbox-playground",
        family: "tools",
      });
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  const items = Array.from({ length: Math.max(1, Math.min(12, itemCount)) });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="flex-direction"
              value={direction}
              options={FLEX_DIRECTIONS}
              onChange={(v) => {
                markStart();
                setDirection(v);
              }}
            />
            <SelectField
              label="flex-wrap"
              value={wrap}
              options={FLEX_WRAPS}
              onChange={(v) => {
                markStart();
                setWrap(v);
              }}
            />
            <SelectField
              label="justify-content"
              value={justifyContent}
              options={JUSTIFY_CONTENTS}
              onChange={(v) => {
                markStart();
                setJustifyContent(v);
              }}
            />
            <SelectField
              label="align-items"
              value={alignItems}
              options={ALIGN_ITEMS}
              onChange={(v) => {
                markStart();
                setAlignItems(v);
              }}
            />
            <SelectField
              label="align-content"
              value={alignContent}
              options={ALIGN_CONTENTS}
              onChange={(v) => {
                markStart();
                setAlignContent(v);
              }}
            />
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Items
              <input
                type="number"
                min={1}
                max={12}
                value={itemCount}
                onChange={(e) => {
                  markStart();
                  setItemCount(Number(e.target.value));
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            <span className="flex justify-between">
              gap
              <span className="font-[family-name:var(--font-mono)]">{gap}px</span>
            </span>
            <input
              type="range"
              min={0}
              max={48}
              value={gap}
              onChange={(e) => {
                markStart();
                setGap(Number(e.target.value));
              }}
              className="accent-[var(--accent)]"
            />
          </label>

          <div>
            <EditorPaneHeader label="CSS" getText={() => css.rule} />
            <pre className="overflow-x-auto rounded-b-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
              {css.rule}
            </pre>
            <div className="mt-2">
              <button
                type="button"
                onClick={copyCss}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
              >
                {copied ? "Copied rule" : "Copy CSS rule"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-[var(--muted)]">Live preview</p>
          <div
            className="min-h-[320px] rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-3"
            style={css.style}
          >
            {items.map((_, i) => (
              <div
                key={i}
                className="flex min-h-[48px] min-w-[64px] items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-[var(--ink)]"
                style={{
                  background: ITEM_COLORS[i % ITEM_COLORS.length],
                  flex:
                    alignItems === "stretch" &&
                    (direction === "row" || direction === "row-reverse")
                      ? "1 1 80px"
                      : "0 0 auto",
                  height:
                    direction === "column" || direction === "column-reverse"
                      ? `${40 + (i % 3) * 16}px`
                      : undefined,
                  width:
                    direction === "row" || direction === "row-reverse"
                      ? `${64 + (i % 3) * 24}px`
                      : undefined,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
