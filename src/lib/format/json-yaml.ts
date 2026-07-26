import { dump as dumpYaml } from "js-yaml";

export type JsonToYamlResult =
  | { ok: true; yaml: string; value: unknown }
  | { ok: false; error: string };

export function jsonToYaml(input: string): JsonToYamlResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON to convert." };
  }

  let value: unknown;
  try {
    value = JSON.parse(trimmed);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }

  try {
    const yaml = dumpYaml(value, {
      indent: 2,
      lineWidth: 100,
      noRefs: true,
      sortKeys: false,
    });
    return { ok: true, value, yaml };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to convert to YAML",
    };
  }
}
