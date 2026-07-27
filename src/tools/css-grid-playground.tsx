"use client";

import { useCallback, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  ALIGN_CONTENTS,
  ALIGN_ITEMS,
  DEFAULT_GRID_OPTIONS,
  GRID_TRACK_MODES,
  JUSTIFY_CONTENTS,
  JUSTIFY_ITEMS,
  buildGridCss,
  type AlignContent,
  type AlignItems,
  type GridTrackMode,
  type JustifyContent,
  type JustifyItems,
} from "@/lib/css/grid";
import { track } from "@/lib/analytics";

const ITEM_COLORS = [
  "#c4a70a",
  "#6b8f3c",
  "#3d6b8a",
  "#a35c3a",
  "#7a5ea8",
  "#3a8a7a",
  "#8a3a5c",
  "#5c7a3a",
  "#3a5c8a",
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

export function CssGridPlaygroundTool() {
  const [columns, setColumns] = useState(DEFAULT_GRID_OPTIONS.columns);
  const [rows, setRows] = useState(DEFAULT_GRID_OPTIONS.rows);
  const [columnTrack, setColumnTrack] = useState<GridTrackMode>(
    DEFAULT_GRID_OPTIONS.columnTrack,
  );
  const [rowTrack, setRowTrack] = useState<GridTrackMode>(
    DEFAULT_GRID_OPTIONS.rowTrack,
  );
  const [columnSize, setColumnSize] = useState(DEFAULT_GRID_OPTIONS.columnSize);
  const [rowSize, setRowSize] = useState(DEFAULT_GRID_OPTIONS.rowSize);
  const [columnGap, setColumnGap] = useState(DEFAULT_GRID_OPTIONS.columnGap);
  const [rowGap, setRowGap] = useState(DEFAULT_GRID_OPTIONS.rowGap);
  const [justifyItems, setJustifyItems] = useState<JustifyItems>(
    DEFAULT_GRID_OPTIONS.justifyItems,
  );
  const [alignItems, setAlignItems] = useState<AlignItems>(
    DEFAULT_GRID_OPTIONS.alignItems,
  );
  const [justifyContent, setJustifyContent] = useState<JustifyContent>(
    DEFAULT_GRID_OPTIONS.justifyContent,
  );
  const [alignContent, setAlignContent] = useState<AlignContent>(
    DEFAULT_GRID_OPTIONS.alignContent,
  );
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "css-grid-playground",
        family: "tools",
      });
    }
  }, [started]);

  const css = useMemo(
    () =>
      buildGridCss({
        columns,
        rows,
        columnTrack,
        rowTrack,
        columnSize,
        rowSize,
        columnGap,
        rowGap,
        justifyItems,
        alignItems,
        justifyContent,
        alignContent,
      }),
    [
      columns,
      rows,
      columnTrack,
      rowTrack,
      columnSize,
      rowSize,
      columnGap,
      rowGap,
      justifyItems,
      alignItems,
      justifyContent,
      alignContent,
    ],
  );

  const copyCss = async () => {
    markStart();
    try {
      await navigator.clipboard.writeText(css.rule);
      setCopied(true);
      track({
        name: "tool_complete",
        tool: "css-grid-playground",
        family: "tools",
      });
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Columns
              <input
                type="number"
                min={1}
                max={12}
                value={columns}
                onChange={(e) => {
                  markStart();
                  setColumns(Number(e.target.value));
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Rows
              <input
                type="number"
                min={1}
                max={12}
                value={rows}
                onChange={(e) => {
                  markStart();
                  setRows(Number(e.target.value));
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
              />
            </label>
            <SelectField
              label="Column track"
              value={columnTrack}
              options={GRID_TRACK_MODES}
              onChange={(v) => {
                markStart();
                setColumnTrack(v);
              }}
            />
            <SelectField
              label="Row track"
              value={rowTrack}
              options={GRID_TRACK_MODES}
              onChange={(v) => {
                markStart();
                setRowTrack(v);
              }}
            />
            {columnTrack === "px" ? (
              <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
                Column size (px)
                <input
                  type="number"
                  min={20}
                  max={400}
                  value={columnSize}
                  onChange={(e) => {
                    markStart();
                    setColumnSize(Number(e.target.value));
                  }}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
                />
              </label>
            ) : null}
            {rowTrack === "px" ? (
              <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
                Row size (px)
                <input
                  type="number"
                  min={20}
                  max={400}
                  value={rowSize}
                  onChange={(e) => {
                    markStart();
                    setRowSize(Number(e.target.value));
                  }}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
                />
              </label>
            ) : null}
            <SelectField
              label="justify-items"
              value={justifyItems}
              options={JUSTIFY_ITEMS}
              onChange={(v) => {
                markStart();
                setJustifyItems(v);
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
              label="justify-content"
              value={justifyContent}
              options={JUSTIFY_CONTENTS}
              onChange={(v) => {
                markStart();
                setJustifyContent(v);
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
          </div>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            <span className="flex justify-between">
              column-gap
              <span className="font-[family-name:var(--font-mono)]">
                {columnGap}px
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={48}
              value={columnGap}
              onChange={(e) => {
                markStart();
                setColumnGap(Number(e.target.value));
              }}
              className="accent-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            <span className="flex justify-between">
              row-gap
              <span className="font-[family-name:var(--font-mono)]">
                {rowGap}px
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={48}
              value={rowGap}
              onChange={(e) => {
                markStart();
                setRowGap(Number(e.target.value));
              }}
              className="accent-[var(--accent)]"
            />
          </label>

          <div>
            <EditorPaneHeader label="CSS" getText={() => css.rule} />
            <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
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
          <p className="text-sm text-[var(--muted)]">
            Live preview · {css.cellCount} cells
          </p>
          <div
            className="min-h-[320px] rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-3"
            style={css.style}
          >
            {Array.from({ length: css.cellCount }, (_, i) => (
              <div
                key={i}
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md px-2 py-2 text-sm font-medium text-[var(--ink)]"
                style={{
                  background: ITEM_COLORS[i % ITEM_COLORS.length],
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
