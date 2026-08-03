import { wrapJsonLdScript } from "@/lib/seo/json-ld";

export type SchemaMarkupType = "FAQPage" | "HowTo";

export type FaqItem = {
  question: string;
  answer: string;
};

export type HowToStep = {
  name: string;
  text: string;
  image?: string;
};

export type FaqSchemaInput = {
  type: "FAQPage";
  items: FaqItem[];
};

export type HowToSchemaInput = {
  type: "HowTo";
  name: string;
  description: string;
  totalTime?: string;
  steps: HowToStep[];
};

export type SchemaMarkupInput = FaqSchemaInput | HowToSchemaInput;

export type SchemaMarkupResult =
  | { ok: true; json: string; script: string; warnings: string[] }
  | { ok: false; error: string };

/** Build FAQPage JSON-LD. */
export function buildFaqSchema(input: FaqSchemaInput): SchemaMarkupResult {
  const items = input.items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);

  if (items.length === 0) {
    return { ok: false, error: "Add at least one FAQ with question and answer." };
  }

  const node = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const json = `${JSON.stringify(node, null, 2)}\n`;
  return {
    ok: true,
    json,
    script: wrapJsonLdScript(json.trimEnd()),
    warnings: [],
  };
}

/** Build HowTo JSON-LD. */
export function buildHowToSchema(input: HowToSchemaInput): SchemaMarkupResult {
  const name = input.name.trim();
  const description = input.description.trim();
  const steps = input.steps
    .map((step) => ({
      name: step.name.trim(),
      text: step.text.trim(),
      image: step.image?.trim() ?? "",
    }))
    .filter((step) => step.name || step.text);

  if (!name) {
    return { ok: false, error: "HowTo name is required." };
  }
  if (steps.length === 0) {
    return { ok: false, error: "Add at least one HowTo step." };
  }

  const warnings: string[] = [];
  if (!description) warnings.push("Add a description for richer search results.");

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description: description || name,
    step: steps.map((step, index) => {
      const entry: Record<string, unknown> = {
        "@type": "HowToStep",
        position: index + 1,
        name: step.name || `Step ${index + 1}`,
        text: step.text || step.name,
      };
      if (step.image) entry.image = step.image;
      return entry;
    }),
  };

  const totalTime = input.totalTime?.trim();
  if (totalTime) node.totalTime = totalTime;

  const json = `${JSON.stringify(node, null, 2)}\n`;
  return {
    ok: true,
    json,
    script: wrapJsonLdScript(json.trimEnd()),
    warnings,
  };
}

/** Build schema.org JSON-LD for FAQ or HowTo. */
export function buildSchemaMarkup(input: SchemaMarkupInput): SchemaMarkupResult {
  if (input.type === "FAQPage") return buildFaqSchema(input);
  return buildHowToSchema(input);
}

export const SAMPLE_FAQ_SCHEMA: FaqSchemaInput = {
  type: "FAQPage",
  items: [
    {
      question: "Does Forge run in the browser?",
      answer: "Yes. Most tools process data locally without uploading files.",
    },
    {
      question: "Is Forge free?",
      answer: "Core utilities are free to use in your browser.",
    },
  ],
};

export const SAMPLE_HOWTO_SCHEMA: HowToSchemaInput = {
  type: "HowTo",
  name: "Add JSON-LD to your site",
  description: "Paste structured data into your HTML head for rich results.",
  totalTime: "PT5M",
  steps: [
    { name: "Generate markup", text: "Use the schema generator to build JSON-LD." },
    { name: "Copy script tag", text: "Copy the script block into your page <head>." },
  ],
};
