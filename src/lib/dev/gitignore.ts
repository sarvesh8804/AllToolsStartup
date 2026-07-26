export type GitignoreStack = {
  id: string;
  label: string;
  description: string;
  body: string;
};

export const GITIGNORE_STACKS: GitignoreStack[] = [
  {
    id: "macos",
    label: "macOS",
    description: "Finder metadata and DS_Store",
    body: `# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
`,
  },
  {
    id: "windows",
    label: "Windows",
    description: "Thumbs.db and desktop.ini",
    body: `# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/
*.lnk
`,
  },
  {
    id: "node",
    label: "Node",
    description: "npm / yarn / pnpm artifacts",
    body: `# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.npm
.yarn/
.pnp.*
`,
  },
  {
    id: "nextjs",
    label: "Next.js",
    description: "Next build and env files",
    body: `# Next.js
.next/
out/
.vercel
*.tsbuildinfo
next-env.d.ts
.env*.local
`,
  },
  {
    id: "python",
    label: "Python",
    description: "venv, bytecode, pytest cache",
    body: `# Python
__pycache__/
*.py[cod]
*$py.class
.Python
.venv/
venv/
env/
.env
.pytest_cache/
.mypy_cache/
.ruff_cache/
dist/
build/
*.egg-info/
`,
  },
  {
    id: "vscode",
    label: "VS Code",
    description: "Editor settings (keep shared configs if you want)",
    body: `# VS Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
*.code-workspace
`,
  },
  {
    id: "jetbrains",
    label: "JetBrains",
    description: "IntelliJ / WebStorm project files",
    body: `# JetBrains
.idea/
*.iml
*.iws
*.ipr
`,
  },
  {
    id: "env",
    label: "Secrets / env",
    description: "Environment and credential files",
    body: `# Env & secrets
.env
.env.*
!.env.example
*.pem
*.key
credentials.json
`,
  },
  {
    id: "logs",
    label: "Logs & coverage",
    description: "Log files and coverage reports",
    body: `# Logs & coverage
logs/
*.log
coverage/
.nyc_output/
`,
  },
];

export function buildGitignore(selectedIds: string[]): string {
  const selected = new Set(selectedIds);
  const parts = GITIGNORE_STACKS.filter((s) => selected.has(s.id)).map(
    (s) => s.body.trimEnd(),
  );
  if (parts.length === 0) {
    return "# Select stacks above to generate a .gitignore\n";
  }
  return parts.join("\n\n") + "\n";
}
