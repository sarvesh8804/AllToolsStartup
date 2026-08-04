export type JsonTreeNode = {
  key: string;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  value?: string;
  children?: JsonTreeNode[];
};

export type JsonTreeResult =
  | { ok: true; tree: JsonTreeNode; formatted: string; nodeCount: number }
  | { ok: false; error: string };

function typeOfJson(value: unknown): JsonTreeNode["type"] {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  return "boolean";
}

function buildNode(key: string, value: unknown): JsonTreeNode {
  const type = typeOfJson(value);
  if (type === "object") {
    const record = value as Record<string, unknown>;
    return {
      key,
      type,
      children: Object.entries(record).map(([k, v]) => buildNode(k, v)),
    };
  }
  if (type === "array") {
    const arr = value as unknown[];
    return {
      key,
      type,
      children: arr.map((item, index) => buildNode(String(index), item)),
    };
  }
  return {
    key,
    type,
    value:
      type === "string"
        ? JSON.stringify(value)
        : type === "null"
          ? "null"
          : String(value),
  };
}

function countNodes(node: JsonTreeNode): number {
  if (!node.children) return 1;
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

/** Parse JSON and build a tree model plus pretty-printed text. */
export function buildJsonTree(
  input: string,
  spaces = 2,
): JsonTreeResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON to format." };
  }
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const tree = buildNode("root", parsed);
    const formatted = `${JSON.stringify(parsed, null, spaces)}\n`;
    return {
      ok: true,
      tree,
      formatted,
      nodeCount: countNodes(tree),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}

export const SAMPLE_JSON_TREE = '{"name":"Forge","tags":["tools","local"],"meta":{"v":1}}';
