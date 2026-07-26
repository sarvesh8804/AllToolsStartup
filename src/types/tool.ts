export const TOOL_FAMILIES = [
  "tools",
  "pdf",
  "image",
  "calculators",
  "convert",
] as const;

export type ToolFamily = (typeof TOOL_FAMILIES)[number];

export type ToolStatus = "planned" | "shipped" | "deprecated";

export type ToolFaq = {
  question: string;
  answer: string;
};

export type ToolDefinition = {
  slug: string;
  name: string;
  family: ToolFamily;
  category: string;
  status: ToolStatus;
  summary: string;
  description: string;
  keywords: string[];
  relatedSlugs: string[];
  faqs: ToolFaq[];
  privacyLocal: boolean;
  component?: string;
};
