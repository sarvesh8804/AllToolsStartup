export type JsonValidation =
  | { ok: true; message: string }
  | { ok: false; message: string; line?: number; column?: number };

export function validateJson(raw: string): JsonValidation {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Paste JSON to validate." };
  }
  try {
    JSON.parse(trimmed);
    return { ok: true, message: "Valid JSON." };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    const match = /position\s+(\d+)/i.exec(message);
    if (match) {
      const pos = Number(match[1]);
      const before = trimmed.slice(0, pos);
      const line = before.split("\n").length;
      const column = before.length - before.lastIndexOf("\n");
      return { ok: false, message, line, column };
    }
    return { ok: false, message };
  }
}
