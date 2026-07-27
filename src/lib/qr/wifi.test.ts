import { describe, expect, it } from "vitest";
import {
  buildWifiQrPayload,
  escapeWifiField,
  parseWifiQrPayload,
} from "./wifi";

describe("escapeWifiField", () => {
  it("escapes special characters", () => {
    expect(escapeWifiField(`a;b:c,d"e\\f`)).toBe(`a\\;b\\:c\\,d\\"e\\\\f`);
  });
});

describe("buildWifiQrPayload", () => {
  it("builds a WPA payload", () => {
    expect(
      buildWifiQrPayload({
        ssid: "ForgeNet",
        password: "secret",
        auth: "WPA",
      }),
    ).toBe("WIFI:T:WPA;S:ForgeNet;P:secret;");
  });

  it("supports open networks and hidden flag", () => {
    expect(
      buildWifiQrPayload({
        ssid: "Guest",
        password: "",
        auth: "nopass",
        hidden: true,
      }),
    ).toBe("WIFI:T:nopass;S:Guest;P:;H:true;");
  });

  it("escapes SSID special characters", () => {
    expect(
      buildWifiQrPayload({
        ssid: "Cafe;WiFi",
        password: "p:ass",
        auth: "WPA",
      }),
    ).toBe("WIFI:T:WPA;S:Cafe\\;WiFi;P:p\\:ass;");
  });

  it("rejects empty SSID", () => {
    expect(() =>
      buildWifiQrPayload({ ssid: "  ", password: "x", auth: "WPA" }),
    ).toThrow(/SSID/);
  });

  it("rejects missing password for WPA", () => {
    expect(() =>
      buildWifiQrPayload({ ssid: "Net", password: "", auth: "WPA" }),
    ).toThrow(/password/);
  });
});

describe("parseWifiQrPayload", () => {
  it("round-trips a WPA payload", () => {
    const payload = buildWifiQrPayload({
      ssid: "Forge;Lab",
      password: "a:b",
      auth: "WPA",
      hidden: true,
    });
    const parsed = parseWifiQrPayload(payload);
    expect(parsed).toEqual({
      ok: true,
      ssid: "Forge;Lab",
      password: "a:b",
      auth: "WPA",
      hidden: true,
    });
  });

  it("rejects non-wifi payloads", () => {
    expect(parseWifiQrPayload("https://example.com").ok).toBe(false);
  });
});
