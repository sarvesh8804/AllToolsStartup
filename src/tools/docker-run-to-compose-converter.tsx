"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  convertDockerRunToCompose,
  SAMPLE_DOCKER_RUN,
} from "@/lib/dev/docker-compose";
import { track } from "@/lib/analytics";

export function DockerRunToComposeConverterTool() {
  const [input, setInput] = useState(SAMPLE_DOCKER_RUN);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => convertDockerRunToCompose(input), [input]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "docker-run-to-compose-converter", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="docker run" getText={() => input} />
          <CodeEditor language="text" value={input} onChange={(v) => { markStart(); setInput(v); }} minHeight="55vh" />
        </div>
        <div>
          <EditorPaneHeader label="docker-compose.yml" getText={() => (result.ok ? result.yaml : "")} />
          {!result.ok ? <ToolErrorState message={result.error} /> : (
            <CodeEditor language="text" value={result.yaml} editable={false} minHeight="55vh" />
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">Supports common flags: -d, --name, -p, -e, -v, --restart. Complex shell quoting may need manual cleanup.</p>
    </div>
  );
}
