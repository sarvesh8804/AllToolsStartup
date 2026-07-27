"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_QR_OPTIONS,
  ERROR_LEVELS,
  generateQrDataUrl,
  generateQrSvg,
  type QrErrorCorrection,
} from "@/lib/qr/generate";
import {
  buildWifiQrPayload,
  type WifiAuth,
} from "@/lib/qr/wifi";
import { track } from "@/lib/analytics";

export function WifiQrGeneratorTool() {
  const [ssid, setSsid] = useState("ForgeNet");
  const [password, setPassword] = useState("change-me");
  const [auth, setAuth] = useState<WifiAuth>("WPA");
  const [hidden, setHidden] = useState(false);
  const [errorCorrection, setErrorCorrection] =
    useState<QrErrorCorrection>("M");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "wifi-qr-generator",
        family: "tools",
      });
    }
  }, [started]);

  const payload = useMemo(() => {
    try {
      return {
        ok: true as const,
        text: buildWifiQrPayload({ ssid, password, auth, hidden }),
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid Wi‑Fi details",
      };
    }
  }, [ssid, password, auth, hidden]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!payload.ok) {
        if (!cancelled) {
          setDataUrl("");
          setError(payload.error);
        }
        return;
      }
      try {
        const url = await generateQrDataUrl(payload.text, {
          ...DEFAULT_QR_OPTIONS,
          errorCorrection,
          size: 280,
        });
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setDataUrl("");
          setError(e instanceof Error ? e.message : "Failed to generate QR");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payload, errorCorrection]);

  const downloadPng = () => {
    if (!dataUrl) return;
    markStart();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "forge-wifi-qr.png";
    a.click();
    track({
      name: "tool_complete",
      tool: "wifi-qr-generator",
      family: "tools",
    });
  };

  const downloadSvg = async () => {
    if (!payload.ok) return;
    markStart();
    try {
      const svg = await generateQrSvg(payload.text, {
        ...DEFAULT_QR_OPTIONS,
        errorCorrection,
        size: 280,
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "forge-wifi-qr.svg";
      a.click();
      URL.revokeObjectURL(url);
      track({
        name: "tool_complete",
        tool: "wifi-qr-generator",
        family: "tools",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export SVG");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Network name (SSID)
          <input
            value={ssid}
            onChange={(e) => {
              markStart();
              setSsid(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Security
          <select
            value={auth}
            onChange={(e) => {
              markStart();
              setAuth(e.target.value as WifiAuth);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          >
            <option value="WPA">WPA / WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">Open (no password)</option>
          </select>
        </label>
        {auth !== "nopass" ? (
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Password
            <input
              type="text"
              value={password}
              onChange={(e) => {
                markStart();
                setPassword(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
              autoComplete="off"
            />
          </label>
        ) : null}
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => {
              markStart();
              setHidden(e.target.checked);
            }}
          />
          Hidden network
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--muted)]">Error correction</span>
        {ERROR_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() => {
              markStart();
              setErrorCorrection(level.id);
            }}
            className={
              errorCorrection === level.id
                ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
            }
          >
            {level.label}
          </button>
        ))}
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-col items-start gap-3">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt="Wi-Fi QR code"
              width={280}
              height={280}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            />
          ) : (
            <div className="flex h-[280px] w-[280px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
              QR preview
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!dataUrl}
              onClick={downloadPng}
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] disabled:opacity-40"
            >
              Download PNG
            </button>
            <button
              type="button"
              disabled={!payload.ok}
              onClick={() => void downloadSvg()}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50 disabled:opacity-40"
            >
              Download SVG
            </button>
          </div>
        </div>

        <div>
          <EditorPaneHeader
            label="WIFI payload"
            getText={() => (payload.ok ? payload.text : "")}
          />
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
            {payload.ok ? payload.text : ""}
          </pre>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Scan with a phone camera to join the network. Password stays in the
            QR payload on-device only.
          </p>
        </div>
      </div>
    </div>
  );
}
