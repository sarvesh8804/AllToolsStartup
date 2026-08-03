export type EnvParseResult =
  | { ok: true; data: Record<string, string>; format: "env" }
  | { ok: false; error: string };

export type IniParseResult =
  | { ok: true; data: Record<string, Record<string, string>>; format: "ini" }
  | { ok: false; error: string };

export type IniEnvFormat = "env" | "ini" | "json";

export type IniEnvConvertResult =
  | { ok: true; output: string; format: IniEnvFormat }
  | { ok: false; error: string };

export const SAMPLE_ENV = `APP_NAME=Forge
PORT=3000
DEBUG=true
# comment line
DATABASE_URL="postgres://localhost/forge"
`;

export const SAMPLE_INI = `[app]
name = Forge
port = 3000

[database]
url = postgres://localhost/forge
`;

/** Parse dotenv-style KEY=VALUE lines. */
export function parseEnv(input: string): EnvParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste .env content to parse." };
  }

  const data: Record<string, string> = {};
  const lines = trimmed.split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq <= 0) {
      return { ok: false, error: `Invalid env line: ${line}` };
    }

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { ok: true, data, format: "env" };
}

/** Parse INI sections and key=value pairs. */
export function parseIni(input: string): IniParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste INI content to parse." };
  }

  const data: Record<string, Record<string, string>> = {};
  let section = "default";

  for (const raw of trimmed.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) continue;

    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1]!.trim() || "default";
      if (!data[section]) data[section] = {};
      continue;
    }

    const eq = line.indexOf("=");
    if (eq <= 0) {
      return { ok: false, error: `Invalid INI line: ${line}` };
    }

    if (!data[section]) data[section] = {};
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    data[section][key] = value;
  }

  return { ok: true, data, format: "ini" };
}

export function envToText(data: Record<string, string>): string {
  return `${Object.entries(data)
    .map(([key, value]) => {
      const needsQuotes = /[\s#"'=]/.test(value);
      return `${key}=${needsQuotes ? JSON.stringify(value) : value}`;
    })
    .join("\n")}\n`;
}

export function iniToText(data: Record<string, Record<string, string>>): string {
  const sections = Object.entries(data);
  return `${sections
    .map(([section, values]) => {
      const header = section === "default" ? "" : `[${section}]\n`;
      const body = Object.entries(values)
        .map(([key, value]) => `${key} = ${value}`)
        .join("\n");
      return `${header}${body}`.trimEnd();
    })
    .filter(Boolean)
    .join("\n\n")}\n`;
}

/** Convert between env, ini, and json representations. */
export function convertIniEnv(
  input: string,
  from: IniEnvFormat,
  to: IniEnvFormat,
): IniEnvConvertResult {
  if (from === to) {
    return { ok: true, output: input.endsWith("\n") ? input : `${input}\n`, format: to };
  }

  let parsed: unknown;
  if (from === "env") {
    const result = parseEnv(input);
    if (!result.ok) return result;
    parsed = result.data;
  } else if (from === "ini") {
    const result = parseIni(input);
    if (!result.ok) return result;
    parsed = result.data;
  } else {
    try {
      parsed = JSON.parse(input);
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Invalid JSON",
      };
    }
  }

  if (to === "json") {
    return {
      ok: true,
      output: `${JSON.stringify(parsed, null, 2)}\n`,
      format: "json",
    };
  }

  if (to === "env") {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "JSON must be a flat object for .env output." };
    }
    const flat = parsed as Record<string, string>;
    return { ok: true, output: envToText(flat), format: "env" };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "JSON must be an object of sections for INI output." };
  }
  const sections: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      sections[key] = Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [
          k,
          String(v ?? ""),
        ]),
      );
    } else {
      if (!sections.default) sections.default = {};
      sections.default[key] = String(value ?? "");
    }
  }
  return { ok: true, output: iniToText(sections), format: "ini" };
}
