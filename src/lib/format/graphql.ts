export type GraphqlFormatResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

type Protected = { text: string; slots: string[] };

function protectStrings(source: string): Protected {
  const slots: string[] = [];
  let out = "";
  let i = 0;

  const push = (raw: string) => {
    slots.push(raw);
    return `__GQL_STR_${slots.length - 1}__`;
  };

  while (i < source.length) {
    const ch = source[i];

    if (ch === "#") {
      let j = i + 1;
      while (j < source.length && source[j] !== "\n") j += 1;
      out += push(source.slice(i, j));
      i = j;
      continue;
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      if (quote === '"' && source.slice(i, i + 3) === '"""') {
        j = i + 3;
        while (j < source.length && source.slice(j, j + 3) !== '"""') {
          j += 1;
        }
        j = Math.min(source.length, j + 3);
        out += push(source.slice(i, j));
        i = j;
        continue;
      }
      while (j < source.length) {
        if (source[j] === "\\") {
          j += 2;
          continue;
        }
        if (source[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      out += push(source.slice(i, j));
      i = j;
      continue;
    }

    out += ch;
    i += 1;
  }

  return { text: out, slots };
}

function restore(text: string, slots: string[]): string {
  return text.replace(/__GQL_STR_(\d+)__/g, (_, i) => slots[Number(i)]);
}

type Token =
  | { kind: "punct"; value: string }
  | { kind: "word"; value: string }
  | { kind: "slot"; value: string };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i]!;
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if ("{}()[],:!@".includes(ch)) {
      // ... spread
      if (ch === "." && source.slice(i, i + 3) === "...") {
        tokens.push({ kind: "punct", value: "..." });
        i += 3;
        continue;
      }
      tokens.push({ kind: "punct", value: ch });
      i += 1;
      continue;
    }
    if (source.startsWith("...", i)) {
      tokens.push({ kind: "punct", value: "..." });
      i += 3;
      continue;
    }
    if (source.startsWith("__GQL_STR_", i)) {
      const m = source.slice(i).match(/^__GQL_STR_\d+__/);
      if (m) {
        tokens.push({ kind: "slot", value: m[0] });
        i += m[0].length;
        continue;
      }
    }
    let j = i;
    while (j < source.length && !/\s/.test(source[j]!) && !"{}()[],:!@".includes(source[j]!)) {
      if (source.startsWith("...", j)) break;
      if (source.startsWith("__GQL_STR_", j)) break;
      j += 1;
    }
    if (j > i) {
      tokens.push({ kind: "word", value: source.slice(i, j) });
      i = j;
    } else {
      i += 1;
    }
  }
  return tokens;
}

/** Pretty-print a GraphQL document (lightweight; not a full GraphQL parser). */
export function formatGraphql(
  input: string,
  indentSize = 2,
): GraphqlFormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a GraphQL query or schema to format." };
  }

  try {
    const pad = (n: number) => " ".repeat(Math.max(0, n) * indentSize);
    const { text, slots } = protectStrings(trimmed);
    const tokens = tokenize(text);

    const lines: string[] = [];
    let depth = 0;
    let i = 0;

    const peek = (offset = 0) => tokens[i + offset];
    const take = () => tokens[i++];

    while (i < tokens.length) {
      const tok = take()!;

      if (tok.kind === "punct" && tok.value === "{") {
        if (lines.length > 0) {
          lines[lines.length - 1] = `${lines[lines.length - 1]} {`;
        } else {
          lines.push(pad(depth) + "{");
        }
        depth += 1;
        continue;
      }

      if (tok.kind === "punct" && tok.value === "}") {
        depth = Math.max(0, depth - 1);
        lines.push(pad(depth) + "}");
        continue;
      }

      // Build one "field / definition" line: word(s) + optional args + optional directives
      let line = tok.kind === "punct" && tok.value === "..." ? "..." : tok.value;

      // Operation / fragment headers stay on one line: `query Name($a: T)`
      const op =
        /^(query|mutation|subscription|fragment|schema|type|input|enum|interface|union|extend|directive)$/i;
      if (tok.kind === "word" && op.test(tok.value)) {
        while (peek() && !(peek()!.kind === "punct" && peek()!.value === "{")) {
          const t = peek()!;
          if (t.kind === "punct" && t.value === "(") break;
          if (t.kind === "punct" && t.value === "@") break;
          if (t.kind === "word" || t.kind === "slot") {
            take();
            line += ` ${t.value}`;
            continue;
          }
          if (t.kind === "punct" && t.value === ":") {
            take();
            line += ":";
            if (peek() && peek()!.kind !== "punct") {
              line += ` ${take()!.value}`;
            }
            continue;
          }
          break;
        }
      }

      // Alias: name : field
      if (peek()?.kind === "punct" && peek()!.value === ":") {
        // Could be argument list elsewhere; for field args we handle "(" below.
        // For `name: Type` in schema or `alias: field`
        take(); // :
        line += ":";
        const next = peek();
        if (next && next.kind !== "punct") {
          line += ` ${take()!.value}`;
        }
      }

      // Arguments or lists
      while (peek()?.kind === "punct" && peek()!.value === "(") {
        take();
        line += "(";
        const args: string[] = [];
        let arg = "";
        let paren = 1;
        while (i < tokens.length && paren > 0) {
          const t = take()!;
          if (t.kind === "punct" && t.value === "(") {
            paren += 1;
            arg += "(";
          } else if (t.kind === "punct" && t.value === ")") {
            paren -= 1;
            if (paren === 0) break;
            arg += ")";
          } else if (t.kind === "punct" && t.value === "," && paren === 1) {
            args.push(arg.trim());
            arg = "";
          } else if (t.kind === "punct" && t.value === ":") {
            arg += ": ";
          } else {
            arg += (arg && !arg.endsWith(" ") && t.kind === "word" ? " " : "") + t.value;
          }
        }
        if (arg.trim()) args.push(arg.trim());
        line += args.join(", ") + ")";
      }

      // Directives @name(args)
      while (peek()?.kind === "punct" && peek()!.value === "@") {
        take();
        line += " @";
        if (peek()?.kind === "word") line += take()!.value;
        if (peek()?.kind === "punct" && peek()!.value === "(") {
          // reuse small inline
          take();
          line += "(";
          const args: string[] = [];
          let arg = "";
          let paren = 1;
          while (i < tokens.length && paren > 0) {
            const t = take()!;
            if (t.kind === "punct" && t.value === "(") {
              paren += 1;
              arg += "(";
            } else if (t.kind === "punct" && t.value === ")") {
              paren -= 1;
              if (paren === 0) break;
              arg += ")";
            } else if (t.kind === "punct" && t.value === "," && paren === 1) {
              args.push(arg.trim());
              arg = "";
            } else if (t.kind === "punct" && t.value === ":") {
              arg += ": ";
            } else {
              arg +=
                (arg && !arg.endsWith(" ") && t.kind === "word" ? " " : "") +
                t.value;
            }
          }
          if (arg.trim()) args.push(arg.trim());
          line += args.join(", ") + ")";
        }
      }

      // If next is `{`, attach on same line via next loop iteration
      if (peek()?.kind === "punct" && peek()!.value === "{") {
        lines.push(pad(depth) + line);
        continue;
      }

      lines.push(pad(depth) + line);
    }

    let pretty = lines.join("\n").replace(/\n{3,}/g, "\n\n");
    pretty = restore(pretty, slots);
    if (!pretty.endsWith("\n")) pretty += "\n";
    return { ok: true, text: pretty };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to format GraphQL",
    };
  }
}

/** Collapse GraphQL to a single line (strings/comments preserved). */
export function minifyGraphql(input: string): GraphqlFormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a GraphQL query or schema to minify." };
  }
  try {
    const { text, slots } = protectStrings(trimmed);
    let out = text
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t\n]+/g, " ")
      .replace(/\s*([{}()[\],:])\s*/g, "$1")
      .trim();
    out = restore(out, slots);
    return { ok: true, text: out + "\n" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to minify GraphQL",
    };
  }
}
