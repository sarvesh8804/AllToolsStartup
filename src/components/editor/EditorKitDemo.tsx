"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { DownloadButton } from "@/components/editor/DownloadButton";
import { FileDropzone } from "@/components/editor/FileDropzone";
import { useToast } from "@/components/editor/ToastProvider";

const SAMPLE = `{
  "forge": true,
  "phase": "F10"
}`;

export function EditorKitDemo() {
  const [value, setValue] = useState(SAMPLE);
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <CopyButton getText={() => value} />
        <DownloadButton filename="forge-sample.json" getBlob={() => value} />
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm"
          onClick={() => toast("Toast kit works")}
        >
          Toast
        </button>
      </div>
      <CodeEditor language="json" value={value} onChange={setValue} />
      <FileDropzone
        accept=".json,application/json,text/plain"
        onFile={async (file) => {
          const text = await file.text();
          setValue(text);
          toast(`Loaded ${file.name}`);
        }}
      />
    </div>
  );
}
