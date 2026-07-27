/** Lightweight JavaScript beautifier / minifier (not a full parser / prettier). */

type Protected = { text: string; slots: string[] };

function protectLiterals(
  source: string,
  options: { stripComments?: boolean } = {},
): Protected {
  const stripComments = options.stripComments === true;
  const slots: string[] = [];
  let out = "";
  let i = 0;

  const push = (raw: string) => {
    slots.push(raw);
    return `__JS_LIT_${slots.length - 1}__`;
  };

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === "/" && next === "/") {
      let j = i + 2;
      while (j < source.length && source[j] !== "\n") j += 1;
      if (!stripComments) out += push(source.slice(i, j));
      i = j;
      continue;
    }

    if (ch === "/" && next === "*") {
      let j = i + 2;
      while (
        j < source.length &&
        !(source[j] === "*" && source[j + 1] === "/")
      ) {
        j += 1;
      }
      j = Math.min(source.length, j + 2);
      if (!stripComments) out += push(source.slice(i, j));
      i = j;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === "\\") {
          j += 2;
          continue;
        }
        if (quote === "`" && source[j] === "$" && source[j + 1] === "{") {
          j += 2;
          let depth = 1;
          while (j < source.length && depth > 0) {
            if (source[j] === "{") depth += 1;
            else if (source[j] === "}") depth -= 1;
            j += 1;
          }
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

    if (ch === "/") {
      const prev = out.replace(/\s+$/, "").slice(-1);
      if (!prev || "([{,;:!&|?~=+-*%<>".includes(prev)) {
        let j = i + 1;
        let closed = false;
        while (j < source.length) {
          if (source[j] === "\\") {
            j += 2;
            continue;
          }
          if (source[j] === "\n") break;
          if (source[j] === "/") {
            j += 1;
            while (j < source.length && /[gimsuy]/.test(source[j])) j += 1;
            closed = true;
            break;
          }
          j += 1;
        }
        if (closed) {
          out += push(source.slice(i, j));
          i = j;
          continue;
        }
      }
    }

    out += ch;
    i += 1;
  }

  return { text: out, slots };
}

function restoreLiterals(text: string, slots: string[]): string {
  return text.replace(/__JS_LIT_(\d+)__/g, (_, i) => slots[Number(i)]);
}

export function formatJavascript(input: string, indentSize = 2): string {
  const pad = (n: number) => " ".repeat(Math.max(0, n) * indentSize);
  const { text, slots } = protectLiterals(input);

  const tokens: string[] = [];
  let buf = "";

  const flush = () => {
    if (buf.trim()) {
      tokens.push(buf.trim());
      buf = "";
    } else {
      buf = "";
    }
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "{" || ch === "}") {
      flush();
      tokens.push(ch);
    } else if (ch === ";") {
      buf += ch;
      flush();
    } else if (ch === "\n") {
      flush();
    } else {
      buf += ch;
    }
  }
  flush();

  const out: string[] = [];
  let depth = 0;

  for (let t = 0; t < tokens.length; t += 1) {
    const token = tokens[t].replace(/\s+/g, " ").trim();
    if (!token) continue;

    if (token === "{") {
      if (out.length > 0) {
        out[out.length - 1] += " {";
      } else {
        out.push("{");
      }
      depth += 1;
      continue;
    }

    if (token === "}") {
      depth = Math.max(0, depth - 1);
      if (
        tokens[t + 1] &&
        !/^[{};]/.test(tokens[t + 1]) &&
        tokens[t + 2] === "{"
      ) {
        const mid = tokens[t + 1].replace(/\s+/g, " ").trim();
        out.push(`${pad(depth)}} ${mid} {`);
        t += 2;
        depth += 1;
        continue;
      }
      out.push(pad(depth) + "}");
      continue;
    }

    out.push(pad(depth) + token);
  }

  let result = restoreLiterals(out.join("\n"), slots);
  result = result.replace(/\{\n\s*\}/g, "{}").trim();
  return result ? `${result}\n` : "";
}

export function minifyJavascript(
  input: string,
  options: { stripComments?: boolean } = {},
): string {
  const stripComments = options.stripComments !== false;
  const { text, slots } = protectLiterals(input, { stripComments });
  const min = text
    .replace(/\s+/g, " ")
    .replace(/\s*([{}();,=+\-*/%<>!&|?:.])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
  return restoreLiterals(min, slots);
}
