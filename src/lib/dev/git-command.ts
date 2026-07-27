export type GitCommandField = {
  key: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
};

export type GitCommandTemplate = {
  id: string;
  category: string;
  name: string;
  description: string;
  /** Use <fieldKey> placeholders matching fields[].key */
  template: string;
  fields: GitCommandField[];
  dangerous?: boolean;
};

export const GIT_COMMAND_TEMPLATES: GitCommandTemplate[] = [
  {
    id: "clone",
    category: "Start",
    name: "Clone repository",
    description: "Copy a remote repository to a local folder.",
    template: "git clone <url> <directory>",
    fields: [
      { key: "url", label: "Remote URL", placeholder: "https://github.com/org/repo.git" },
      {
        key: "directory",
        label: "Directory (optional)",
        placeholder: "leave empty for default",
        defaultValue: "",
      },
    ],
  },
  {
    id: "init",
    category: "Start",
    name: "Initialize repository",
    description: "Create a new Git repo in the current directory.",
    template: "git init",
    fields: [],
  },
  {
    id: "add-file",
    category: "Stage & commit",
    name: "Stage file",
    description: "Add a path to the index.",
    template: "git add <path>",
    fields: [
      { key: "path", label: "Path", placeholder: "src/app.ts", defaultValue: "." },
    ],
  },
  {
    id: "commit",
    category: "Stage & commit",
    name: "Commit",
    description: "Record staged changes with a message.",
    template: 'git commit -m "<message>"',
    fields: [
      {
        key: "message",
        label: "Message",
        placeholder: "Describe the change",
        defaultValue: "Update",
      },
    ],
  },
  {
    id: "status",
    category: "Stage & commit",
    name: "Status",
    description: "Show working tree status.",
    template: "git status",
    fields: [],
  },
  {
    id: "switch",
    category: "Branch",
    name: "Switch branch",
    description: "Move HEAD to an existing branch.",
    template: "git switch <branch>",
    fields: [
      { key: "branch", label: "Branch", placeholder: "main", defaultValue: "main" },
    ],
  },
  {
    id: "switch-create",
    category: "Branch",
    name: "Create & switch",
    description: "Create a branch and switch to it.",
    template: "git switch -c <branch>",
    fields: [
      {
        key: "branch",
        label: "New branch",
        placeholder: "feature/login",
        defaultValue: "feature/my-change",
      },
    ],
  },
  {
    id: "push-upstream",
    category: "Remote",
    name: "Push with upstream",
    description: "Publish a branch and set tracking.",
    template: "git push -u <remote> <branch>",
    fields: [
      { key: "remote", label: "Remote", placeholder: "origin", defaultValue: "origin" },
      { key: "branch", label: "Branch", placeholder: "main", defaultValue: "main" },
    ],
  },
  {
    id: "pull",
    category: "Remote",
    name: "Pull",
    description: "Fetch and integrate remote changes.",
    template: "git pull <remote> <branch>",
    fields: [
      { key: "remote", label: "Remote", placeholder: "origin", defaultValue: "origin" },
      { key: "branch", label: "Branch", placeholder: "main", defaultValue: "main" },
    ],
  },
  {
    id: "fetch",
    category: "Remote",
    name: "Fetch",
    description: "Download remote refs without merging.",
    template: "git fetch <remote>",
    fields: [
      { key: "remote", label: "Remote", placeholder: "origin", defaultValue: "origin" },
    ],
  },
  {
    id: "log",
    category: "History",
    name: "Compact log",
    description: "One-line commit history.",
    template: "git log --oneline -n <count>",
    fields: [
      { key: "count", label: "Count", placeholder: "20", defaultValue: "20" },
    ],
  },
  {
    id: "diff",
    category: "History",
    name: "Diff path",
    description: "Show unstaged changes for a path.",
    template: "git diff -- <path>",
    fields: [
      { key: "path", label: "Path", placeholder: "src/", defaultValue: "." },
    ],
  },
  {
    id: "stash",
    category: "Undo",
    name: "Stash",
    description: "Shelf local changes temporarily.",
    template: "git stash push -m \"<message>\"",
    fields: [
      {
        key: "message",
        label: "Stash message",
        placeholder: "WIP",
        defaultValue: "WIP",
      },
    ],
  },
  {
    id: "restore",
    category: "Undo",
    name: "Discard file changes",
    description: "Restore a path to HEAD. Destructive.",
    template: "git restore <path>",
    fields: [
      { key: "path", label: "Path", placeholder: "file.ts" },
    ],
    dangerous: true,
  },
  {
    id: "reset-soft",
    category: "Undo",
    name: "Undo last commit (keep staged)",
    description: "Move HEAD back one commit; keep changes staged.",
    template: "git reset --soft HEAD~<n>",
    fields: [
      { key: "n", label: "Commits", placeholder: "1", defaultValue: "1" },
    ],
    dangerous: true,
  },
  {
    id: "merge",
    category: "Integrate",
    name: "Merge branch",
    description: "Merge another branch into the current one.",
    template: "git merge <branch>",
    fields: [
      { key: "branch", label: "Branch", placeholder: "feature/x" },
    ],
  },
  {
    id: "rebase",
    category: "Integrate",
    name: "Rebase onto",
    description: "Replay commits onto another base.",
    template: "git rebase <branch>",
    fields: [
      { key: "branch", label: "Onto branch", placeholder: "main", defaultValue: "main" },
    ],
    dangerous: true,
  },
  {
    id: "cherry-pick",
    category: "Integrate",
    name: "Cherry-pick",
    description: "Apply a single commit onto the current branch.",
    template: "git cherry-pick <commit>",
    fields: [
      { key: "commit", label: "Commit", placeholder: "abc1234" },
    ],
  },
];

export function defaultFieldValues(
  template: GitCommandTemplate,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of template.fields) {
    values[field.key] = field.defaultValue ?? "";
  }
  return values;
}

/** Fill <key> placeholders; drop empty optional trailing tokens carefully. */
export function buildGitCommand(
  template: string,
  values: Record<string, string>,
): string {
  let out = template;
  const keys = Object.keys(values);
  for (const key of keys) {
    const re = new RegExp(`<${key}>`, "g");
    out = out.replace(re, values[key] ?? "");
  }
  // Clean empty quoted strings and extra spaces
  out = out
    .replace(/""/g, '""')
    .replace(/\s{2,}/g, " ")
    .replace(/\s+$/g, "")
    .trim();

  // Remove trailing empty optional directory after clone
  out = out.replace(/\bgit clone (\S+)\s*$/i, "git clone $1");
  // If directory was empty: "git clone url " → already trimmed
  out = out.replace(/\bgit clone (\S+)\s+$/i, "git clone $1");

  return out;
}

export function filterGitCommandTemplates(
  query: string,
  templates: GitCommandTemplate[] = GIT_COMMAND_TEMPLATES,
): GitCommandTemplate[] {
  const q = query.trim().toLowerCase();
  if (!q) return templates;
  return templates.filter((t) => {
    const hay = [t.name, t.description, t.template, t.category, t.id]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function gitCommandCategories(
  templates: GitCommandTemplate[] = GIT_COMMAND_TEMPLATES,
): string[] {
  return [...new Set(templates.map((t) => t.category))];
}
