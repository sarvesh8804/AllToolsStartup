import { describe, expect, it } from "vitest";
import {
  DEFAULT_DOCKERFILE_OPTIONS,
  DOCKERFILE_TEMPLATES,
  generateDockerfile,
} from "./dockerfile";

describe("generateDockerfile", () => {
  it("exposes curated templates", () => {
    expect(DOCKERFILE_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    expect(DOCKERFILE_TEMPLATES.map((t) => t.id)).toContain("nextjs");
  });

  it("builds a Node Dockerfile with EXPOSE and CMD", () => {
    const out = generateDockerfile({
      ...DEFAULT_DOCKERFILE_OPTIONS,
      port: 4000,
      startCommand: "node dist/index.js",
    });
    expect(out).toContain("FROM node:");
    expect(out).toContain("EXPOSE 4000");
    expect(out).toContain("npm ci");
    expect(out).toMatch(/CMD \["node","dist\/index\.js"\]/);
  });

  it("builds Next.js standalone multi-stage", () => {
    const out = generateDockerfile({
      ...DOCKERFILE_TEMPLATES.find((t) => t.id === "nextjs")!.defaults,
    });
    expect(out).toContain(".next/standalone");
    expect(out).toContain("AS deps");
    expect(out).toContain("AS runner");
  });

  it("builds Python with pip install", () => {
    const out = generateDockerfile({
      ...DOCKERFILE_TEMPLATES.find((t) => t.id === "python")!.defaults,
      port: 9000,
    });
    expect(out).toContain("FROM python:");
    expect(out).toContain("pip install");
    expect(out).toContain("EXPOSE 9000");
  });

  it("builds Go multi-stage static binary", () => {
    const out = generateDockerfile({
      ...DOCKERFILE_TEMPLATES.find((t) => t.id === "go")!.defaults,
    });
    expect(out).toContain("golang:");
    expect(out).toContain("CGO_ENABLED=0");
    expect(out).toContain("FROM alpine:");
  });

  it("builds static nginx", () => {
    const out = generateDockerfile({
      ...DOCKERFILE_TEMPLATES.find((t) => t.id === "static")!.defaults,
    });
    expect(out).toContain("FROM nginx:");
    expect(out).toContain("/usr/share/nginx/html");
  });
});
