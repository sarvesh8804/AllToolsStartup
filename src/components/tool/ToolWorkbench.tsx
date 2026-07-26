"use client";

import dynamic from "next/dynamic";
import { ToolEmptyState } from "@/components/tool/ToolShell";

const JsonFormatterTool = dynamic(
  () =>
    import("@/tools/json-formatter").then((m) => m.JsonFormatterTool),
  {
    ssr: false,
    loading: () => <ToolEmptyState message="Loading tool…" />,
  },
);

const JsonValidatorTool = dynamic(
  () =>
    import("@/tools/json-validator").then((m) => m.JsonValidatorTool),
  {
    ssr: false,
    loading: () => <ToolEmptyState message="Loading tool…" />,
  },
);

const REGISTRY = {
  "json-formatter": JsonFormatterTool,
  "json-validator": JsonValidatorTool,
} as const;

export function ToolWorkbench({ component }: { component?: string }) {
  if (!component || !(component in REGISTRY)) {
    return (
      <ToolEmptyState message="No interactive engine is registered for this tool yet." />
    );
  }

  const Tool = REGISTRY[component as keyof typeof REGISTRY];
  return <Tool />;
}
