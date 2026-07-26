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

const Base64Tool = dynamic(
  () => import("@/tools/base64-encode-decode").then((m) => m.Base64Tool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const UrlEncodeTool = dynamic(
  () => import("@/tools/url-encode-decode").then((m) => m.UrlEncodeTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const UuidGeneratorTool = dynamic(
  () => import("@/tools/uuid-v4-generator").then((m) => m.UuidGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JwtDecoderTool = dynamic(
  () => import("@/tools/jwt-decoder").then((m) => m.JwtDecoderTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const Sha256Tool = dynamic(
  () => import("@/tools/sha-256-hash").then((m) => m.Sha256Tool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const Md5Tool = dynamic(
  () => import("@/tools/md5-hash-generator").then((m) => m.Md5Tool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CaseConverterTool = dynamic(
  () => import("@/tools/case-converter").then((m) => m.CaseConverterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const WordCounterTool = dynamic(
  () => import("@/tools/word-counter").then((m) => m.WordCounterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CharacterCounterTool = dynamic(
  () =>
    import("@/tools/character-counter").then((m) => m.CharacterCounterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const SlugGeneratorTool = dynamic(
  () => import("@/tools/slug-generator").then((m) => m.SlugGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const RandomPasswordTool = dynamic(
  () =>
    import("@/tools/random-password-generator").then(
      (m) => m.RandomPasswordTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const REGISTRY = {
  "json-formatter": JsonFormatterTool,
  "json-validator": JsonValidatorTool,
  "base64-encode-decode": Base64Tool,
  "url-encode-decode": UrlEncodeTool,
  "uuid-v4-generator": UuidGeneratorTool,
  "jwt-decoder": JwtDecoderTool,
  "sha-256-hash": Sha256Tool,
  "md5-hash-generator": Md5Tool,
  "case-converter": CaseConverterTool,
  "word-counter": WordCounterTool,
  "character-counter": CharacterCounterTool,
  "slug-generator": SlugGeneratorTool,
  "random-password-generator": RandomPasswordTool,
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
