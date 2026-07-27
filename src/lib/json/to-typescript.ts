export type JsonToTsOptions = {
  /** Root type / interface name (default "Root"). */
  rootName?: string;
  /** Emit `interface` instead of `type` for objects (default true). */
  useInterface?: boolean;
  /** Prefix declarations with `export` (default true). */
  exportTypes?: boolean;
};

export type JsonToTsResult =
  | { ok: true; typescript: string }
  | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function toPascalCase(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9]+/g, " ").trim();
  if (!cleaned) return "Item";
  const parts = cleaned.split(/\s+/);
  const pascal = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  if (/^[0-9]/.test(pascal)) return `N${pascal}`;
  return pascal;
}

function safeProp(key: string): string {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return key;
  return JSON.stringify(key);
}

function uniqueName(base: string, used: Set<string>): string {
  const name = toPascalCase(base);
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  let i = 2;
  while (used.has(`${name}${i}`)) i += 1;
  const next = `${name}${i}`;
  used.add(next);
  return next;
}

type TypeNode =
  | { kind: "primitive"; text: string }
  | { kind: "array"; of: TypeNode }
  | { kind: "object"; name: string; props: Map<string, { type: TypeNode; optional: boolean }> }
  | { kind: "union"; members: TypeNode[] }
  | { kind: "literal"; text: string };

function mergeTypes(
  a: TypeNode,
  b: TypeNode,
  objectNodes: TypeNode[],
): TypeNode {
  if (a.kind === "primitive" && b.kind === "primitive" && a.text === b.text) {
    return a;
  }
  if (a.kind === "literal" && b.kind === "literal" && a.text === b.text) {
    return a;
  }
  if (a.kind === "array" && b.kind === "array") {
    return { kind: "array", of: mergeTypes(a.of, b.of, objectNodes) };
  }
  if (a.kind === "object" && b.kind === "object") {
    const keys = new Set([...a.props.keys(), ...b.props.keys()]);
    for (const key of keys) {
      const left = a.props.get(key);
      const right = b.props.get(key);
      if (left && right) {
        a.props.set(key, {
          type: mergeTypes(left.type, right.type, objectNodes),
          optional: left.optional || right.optional,
        });
      } else if (left) {
        a.props.set(key, { type: left.type, optional: true });
      } else if (right) {
        a.props.set(key, { type: right.type, optional: true });
      }
    }
    const idx = objectNodes.indexOf(b);
    if (idx >= 0) objectNodes.splice(idx, 1);
    return a;
  }

  const members = [
    ...(a.kind === "union" ? a.members : [a]),
    ...(b.kind === "union" ? b.members : [b]),
  ];
  const dedup: TypeNode[] = [];
  for (const m of members) {
    const text = typeToInline(m);
    if (!dedup.some((d) => typeToInline(d) === text)) dedup.push(m);
  }
  if (dedup.length === 1) return dedup[0]!;
  return { kind: "union", members: dedup };
}

function typeToInline(node: TypeNode): string {
  switch (node.kind) {
    case "primitive":
    case "literal":
      return node.text;
    case "array":
      return `${wrapIfNeeded(node.of)}[]`;
    case "object":
      return node.name;
    case "union":
      return node.members.map(typeToInline).join(" | ");
  }
}

function wrapIfNeeded(node: TypeNode): string {
  if (node.kind === "union") return `(${typeToInline(node)})`;
  return typeToInline(node);
}

function infer(
  value: unknown,
  nameHint: string,
  usedNames: Set<string>,
  objectNodes: TypeNode[],
): TypeNode {
  if (value === null) return { kind: "primitive", text: "null" };
  if (typeof value === "string") return { kind: "primitive", text: "string" };
  if (typeof value === "number") return { kind: "primitive", text: "number" };
  if (typeof value === "boolean") return { kind: "primitive", text: "boolean" };

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { kind: "array", of: { kind: "primitive", text: "unknown" } };
    }
    let merged = infer(value[0], `${nameHint}Item`, usedNames, objectNodes);
    for (let i = 1; i < value.length; i++) {
      merged = mergeTypes(
        merged,
        infer(value[i], `${nameHint}Item`, usedNames, objectNodes),
        objectNodes,
      );
    }
    return { kind: "array", of: merged };
  }

  if (isPlainObject(value)) {
    const name = uniqueName(nameHint, usedNames);
    const props = new Map<string, { type: TypeNode; optional: boolean }>();
    for (const [key, child] of Object.entries(value)) {
      props.set(key, {
        type: infer(child, key, usedNames, objectNodes),
        optional: false,
      });
    }
    const node: TypeNode = { kind: "object", name, props };
    objectNodes.push(node);
    return node;
  }

  return { kind: "primitive", text: "unknown" };
}

function renderObject(
  node: Extract<TypeNode, { kind: "object" }>,
  useInterface: boolean,
  exportTypes: boolean,
): string {
  const exportKw = exportTypes ? "export " : "";
  const lines: string[] = [];
  const keys = [...node.props.keys()].sort((a, b) => a.localeCompare(b));
  for (const key of keys) {
    const prop = node.props.get(key)!;
    const opt = prop.optional ? "?" : "";
    lines.push(`  ${safeProp(key)}${opt}: ${typeToInline(prop.type)};`);
  }
  if (useInterface) {
    return `${exportKw}interface ${node.name} {\n${lines.join("\n")}\n}`;
  }
  return `${exportKw}type ${node.name} = {\n${lines.join("\n")}\n};`;
}

/**
 * Convert a JSON string into TypeScript interfaces / types inferred from values.
 */
export function jsonToTypescript(
  input: string,
  options: JsonToTsOptions = {},
): JsonToTsResult {
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

  const rootName = toPascalCase(options.rootName?.trim() || "Root");
  const useInterface = options.useInterface ?? true;
  const exportTypes = options.exportTypes ?? true;
  const usedNames = new Set<string>();
  const objectNodes: TypeNode[] = [];

  const root = infer(value, rootName, usedNames, objectNodes);

  // Root may not be an object (array / primitive) — wrap or emit alias.
  const blocks: string[] = [];
  const exportKw = exportTypes ? "export " : "";

  // objectNodes are collected in discovery order (children after parents in recursion —
  // actually children first because we recurse into props before pushing? 
  // We push after building props, so children are pushed first. Reverse for parents first.
  const objects = objectNodes.filter(
    (n): n is Extract<TypeNode, { kind: "object" }> => n.kind === "object",
  );

  // Emit nested objects first (they were pushed depth-first as leaves first).
  // Unique by name order: topological — children already named; emit in reverse push order
  // so parents come after children... Actually parents are pushed after children, so
  // reverse gives parents first which is wrong for interfaces referencing children.
  // Children are pushed first, so forward order is fine (children before parents).
  const seen = new Set<string>();
  for (const obj of objects) {
    if (seen.has(obj.name)) continue;
    seen.add(obj.name);
    blocks.push(renderObject(obj, useInterface, exportTypes));
  }

  if (root.kind !== "object") {
    blocks.push(
      `${exportKw}type ${rootName} = ${typeToInline(root)};`,
    );
  }

  return { ok: true, typescript: blocks.join("\n\n") + "\n" };
}
