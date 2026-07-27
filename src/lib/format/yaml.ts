import { dump as dumpYaml, load as loadYaml } from "js-yaml";

export type FormatYamlOptions = {
  /** Spaces per indent level (default 2). */
  indent?: number;
  /** Sort object keys alphabetically (default false). */
  sortKeys?: boolean;
  /** Preferred line width before wrapping (default 80). Use -1 to disable. */
  lineWidth?: number;
};

export type FormatYamlResult =
  | { ok: true; yaml: string; value: unknown }
  | { ok: false; error: string };

/**
 * Parse YAML and re-dump with consistent indentation / options.
 */
export function formatYaml(
  input: string,
  options: FormatYamlOptions = {},
): FormatYamlResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste YAML to format." };
  }

  let value: unknown;
  try {
    value = loadYaml(trimmed);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid YAML",
    };
  }

  if (value === undefined) {
    return { ok: false, error: "YAML document is empty." };
  }

  const indent = Math.max(1, options.indent ?? 2);
  const sortKeys = options.sortKeys ?? false;
  const lineWidth = options.lineWidth ?? 80;

  try {
    const yaml = dumpYaml(value, {
      indent,
      lineWidth,
      noRefs: true,
      sortKeys,
    });
    return { ok: true, value, yaml };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to format YAML",
    };
  }
}

export type MinifyYamlOptions = {
  /** Sort object keys alphabetically (default false). */
  sortKeys?: boolean;
};

/**
 * Compact YAML using flow style for nested structures.
 */
export function minifyYaml(
  input: string,
  options: MinifyYamlOptions = {},
): FormatYamlResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste YAML to minify." };
  }

  let value: unknown;
  try {
    value = loadYaml(trimmed);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid YAML",
    };
  }

  if (value === undefined) {
    return { ok: false, error: "YAML document is empty." };
  }

  try {
    const yaml = dumpYaml(value, {
      indent: 1,
      lineWidth: -1,
      noRefs: true,
      sortKeys: options.sortKeys ?? false,
      flowLevel: 0,
    });
    return { ok: true, value, yaml: yaml.trimEnd() + "\n" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to minify YAML",
    };
  }
}
