import { load as loadYaml } from "js-yaml";

export type YamlToJsonResult =
  | { ok: true; json: string; value: unknown }
  | { ok: false; error: string };

export function yamlToJson(
  input: string,
  spaces: number = 2,
): YamlToJsonResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste YAML to convert." };
  }

  try {
    const value = loadYaml(trimmed);
    if (value === undefined) {
      return { ok: false, error: "YAML document is empty." };
    }
    const indent = Math.max(0, spaces);
    const json =
      JSON.stringify(value, null, indent === 0 ? undefined : indent) +
      (indent > 0 ? "\n" : "");
    return { ok: true, value, json };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid YAML",
    };
  }
}
