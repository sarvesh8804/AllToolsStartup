"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  buildColorfulAvatarSvg,
  DEFAULT_AVATAR_NAME,
  DEFAULT_AVATAR_SIZE,
  type AvatarShape,
  type AvatarStyle,
} from "@/lib/generate/avatar";
import { downloadBlob } from "@/lib/image/canvas";
import { track } from "@/lib/analytics";

function downloadSvg(svg: string, filename: string) {
  downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), filename);
}

export function ColorfulAvatarGeneratorTool() {
  const [name, setName] = useState(DEFAULT_AVATAR_NAME);
  const [size, setSize] = useState(DEFAULT_AVATAR_SIZE);
  const [shape, setShape] = useState<AvatarShape>("circle");
  const [style, setStyle] = useState<AvatarStyle>("initials");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => buildColorfulAvatarSvg({ name, size, shape, style }),
    [name, size, shape, style],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "colorful-avatar-generator",
        family: "tools",
      });
    }
  }, [started]);

  const touch = useCallback(() => {
    markStart();
    track({
      name: "tool_complete",
      tool: "colorful-avatar-generator",
      family: "tools",
    });
  }, [markStart]);

  const previewUrl = useMemo(() => {
    if (!result.ok) return null;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}`;
  }, [result]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Name or label
          <input
            value={name}
            onChange={(e) => {
              touch();
              setName(e.target.value);
            }}
            placeholder="Ada Lovelace"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Size (px)
          <input
            type="number"
            min={32}
            max={512}
            value={size}
            onChange={(e) => {
              touch();
              setSize(Number(e.target.value));
            }}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Shape
          <select
            value={shape}
            onChange={(e) => {
              touch();
              setShape(e.target.value as AvatarShape);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          >
            <option value="circle">Circle</option>
            <option value="rounded">Rounded</option>
            <option value="square">Square</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Style
          <select
            value={style}
            onChange={(e) => {
              touch();
              setStyle(e.target.value as AvatarStyle);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          >
            <option value="initials">Initials</option>
            <option value="pattern">Color pattern</option>
          </select>
        </label>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={`${name} avatar preview`}
                  width={Math.min(size, 192)}
                  height={Math.min(size, 192)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                />
              ) : null}
              <p className="text-xs text-[var(--muted)]">
                {result.initials} · {result.background}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton getText={() => result.svg} label="Copy SVG" />
              <button
                type="button"
                onClick={() => {
                  touch();
                  downloadSvg(result.svg, "avatar.svg");
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              >
                Download SVG
              </button>
            </div>
          </div>

          <div>
            <EditorPaneHeader label="SVG output" />
            <CodeEditor
              value={result.svg}
              language="text"
              editable={false}
              minHeight="220px"
            />
          </div>
        </>
      )}

      <p className="text-xs text-[var(--muted)]">
        Colors and initials are derived from the name — same input always produces
        the same avatar. Generated entirely in your browser.
      </p>
    </div>
  );
}
