export type JsonToXmlOptions = {
  /** Root element when JSON is not a single-key object (default "root"). */
  rootName?: string;
  /** Pretty-print with indentation (default true). */
  pretty?: boolean;
  /** Spaces per indent level (default 2). */
  indentSize?: number;
  /** XML declaration (default true). */
  declaration?: boolean;
};

export type JsonToXmlResult =
  | { ok: true; xml: string }
  | { ok: false; error: string };

export type XmlToJsonOptions = {
  /** Pretty JSON indent (default 2). */
  indent?: number;
};

export type XmlToJsonResult =
  | { ok: true; json: string; value: unknown }
  | { ok: false; error: string };

const ATTR_PREFIX = "@";
const TEXT_KEY = "#text";

function isName(name: string): boolean {
  return /^[A-Za-z_][\w.-]*$/.test(name);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function primitiveToText(value: unknown): string {
  if (value === null) return "";
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  return String(value);
}

function elementName(raw: string, fallback: string): string {
  return isName(raw) ? raw : fallback;
}

function serializeNode(
  name: string,
  value: unknown,
  depth: number,
  pretty: boolean,
  indentSize: number,
): string {
  const pad = pretty ? " ".repeat(depth * indentSize) : "";
  const nl = pretty ? "\n" : "";

  if (value === null || typeof value !== "object") {
    const text = escapeXml(primitiveToText(value));
    return `${pad}<${name}>${text}</${name}>${nl}`;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => serializeNode(name, item, depth, pretty, indentSize))
      .join("");
  }

  const obj = value as Record<string, unknown>;
  const attrs: string[] = [];
  const children: string[] = [];
  let textContent: string | null = null;

  for (const [key, child] of Object.entries(obj)) {
    if (key.startsWith(ATTR_PREFIX)) {
      const attrName = key.slice(1);
      if (!isName(attrName)) continue;
      attrs.push(` ${attrName}="${escapeXml(primitiveToText(child))}"`);
    } else if (key === TEXT_KEY) {
      textContent = escapeXml(primitiveToText(child));
    } else {
      const childName = elementName(key, "item");
      children.push(
        serializeNode(childName, child, depth + 1, pretty, indentSize),
      );
    }
  }

  const attrStr = attrs.join("");
  if (!children.length && textContent === null) {
    return `${pad}<${name}${attrStr} />${nl}`;
  }
  if (!children.length && textContent !== null) {
    return `${pad}<${name}${attrStr}>${textContent}</${name}>${nl}`;
  }

  const inner = children.join("");
  const textLine =
    textContent !== null && textContent.length
      ? `${pretty ? " ".repeat((depth + 1) * indentSize) : ""}${textContent}${nl}`
      : "";
  return `${pad}<${name}${attrStr}>${nl}${textLine}${inner}${pad}</${name}>${nl}`;
}

export function jsonToXml(
  input: string,
  options: JsonToXmlOptions = {},
): JsonToXmlResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Paste JSON to convert." };

  let value: unknown;
  try {
    value = JSON.parse(trimmed);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }

  const pretty = options.pretty !== false;
  const indentSize = options.indentSize ?? 2;
  const rootName = elementName(options.rootName ?? "root", "root");
  const declaration =
    options.declaration !== false
      ? `<?xml version="1.0" encoding="UTF-8"?>${pretty ? "\n" : ""}`
      : "";

  try {
    let body: string;
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const keys = Object.keys(value as object);
      if (
        keys.length === 1 &&
        !keys[0]!.startsWith(ATTR_PREFIX) &&
        keys[0] !== TEXT_KEY &&
        isName(keys[0]!)
      ) {
        const only = keys[0]!;
        body = serializeNode(
          only,
          (value as Record<string, unknown>)[only],
          0,
          pretty,
          indentSize,
        );
      } else {
        body = serializeNode(rootName, value, 0, pretty, indentSize);
      }
    } else if (Array.isArray(value)) {
      body = serializeNode(
        rootName,
        { item: value },
        0,
        pretty,
        indentSize,
      );
    } else {
      body = serializeNode(rootName, value, 0, pretty, indentSize);
    }

    return { ok: true, xml: declaration + body };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to convert to XML",
    };
  }
}

type XmlNode = {
  name: string;
  attributes: Record<string, string>;
  children: XmlNode[];
  text: string;
};

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re =
    /([A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    attrs[m[1]!] = m[2] ?? m[3] ?? "";
  }
  return attrs;
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&amp;/g, "&");
}

function parseXmlDocument(xml: string): XmlNode {
  const cleaned = xml
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  const stack: XmlNode[] = [];
  let root: XmlNode | null = null;
  let i = 0;

  while (i < cleaned.length) {
    if (cleaned[i] === "<") {
      if (cleaned.startsWith("</", i)) {
        const end = cleaned.indexOf(">", i);
        if (end === -1) throw new Error("Unclosed closing tag.");
        const name = cleaned.slice(i + 2, end).trim().split(/\s/)[0]!;
        const node = stack.pop();
        if (!node || node.name !== name) {
          throw new Error(`Mismatched closing tag </${name}>.`);
        }
        if (stack.length === 0) root = node;
        else stack[stack.length - 1]!.children.push(node);
        i = end + 1;
        continue;
      }

      const end = cleaned.indexOf(">", i);
      if (end === -1) throw new Error("Unclosed tag.");
      const raw = cleaned.slice(i + 1, end);
      const selfClosing = raw.endsWith("/");
      const body = selfClosing ? raw.slice(0, -1).trim() : raw.trim();
      const space = body.search(/\s/);
      const name = space === -1 ? body : body.slice(0, space);
      const attrRaw = space === -1 ? "" : body.slice(space);
      if (!isName(name.split(":")[0]!) && !/^[A-Za-z_][\w:.-]*$/.test(name)) {
        throw new Error(`Invalid element name: ${name}`);
      }
      const node: XmlNode = {
        name,
        attributes: parseAttributes(attrRaw),
        children: [],
        text: "",
      };
      if (selfClosing) {
        if (stack.length === 0) root = node;
        else stack[stack.length - 1]!.children.push(node);
      } else {
        stack.push(node);
      }
      i = end + 1;
      continue;
    }

    const next = cleaned.indexOf("<", i);
    const text = cleaned.slice(i, next === -1 ? cleaned.length : next);
    const decoded = decodeXmlEntities(text);
    if (stack.length && decoded.trim()) {
      stack[stack.length - 1]!.text += decoded;
    }
    i = next === -1 ? cleaned.length : next;
  }

  if (stack.length) throw new Error("Unclosed elements in XML.");
  if (!root) throw new Error("No root element found.");
  return root;
}

function nodeToJson(node: XmlNode): unknown {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node.attributes)) {
    obj[`${ATTR_PREFIX}${k}`] = v;
  }

  const grouped = new Map<string, unknown[]>();
  for (const child of node.children) {
    const value = nodeToJson(child);
    const list = grouped.get(child.name) ?? [];
    list.push(value);
    grouped.set(child.name, list);
  }
  for (const [name, list] of grouped) {
    obj[name] = list.length === 1 ? list[0] : list;
  }

  const text = node.text.trim();
  if (text) {
    if (!node.children.length && !Object.keys(node.attributes).length) {
      return coerceScalar(text);
    }
    obj[TEXT_KEY] = coerceScalar(text);
  }

  if (
    !Object.keys(obj).length &&
    !node.children.length &&
    !Object.keys(node.attributes).length
  ) {
    return "";
  }

  // Empty element
  if (!Object.keys(obj).length) return "";

  return obj;
}

function coerceScalar(text: string): string | number | boolean {
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) {
    const n = Number(text);
    if (Number.isFinite(n)) return n;
  }
  return text;
}

export function xmlToJson(
  input: string,
  options: XmlToJsonOptions = {},
): XmlToJsonResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Paste XML to convert." };

  try {
    const root = parseXmlDocument(trimmed);
    const value = { [root.name]: nodeToJson(root) };
    const indent = options.indent ?? 2;
    return {
      ok: true,
      value,
      json: JSON.stringify(value, null, indent) + "\n",
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid XML",
    };
  }
}
