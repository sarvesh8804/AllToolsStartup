import { GITIGNORE_STACKS, type GitignoreStack } from "./gitignore";

export type GitignoreCategory =
  | "os"
  | "languages"
  | "frameworks"
  | "editors"
  | "devops"
  | "secrets";

export type GitignoreBuilderStack = GitignoreStack & {
  category: GitignoreCategory;
};

export type GitignorePreset = {
  id: string;
  label: string;
  description: string;
  stackIds: string[];
};

const EXTRA_STACKS: GitignoreBuilderStack[] = [
  {
    id: "linux",
    label: "Linux",
    description: "Backup and desktop leftovers",
    category: "os",
    body: `# Linux
*~
.fuse_hidden*
.directory
.Trash-*
.nfs*
`,
  },
  {
    id: "go",
    label: "Go",
    description: "Binaries, vendor, test cache",
    category: "languages",
    body: `# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
vendor/
go.work
go.work.sum
`,
  },
  {
    id: "rust",
    label: "Rust",
    description: "Cargo target directory",
    category: "languages",
    body: `# Rust
/target/
**/*.rs.bk
`,
  },
  {
    id: "java",
    label: "Java / Maven / Gradle",
    description: "Build outputs and IDE modules",
    category: "languages",
    body: `# Java
*.class
*.jar
*.war
*.ear
hs_err_pid*
.mtj.tmp/
target/
build/
.gradle/
`,
  },
  {
    id: "dotnet",
    label: ".NET",
    description: "bin/obj and user files",
    category: "languages",
    body: `# .NET
bin/
obj/
*.user
*.suo
.vs/
packages/
`,
  },
  {
    id: "ruby",
    label: "Ruby",
    description: "Bundler and coverage",
    category: "languages",
    body: `# Ruby
/.bundle/
/vendor/bundle
/log/*
/tmp/*
/coverage/
*.gem
`,
  },
  {
    id: "php",
    label: "PHP / Composer",
    description: "Vendor and caches",
    category: "languages",
    body: `# PHP
/vendor/
composer.phar
.phpunit.result.cache
.php-cs-fixer.cache
`,
  },
  {
    id: "docker",
    label: "Docker",
    description: "Compose overrides and env",
    category: "devops",
    body: `# Docker
docker-compose.override.yml
.env
*.log
`,
  },
  {
    id: "terraform",
    label: "Terraform",
    description: "State and plan files",
    category: "devops",
    body: `# Terraform
*.tfstate
*.tfstate.*
.terraform/
.terraform.lock.hcl
crash.log
*.tfvars
!*.tfvars.example
override.tf
`,
  },
  {
    id: "android",
    label: "Android",
    description: "Gradle and local properties",
    category: "frameworks",
    body: `# Android
*.apk
*.ap_
*.dex
bin/
gen/
.gradle/
local.properties
captures/
.externalNativeBuild/
`,
  },
  {
    id: "ios",
    label: "iOS / Xcode",
    description: "User data and derived data",
    category: "frameworks",
    body: `# iOS
xcuserdata/
*.xcscmblueprint
*.xccheckout
DerivedData/
*.moved-aside
*.hmap
*.ipa
*.dSYM.zip
*.dSYM
`,
  },
  {
    id: "svelte",
    label: "SvelteKit",
    description: "SvelteKit build output",
    category: "frameworks",
    body: `# SvelteKit
.svelte-kit/
build/
package/
.env
.env.*
!.env.example
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
`,
  },
  {
    id: "vite",
    label: "Vite",
    description: "Dist and Vite timestamps",
    category: "frameworks",
    body: `# Vite
dist/
dist-ssr/
*.local
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
`,
  },
];

const CATEGORY_FOR_BASE: Record<string, GitignoreCategory> = {
  macos: "os",
  windows: "os",
  node: "languages",
  nextjs: "frameworks",
  python: "languages",
  vscode: "editors",
  jetbrains: "editors",
  env: "secrets",
  logs: "devops",
};

export const GITIGNORE_BUILDER_STACKS: GitignoreBuilderStack[] = [
  ...GITIGNORE_STACKS.map((s) => ({
    ...s,
    category: CATEGORY_FOR_BASE[s.id] ?? ("devops" as GitignoreCategory),
  })),
  ...EXTRA_STACKS,
];

export const GITIGNORE_CATEGORIES: {
  id: GitignoreCategory;
  label: string;
}[] = [
  { id: "os", label: "Operating systems" },
  { id: "languages", label: "Languages" },
  { id: "frameworks", label: "Frameworks" },
  { id: "editors", label: "Editors" },
  { id: "devops", label: "DevOps & tooling" },
  { id: "secrets", label: "Secrets" },
];

export const GITIGNORE_PRESETS: GitignorePreset[] = [
  {
    id: "web-node",
    label: "Node web app",
    description: "macOS + Node + Next.js + env + logs",
    stackIds: ["macos", "node", "nextjs", "env", "logs"],
  },
  {
    id: "python-api",
    label: "Python API",
    description: "macOS + Python + env + logs + VS Code",
    stackIds: ["macos", "python", "env", "logs", "vscode"],
  },
  {
    id: "go-service",
    label: "Go service",
    description: "Linux + Go + Docker + env",
    stackIds: ["linux", "go", "docker", "env"],
  },
  {
    id: "mobile",
    label: "Mobile (Android + iOS)",
    description: "macOS + Android + iOS + JetBrains",
    stackIds: ["macos", "android", "ios", "jetbrains"],
  },
];

export type GitignoreBuilderOptions = {
  selectedIds: string[];
  /** Extra patterns, one per line. */
  customLines: string;
  /** Drop duplicate ignore patterns across stacks (default true). */
  dedupe: boolean;
};

export const DEFAULT_GITIGNORE_BUILDER_OPTIONS: GitignoreBuilderOptions = {
  selectedIds: ["macos", "node", "nextjs", "env"],
  customLines: "",
  dedupe: true,
};

function normalizePattern(line: string): string {
  return line.trim();
}

function isPatternLine(line: string): boolean {
  const t = line.trim();
  return t.length > 0 && !t.startsWith("#");
}

/** Build an advanced .gitignore from stacks + optional custom lines. */
export function buildAdvancedGitignore(
  options: GitignoreBuilderOptions,
): string {
  const selected = new Set(options.selectedIds);
  const stacks = GITIGNORE_BUILDER_STACKS.filter((s) => selected.has(s.id));
  const seen = new Set<string>();
  const sections: string[] = [];

  for (const stack of stacks) {
    const lines = stack.body.trimEnd().split("\n");
    const out: string[] = [];
    for (const line of lines) {
      if (!options.dedupe || !isPatternLine(line)) {
        out.push(line);
        continue;
      }
      const key = normalizePattern(line);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(line);
    }
    // Drop trailing empty-only sections after dedupe emptied patterns
    const meaningful = out.some((l) => l.trim().length > 0);
    if (meaningful) sections.push(out.join("\n").trimEnd());
  }

  const custom = options.customLines
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l, i, arr) => !(l === "" && i === arr.length - 1));

  if (custom.some((l) => l.trim())) {
    const customOut: string[] = ["# Custom"];
    for (const line of custom) {
      if (!line.trim()) {
        customOut.push(line);
        continue;
      }
      if (line.trim().startsWith("#")) {
        customOut.push(line);
        continue;
      }
      if (options.dedupe) {
        const key = normalizePattern(line);
        if (seen.has(key)) continue;
        seen.add(key);
      }
      customOut.push(line);
    }
    if (customOut.length > 1) sections.push(customOut.join("\n").trimEnd());
  }

  if (sections.length === 0) {
    return "# Select stacks or add custom patterns to generate a .gitignore\n";
  }
  return sections.join("\n\n") + "\n";
}

export function filterGitignoreStacks(
  query: string,
): GitignoreBuilderStack[] {
  const q = query.trim().toLowerCase();
  if (!q) return GITIGNORE_BUILDER_STACKS;
  return GITIGNORE_BUILDER_STACKS.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.id.includes(q) ||
      s.category.includes(q),
  );
}
