import { formatJson, minifyJson } from "@/lib/json/format";

export type SafeJsonResult =
  | { ok: true; json: string; chars: number }
  | { ok: false; error: string };

export function safeMinifyJson(raw: string): SafeJsonResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON to minify." };
  }
  try {
    const json = minifyJson(trimmed);
    return { ok: true, json, chars: json.length };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}

export function safeFormatJson(raw: string, spaces = 2): SafeJsonResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON to format." };
  }
  try {
    const json = formatJson(trimmed, spaces);
    return { ok: true, json, chars: json.length };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}
