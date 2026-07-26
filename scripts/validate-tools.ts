#!/usr/bin/env tsx
import { readdirSync, readFileSync } from "fs";
import path from "path";
import {
  toolDefinitionSchema,
} from "../src/lib/tools/schema";
import { assertRegistryValid } from "../src/lib/tools/registry";

const TOOLS_DIR = path.join(process.cwd(), "content/tools");

function main() {
  const files = readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".json"));
  const tools = files.map((file) => {
    const raw = readFileSync(path.join(TOOLS_DIR, file), "utf8");
    const json = JSON.parse(raw);
    const parsed = toolDefinitionSchema.safeParse(json);
    if (!parsed.success) {
      console.error(`Invalid tool file: ${file}`);
      console.error(parsed.error.format());
      process.exit(1);
    }
    const expected = `${parsed.data.family}__${parsed.data.slug}.json`;
    // Allow either slug.json or family__slug.json
    if (file !== `${parsed.data.slug}.json` && file !== expected) {
      console.warn(
        `Warning: ${file} does not match slug naming (${parsed.data.slug}.json).`,
      );
    }
    return parsed.data;
  });

  assertRegistryValid(tools);
  const shipped = tools.filter((t) => t.status === "shipped").length;
  console.log(
    `✓ Validated ${tools.length} tools (${shipped} shipped, ${tools.length - shipped} planned/deprecated)`,
  );
}

main();
