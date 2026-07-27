export type BadgeStyle =
  | "flat"
  | "flat-square"
  | "plastic"
  | "for-the-badge"
  | "social";

export type BadgePresetId =
  | "license"
  | "npm-version"
  | "npm-downloads"
  | "build"
  | "coverage"
  | "stars"
  | "forks"
  | "issues"
  | "last-commit"
  | "language"
  | "node"
  | "custom";

export type BadgeGeneratorInput = {
  githubUser: string;
  githubRepo: string;
  npmPackage: string;
  license: string;
  language: string;
  nodeVersion: string;
  style: BadgeStyle;
  customLabel: string;
  customMessage: string;
  customColor: string;
  presets: BadgePresetId[];
};

export const BADGE_PRESET_OPTIONS: {
  id: BadgePresetId;
  label: string;
  description: string;
}[] = [
  { id: "license", label: "License", description: "Static license badge" },
  { id: "npm-version", label: "npm version", description: "Latest package version" },
  { id: "npm-downloads", label: "npm downloads", description: "Weekly downloads" },
  { id: "build", label: "Build", description: "GitHub Actions workflow status" },
  { id: "coverage", label: "Coverage", description: "Codecov coverage" },
  { id: "stars", label: "Stars", description: "GitHub stars" },
  { id: "forks", label: "Forks", description: "GitHub forks" },
  { id: "issues", label: "Issues", description: "Open issues" },
  { id: "last-commit", label: "Last commit", description: "Latest commit date" },
  { id: "language", label: "Language", description: "Primary language badge" },
  { id: "node", label: "Node", description: "Engines / Node version" },
  { id: "custom", label: "Custom", description: "Your own label / message" },
];

export const DEFAULT_BADGE_INPUT: BadgeGeneratorInput = {
  githubUser: "you",
  githubRepo: "my-project",
  npmPackage: "my-project",
  license: "MIT",
  language: "TypeScript",
  nodeVersion: "20",
  style: "flat",
  customLabel: "made with",
  customMessage: "love",
  customColor: "ff69b4",
  presets: ["license", "npm-version", "stars", "build"],
};

function enc(s: string): string {
  return encodeURIComponent(s.replace(/-/g, "--").replace(/_/g, "__"));
}

function styleQuery(style: BadgeStyle): string {
  return style === "flat" ? "" : `?style=${style}`;
}

function staticBadge(
  label: string,
  message: string,
  color: string,
  style: BadgeStyle,
): string {
  const path = `${enc(label)}-${enc(message)}-${enc(color)}`;
  return `https://img.shields.io/badge/${path}${styleQuery(style)}`;
}

type BuiltBadge = { alt: string; image: string; link?: string };

function buildOne(
  id: BadgePresetId,
  input: BadgeGeneratorInput,
): BuiltBadge | null {
  const { githubUser: user, githubRepo: repo, style } = input;
  const gh = `${user}/${repo}`;
  const sq = styleQuery(style);

  switch (id) {
    case "license":
      return {
        alt: "License",
        image: staticBadge("license", input.license || "MIT", "blue", style),
        link: input.license
          ? `https://opensource.org/licenses/${encodeURIComponent(input.license)}`
          : undefined,
      };
    case "npm-version":
      if (!input.npmPackage.trim()) return null;
      return {
        alt: "npm version",
        image: `https://img.shields.io/npm/v/${encodeURIComponent(input.npmPackage.trim())}${sq}`,
        link: `https://www.npmjs.com/package/${encodeURIComponent(input.npmPackage.trim())}`,
      };
    case "npm-downloads":
      if (!input.npmPackage.trim()) return null;
      return {
        alt: "npm downloads",
        image: `https://img.shields.io/npm/dw/${encodeURIComponent(input.npmPackage.trim())}${sq}`,
        link: `https://www.npmjs.com/package/${encodeURIComponent(input.npmPackage.trim())}`,
      };
    case "build":
      if (!user.trim() || !repo.trim()) return null;
      {
        const params = new URLSearchParams({ branch: "main" });
        if (style !== "flat") params.set("style", style);
        return {
          alt: "Build",
          image: `https://img.shields.io/github/actions/workflow/status/${gh}/ci.yml?${params.toString()}`,
          link: `https://github.com/${gh}/actions`,
        };
      }
    case "coverage":
      if (!user.trim() || !repo.trim()) return null;
      return {
        alt: "Coverage",
        image: `https://img.shields.io/codecov/c/github/${gh}${sq}`,
        link: `https://codecov.io/gh/${gh}`,
      };
    case "stars":
      if (!user.trim() || !repo.trim()) return null;
      return {
        alt: "Stars",
        image: `https://img.shields.io/github/stars/${gh}${sq}`,
        link: `https://github.com/${gh}/stargazers`,
      };
    case "forks":
      if (!user.trim() || !repo.trim()) return null;
      return {
        alt: "Forks",
        image: `https://img.shields.io/github/forks/${gh}${sq}`,
        link: `https://github.com/${gh}/network/members`,
      };
    case "issues":
      if (!user.trim() || !repo.trim()) return null;
      return {
        alt: "Issues",
        image: `https://img.shields.io/github/issues/${gh}${sq}`,
        link: `https://github.com/${gh}/issues`,
      };
    case "last-commit":
      if (!user.trim() || !repo.trim()) return null;
      return {
        alt: "Last commit",
        image: `https://img.shields.io/github/last-commit/${gh}${sq}`,
        link: `https://github.com/${gh}/commits`,
      };
    case "language":
      return {
        alt: input.language || "Language",
        image: staticBadge(
          "language",
          input.language || "TypeScript",
          "3178c6",
          style,
        ),
      };
    case "node":
      return {
        alt: "Node",
        image: staticBadge("node", `>=${input.nodeVersion || "18"}`, "339933", style),
      };
    case "custom": {
      const label = input.customLabel.trim() || "badge";
      const message = input.customMessage.trim() || "custom";
      const color = (input.customColor.trim() || "blue").replace(/^#/, "");
      return {
        alt: `${label}: ${message}`,
        image: staticBadge(label, message, color, style),
      };
    }
    default:
      return null;
  }
}

function toMarkdown(b: BuiltBadge): string {
  const img = `![${b.alt}](${b.image})`;
  return b.link ? `[${img}](${b.link})` : img;
}

export function buildReadmeBadges(input: BadgeGeneratorInput): {
  markdown: string;
  badges: BuiltBadge[];
} {
  const badges = input.presets
    .map((id) => buildOne(id, input))
    .filter((b): b is BuiltBadge => Boolean(b));

  return {
    badges,
    markdown: badges.map(toMarkdown).join("\n") + (badges.length ? "\n" : ""),
  };
}
