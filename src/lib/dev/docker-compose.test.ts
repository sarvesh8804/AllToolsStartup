import { describe, expect, it } from "vitest";
import {
  convertDockerRunToCompose,
  SAMPLE_DOCKER_RUN,
} from "./docker-compose";

describe("convertDockerRunToCompose", () => {
  it("converts docker run to compose yaml", () => {
    const result = convertDockerRunToCompose(SAMPLE_DOCKER_RUN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.yaml).toContain("services:");
    expect(result.yaml).toContain("forge-app");
    expect(result.yaml).toContain("3000:3000");
  });
});
