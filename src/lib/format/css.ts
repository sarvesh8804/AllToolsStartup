/** Lightweight CSS beautifier / minifier (not a full CSS parser). */

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function protectStrings(css: string): { text: string; strings: string[] } {
  const strings: string[] = [];
  const text = css.replace(/(["'])(?:\\.|(?!\1)[\s\S])*\1/g, (m) => {
    strings.push(m);
    return `__CSS_STR_${strings.length - 1}__`;
  });
  return { text, strings };
}

function restoreStrings(css: string, strings: string[]): string {
  return css.replace(/__CSS_STR_(\d+)__/g, (_, i) => strings[Number(i)]);
}

export function formatCss(input: string, indentSize = 2): string {
  const pad = (n: number) => " ".repeat(Math.max(0, n) * indentSize);
  const { text, strings } = protectStrings(input);

  const normalized = stripComments(text)
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, " { ")
    .replace(/\s*}\s*/g, " } ")
    .replace(/\s*;\s*/g, "; ")
    .replace(/\s*:\s*/g, ": ")
    .replace(/([^\s;{}])\s*}/g, "$1; }")
    .replace(/\s+/g, " ")
    .trim();

  // Split into structural tokens while keeping content attached to braces.
  const chunks = normalized
    .replace(/\{/g, "{\n")
    .replace(/\}/g, "\n}\n")
    .replace(/;/g, ";\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const out: string[] = [];
  let depth = 0;

  for (const line of chunks) {
    if (line === "}") {
      depth = Math.max(0, depth - 1);
      out.push(pad(depth) + "}");
      continue;
    }

    // "selector {" style lines
    if (line.endsWith("{")) {
      out.push(pad(depth) + line);
      depth += 1;
      continue;
    }

    out.push(pad(depth) + line);
  }

  let result = restoreStrings(out.join("\n"), strings);
  // Drop spaces inserted inside empty rules like "{ }"
  result = result.replace(/\{\s*\}/g, "{}");
  return result.trim() ? result.trim() + "\n" : "";
}

export function minifyCss(input: string): string {
  const { text, strings } = protectStrings(input);

  const out = stripComments(text)
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();

  return restoreStrings(out, strings);
}
