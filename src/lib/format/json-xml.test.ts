import { describe, expect, it } from "vitest";
import { jsonToXml, xmlToJson } from "./json-xml";

describe("jsonToXml", () => {
  it("converts a single-key object to a root element", () => {
    const result = jsonToXml(
      JSON.stringify({ person: { name: "Ada", "@id": "1" } }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain("<person id=\"1\">");
      expect(result.xml).toContain("<name>Ada</name>");
      expect(result.xml).toContain("</person>");
    }
  });

  it("wraps arrays under root/item", () => {
    const result = jsonToXml("[1,2]", { rootName: "list", pretty: false });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain("<list>");
      expect(result.xml).toContain("<item>1</item>");
      expect(result.xml).toContain("<item>2</item>");
      expect(result.xml).toContain("</list>");
    }
  });

  it("rejects invalid JSON", () => {
    expect(jsonToXml("{").ok).toBe(false);
  });
});

describe("xmlToJson", () => {
  it("parses elements, attributes, and text", () => {
    const result = xmlToJson(
      `<person id="1"><name>Ada</name><active>true</active></person>`,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        person: {
          "@id": "1",
          name: "Ada",
          active: true,
        },
      });
    }
  });

  it("collects repeated tags into arrays", () => {
    const result = xmlToJson(`<list><item>a</item><item>b</item></list>`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ list: { item: ["a", "b"] } });
    }
  });

  it("round-trips a simple document", () => {
    const xml = jsonToXml(
      JSON.stringify({ note: { title: "Hi", body: "Hello & welcome" } }),
      { pretty: false, declaration: false },
    );
    expect(xml.ok).toBe(true);
    if (!xml.ok) return;
    const back = xmlToJson(xml.xml);
    expect(back.ok).toBe(true);
    if (back.ok) {
      expect(back.value).toEqual({
        note: { title: "Hi", body: "Hello & welcome" },
      });
    }
  });
});
