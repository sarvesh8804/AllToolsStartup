import type { ToolDefinition } from "@/types/tool";

/** Default how-to steps when a tool does not define custom ones. */
export function defaultHowToSteps(tool: ToolDefinition): string[] {
  const local = tool.privacyLocal
    ? "Copy or download the result — processing stays in your browser."
    : "Copy or download the result when you are done.";

  if (tool.family === "pdf" || tool.family === "image") {
    return [
      "Choose or drop your file(s) into the tool.",
      "Adjust options (pages, quality, size, or format) as needed.",
      local,
    ];
  }
  if (tool.family === "calculators") {
    return [
      "Enter the values for your calculation.",
      "Review the results as they update.",
      "Copy any figure you need — nothing is stored on a server.",
    ];
  }
  if (tool.family === "convert") {
    return [
      "Enter a value and pick the source unit or format.",
      "Read the converted outputs in the table or fields.",
      "Copy the value you need.",
    ];
  }
  return [
    "Paste or type your input into the tool.",
    "Adjust options if the tool provides them.",
    local,
  ];
}

export function useCasesBlurb(tool: ToolDefinition): string {
  if (tool.family === "pdf") {
    return `Common uses for ${tool.name}: preparing applications, combining reports, extracting pages, or converting documents without uploading them to a random SaaS.`;
  }
  if (tool.family === "image") {
    return `Common uses for ${tool.name}: preparing assets for the web, shrinking email attachments, converting formats, or removing location metadata before sharing.`;
  }
  if (tool.family === "calculators") {
    return `Use ${tool.name} for quick estimates when you do not want a spreadsheet — ideal for everyday planning and classroom-style checks.`;
  }
  if (tool.family === "convert") {
    return `${tool.name} is handy when you need a fast, accurate conversion without installing software or trusting an opaque online form.`;
  }
  return `${tool.name} is built for developers and power users who want a fast utility without leaving the browser or creating an account.`;
}
