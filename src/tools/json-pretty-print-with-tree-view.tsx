"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { buildJsonTree, SAMPLE_JSON_TREE, type JsonTreeNode } from "@/lib/json/tree";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

function TreeRow({
  node,
  depth,
  defaultOpen,
}: {
  node: JsonTreeNode;
  depth: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = node.children && node.children.length > 0;
  const label =
    node.key === "root"
      ? node.type
      : `${node.key}: ${node.type === "object" || node.type === "array" ? node.type : node.value}`;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm font-[family-name:var(--font-mono)]",
          hasChildren ? "hover:bg-[var(--surface)]" : "text-[var(--muted)]",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          <span className="text-[var(--accent)]">{open ? "▾" : "▸"}</span>
        ) : (
          <span className="w-3" />
        )}
        <span className="truncate">{label}</span>
      </button>
      {hasChildren && open ? (
        <div>
          {node.children!.map((child) => (
            <TreeRow
              key={`${depth}-${child.key}`}
              node={child}
              depth={depth + 1}
              defaultOpen={depth < 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function JsonPrettyPrintWithTreeViewTool() {
  const [input, setInput] = useState(SAMPLE_JSON_TREE);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "json-pretty-print-with-tree-view",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(() => buildJsonTree(input), [input]);

  return (
    <div className="space-y-4">
      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <p className="text-sm text-[var(--muted)]">{result.nodeCount} nodes</p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="JSON input" getText={() => input} />
          <CodeEditor
            language="json"
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
            }}
            minHeight="55vh"
          />
        </div>
        <div className="space-y-4">
          <div>
            <EditorPaneHeader
              label="Pretty print"
              getText={() => (result.ok ? result.formatted : "")}
            />
            <CodeEditor
              language="json"
              value={result.ok ? result.formatted : ""}
              editable={false}
              minHeight="28vh"
            />
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
            <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Tree view
            </p>
            {result.ok ? (
              <TreeRow node={result.tree} depth={0} defaultOpen={true} />
            ) : (
              <p className="px-2 py-3 text-sm text-[var(--muted)]">Fix JSON to see the tree.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
