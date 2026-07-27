import { describe, expect, it } from "vitest";
import {
  DEFAULT_README_INPUT,
  buildReadme,
  type ReadmeInput,
} from "./readme";

describe("buildReadme", () => {
  it("builds a titled README with selected sections", () => {
    const md = buildReadme(DEFAULT_README_INPUT);
    expect(md).toContain("# my-project");
    expect(md).toContain("## Features");
    expect(md).toContain("- Fast and local");
    expect(md).toContain("## Installation");
    expect(md).toContain("```bash");
    expect(md).toContain("## License");
    expect(md).toContain("MIT");
  });

  it("omits unchecked sections", () => {
    const input: ReadmeInput = {
      ...DEFAULT_README_INPUT,
      sections: ["description"],
      badgesMarkdown: "![x](https://img.shields.io/badge/x-y-blue)",
    };
    const md = buildReadme(input);
    expect(md).toContain("## Description");
    expect(md).not.toContain("## Features");
    expect(md).not.toContain("shields.io");
  });

  it("includes badges when enabled", () => {
    const md = buildReadme({
      ...DEFAULT_README_INPUT,
      badgesMarkdown: "[![License](https://img.shields.io/badge/license-MIT-blue)]()",
      sections: ["badges"],
    });
    expect(md).toContain("img.shields.io");
  });
});
