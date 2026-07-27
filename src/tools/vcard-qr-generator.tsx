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
import { buildVCard } from "@/lib/qr/vcard";
import { track } from "@/lib/analytics";

export function VcardQrGeneratorTool() {
  const [firstName, setFirstName] = useState("Ada");
  const [lastName, setLastName] = useState("Lovelace");
  const [organization, setOrganization] = useState("Analytical Engines");
  const [title, setTitle] = useState("Mathematician");
  const [phone, setPhone] = useState("+1 555 0100");
  const [email, setEmail] = useState("ada@example.com");
  const [url, setUrl] = useState("https://example.com");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("London");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("UK");
  const [note, setNote] = useState("");
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
        tool: "vcard-qr-generator",
        family: "tools",
      });
    }
  }, [started]);

  const payload = useMemo(() => {
    try {
      return {
        ok: true as const,
        text: buildVCard({
          firstName,
          lastName,
          organization,
          title,
          phone,
          email,
          url,
          street,
          city,
          region,
          postalCode,
          country,
          note,
        }),
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid contact details",
      };
    }
  }, [
    firstName,
    lastName,
    organization,
    title,
    phone,
    email,
    url,
    street,
    city,
    region,
    postalCode,
    country,
    note,
  ]);

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

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { type?: string; mono?: boolean },
  ) => (
    <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
      {label}
      <input
        type={opts?.type ?? "text"}
        value={value}
        onChange={(e) => {
          markStart();
          onChange(e.target.value);
        }}
        className={`rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] ${
          opts?.mono ? "font-[family-name:var(--font-mono)]" : ""
        }`}
        autoComplete="off"
      />
    </label>
  );

  const downloadPng = () => {
    if (!dataUrl) return;
    markStart();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "forge-vcard-qr.png";
    a.click();
    track({
      name: "tool_complete",
      tool: "vcard-qr-generator",
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
      a.download = "forge-vcard-qr.svg";
      a.click();
      URL.revokeObjectURL(url);
      track({
        name: "tool_complete",
        tool: "vcard-qr-generator",
        family: "tools",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export SVG");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("First name", firstName, setFirstName)}
        {field("Last name", lastName, setLastName)}
        {field("Organization", organization, setOrganization)}
        {field("Title", title, setTitle)}
        {field("Phone", phone, setPhone, { type: "tel", mono: true })}
        {field("Email", email, setEmail, { type: "email", mono: true })}
        {field("Website", url, setUrl, { type: "url", mono: true })}
        {field("Street", street, setStreet)}
        {field("City", city, setCity)}
        {field("Region / state", region, setRegion)}
        {field("Postal code", postalCode, setPostalCode, { mono: true })}
        {field("Country", country, setCountry)}
      </div>

      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Note
        <textarea
          value={note}
          onChange={(e) => {
            markStart();
            setNote(e.target.value);
          }}
          rows={2}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
        />
      </label>

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
              alt="vCard QR code"
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
            label="vCard"
            getText={() => (payload.ok ? payload.text : "")}
          />
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
            {payload.ok ? payload.text : ""}
          </pre>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Scan to add a contact. Built as vCard 3.0 — stays on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
