export type AnalyticsEvent =
  | { name: "tool_start"; tool: string; family: string }
  | { name: "tool_complete"; tool: string; family: string }
  | { name: "search_open" }
  | { name: "search_select"; tool: string };

/**
 * Privacy-friendly analytics helper.
 * No cookies, no PII, no content payloads (never send pasted text/files).
 * Wire to Cloudflare Web Analytics custom events or a beacon later.
 */
export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    window.dispatchEvent(
      new CustomEvent("forge:analytics", { detail: event }),
    );

    // Optional: Cloudflare Web Analytics beacon when configured
    const beacon = (
      window as Window & {
        __forgeTrack?: (e: AnalyticsEvent) => void;
      }
    ).__forgeTrack;
    beacon?.(event);

    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", event);
    }
  } catch {
    // never break tools for analytics
  }
}
