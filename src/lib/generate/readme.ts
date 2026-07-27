export type ReadmeSectionId =
  | "badges"
  | "description"
  | "features"
  | "install"
  | "usage"
  | "api"
  | "contributing"
  | "license"
  | "author";

export type ReadmeInput = {
  title: string;
  tagline: string;
  badgesMarkdown: string;
  description: string;
  features: string;
  install: string;
  usage: string;
  api: string;
  contributing: string;
  license: string;
  author: string;
  repoUrl: string;
  sections: ReadmeSectionId[];
};

export const README_SECTION_OPTIONS: {
  id: ReadmeSectionId;
  label: string;
}[] = [
  { id: "badges", label: "Badges" },
  { id: "description", label: "Description" },
  { id: "features", label: "Features" },
  { id: "install", label: "Installation" },
  { id: "usage", label: "Usage" },
  { id: "api", label: "API" },
  { id: "contributing", label: "Contributing" },
  { id: "license", label: "License" },
  { id: "author", label: "Author" },
];

export const DEFAULT_README_INPUT: ReadmeInput = {
  title: "my-project",
  tagline: "A short one-line pitch for your project.",
  badgesMarkdown: "",
  description:
    "Explain what the project does, who it is for, and why it exists.",
  features: "Fast and local\nEasy to configure\nWell documented",
  install: "npm install my-project",
  usage: `import { greet } from "my-project";

console.log(greet("world"));`,
  api: "Document public functions, CLI flags, or endpoints here.",
  contributing:
    "Issues and pull requests are welcome. Please open an issue before large changes.",
  license: "MIT",
  author: "Your Name",
  repoUrl: "https://github.com/you/my-project",
  sections: [
    "badges",
    "description",
    "features",
    "install",
    "usage",
    "api",
    "contributing",
    "license",
    "author",
  ],
};

function bulletsFromLines(text: string): string {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("- ") || l.startsWith("* ") ? l : `- ${l}`))
    .join("\n");
}

function fence(lang: string, code: string): string {
  const body = code.replace(/\n+$/, "");
  return `\`\`\`${lang}\n${body}\n\`\`\``;
}

function has(sections: ReadmeSectionId[], id: ReadmeSectionId): boolean {
  return sections.includes(id);
}

export function buildReadme(input: ReadmeInput): string {
  const title = input.title.trim() || "Untitled";
  const parts: string[] = [`# ${title}`];

  const tagline = input.tagline.trim();
  if (tagline) parts.push("", tagline);

  if (has(input.sections, "badges") && input.badgesMarkdown.trim()) {
    parts.push("", input.badgesMarkdown.trim());
  }

  if (has(input.sections, "description") && input.description.trim()) {
    parts.push("", "## Description", "", input.description.trim());
  }

  if (has(input.sections, "features") && input.features.trim()) {
    parts.push("", "## Features", "", bulletsFromLines(input.features));
  }

  if (has(input.sections, "install") && input.install.trim()) {
    const install = input.install.trim();
    const looksLikeCode = !install.includes("\n## ") && install.length < 500;
    parts.push(
      "",
      "## Installation",
      "",
      looksLikeCode ? fence("bash", install) : install,
    );
  }

  if (has(input.sections, "usage") && input.usage.trim()) {
    const usage = input.usage.trim();
    const lang = usage.includes("import ") || usage.includes("require(")
      ? "js"
      : "bash";
    parts.push("", "## Usage", "", fence(lang, usage));
  }

  if (has(input.sections, "api") && input.api.trim()) {
    parts.push("", "## API", "", input.api.trim());
  }

  if (has(input.sections, "contributing") && input.contributing.trim()) {
    parts.push("", "## Contributing", "", input.contributing.trim());
  }

  if (has(input.sections, "license") && input.license.trim()) {
    parts.push(
      "",
      "## License",
      "",
      `Released under the **${input.license.trim()}** License.`,
    );
  }

  if (has(input.sections, "author")) {
    const author = input.author.trim();
    const repo = input.repoUrl.trim();
    if (author || repo) {
      parts.push("", "## Author");
      if (author) parts.push("", author);
      if (repo) parts.push("", `[Repository](${repo})`);
    }
  }

  return parts.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}
