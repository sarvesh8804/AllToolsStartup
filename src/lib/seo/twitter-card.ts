export type TwitterCardType =
  | "summary"
  | "summary_large_image"
  | "player"
  | "app";

export type TwitterCardInput = {
  card: TwitterCardType;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  site: string;
  creator: string;
  url: string;
  /** Player card */
  playerUrl: string;
  playerWidth: string;
  playerHeight: string;
  /** App card */
  appNameIphone: string;
  appIdIphone: string;
  appNameGoogleplay: string;
  appIdGoogleplay: string;
};

export type TwitterCardOutput = {
  html: string;
  warnings: string[];
};

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function nameMeta(name: string, content: string): string {
  return `<meta name="${name}" content="${escapeAttr(content)}" />`;
}

function handle(raw: string): string {
  const t = raw.trim().replace(/^@/, "");
  return t ? `@${t}` : "";
}

export function buildTwitterCardHtml(
  input: TwitterCardInput,
): TwitterCardOutput {
  const title = input.title.trim();
  const description = input.description.trim();
  const imageUrl = input.imageUrl.trim();
  const imageAlt = input.imageAlt.trim();
  const site = handle(input.site);
  const creator = handle(input.creator);
  const url = input.url.trim();
  const playerUrl = input.playerUrl.trim();
  const playerWidth = input.playerWidth.trim();
  const playerHeight = input.playerHeight.trim();

  const warnings: string[] = [];
  if (!title) warnings.push("Add twitter:title for useful previews.");
  if (!description) {
    warnings.push("Add twitter:description for richer cards.");
  }
  if (description.length > 200) {
    warnings.push("Description is long — X often truncates around ~200 chars.");
  }
  if (
    (input.card === "summary" || input.card === "summary_large_image") &&
    !imageUrl
  ) {
    warnings.push("Add twitter:image (absolute HTTPS URL recommended).");
  } else if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    warnings.push("twitter:image should be an absolute URL (https://…).");
  }
  if (input.card === "player" && !playerUrl) {
    warnings.push("Player cards need twitter:player (HTTPS iframe URL).");
  }
  if (input.card === "app") {
    if (!input.appIdIphone.trim() && !input.appIdGoogleplay.trim()) {
      warnings.push("App cards usually need at least one store app id.");
    }
  }

  const lines: string[] = [nameMeta("twitter:card", input.card)];
  if (site) lines.push(nameMeta("twitter:site", site));
  if (creator) lines.push(nameMeta("twitter:creator", creator));
  if (title) lines.push(nameMeta("twitter:title", title));
  if (description) lines.push(nameMeta("twitter:description", description));
  if (imageUrl) {
    lines.push(nameMeta("twitter:image", imageUrl));
    if (imageAlt) lines.push(nameMeta("twitter:image:alt", imageAlt));
  }
  if (url) lines.push(nameMeta("twitter:url", url));

  if (input.card === "player") {
    if (playerUrl) lines.push(nameMeta("twitter:player", playerUrl));
    if (playerWidth) lines.push(nameMeta("twitter:player:width", playerWidth));
    if (playerHeight) {
      lines.push(nameMeta("twitter:player:height", playerHeight));
    }
  }

  if (input.card === "app") {
    const iphoneName = input.appNameIphone.trim();
    const iphoneId = input.appIdIphone.trim();
    const gpName = input.appNameGoogleplay.trim();
    const gpId = input.appIdGoogleplay.trim();
    if (iphoneName) lines.push(nameMeta("twitter:app:name:iphone", iphoneName));
    if (iphoneId) lines.push(nameMeta("twitter:app:id:iphone", iphoneId));
    if (gpName) lines.push(nameMeta("twitter:app:name:googleplay", gpName));
    if (gpId) lines.push(nameMeta("twitter:app:id:googleplay", gpId));
  }

  return { html: lines.join("\n") + "\n", warnings };
}

export const DEFAULT_TWITTER_CARD_INPUT: TwitterCardInput = {
  card: "summary_large_image",
  title: "Forge — Free browser tools",
  description:
    "Free online developer, PDF, image, calculator & productivity tools. Everything runs in your browser.",
  imageUrl: "https://forge.tools/opengraph-image",
  imageAlt: "Forge tools",
  site: "",
  creator: "",
  url: "https://forge.tools/",
  playerUrl: "",
  playerWidth: "1280",
  playerHeight: "720",
  appNameIphone: "",
  appIdIphone: "",
  appNameGoogleplay: "",
  appIdGoogleplay: "",
};

export const TWITTER_CARD_TYPES: {
  id: TwitterCardType;
  label: string;
  hint: string;
}[] = [
  {
    id: "summary",
    label: "Summary",
    hint: "Small square image beside text",
  },
  {
    id: "summary_large_image",
    label: "Summary large image",
    hint: "Large image above text",
  },
  {
    id: "player",
    label: "Player",
    hint: "Embedded media player iframe",
  },
  {
    id: "app",
    label: "App",
    hint: "Mobile app store deep links",
  },
];
