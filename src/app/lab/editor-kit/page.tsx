import type { Metadata } from "next";
import { EditorKitDemo } from "@/components/editor/EditorKitDemo";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Editor kit",
  description: "Internal demo of shared editor components.",
  path: "/lab/editor-kit",
  noIndex: true,
});

export default function EditorKitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Editor kit
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Shared building blocks for upcoming tools (noindex).
      </p>
      <div className="mt-8">
        <EditorKitDemo />
      </div>
    </div>
  );
}
