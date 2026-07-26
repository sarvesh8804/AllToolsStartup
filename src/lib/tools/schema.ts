import { z } from "zod";
import { TOOL_FAMILIES } from "@/types/tool";

export const toolFaqSchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
});

export const toolDefinitionSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  name: z.string().min(2),
  family: z.enum(TOOL_FAMILIES),
  category: z.string().min(2),
  status: z.enum(["planned", "shipped", "deprecated"]),
  summary: z.string().min(10).max(160),
  description: z.string().min(40),
  keywords: z.array(z.string()).default([]),
  relatedSlugs: z.array(z.string()).default([]),
  faqs: z.array(toolFaqSchema).min(0),
  privacyLocal: z.boolean().default(true),
  component: z.string().optional(),
});

export type ToolDefinitionInput = z.infer<typeof toolDefinitionSchema>;
