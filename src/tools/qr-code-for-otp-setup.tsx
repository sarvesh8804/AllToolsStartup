"use client";

import { useCallback, useEffect, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { generateQrDataUrl } from "@/lib/qr/generate";
import {
  buildOtpAuthUri,
  generateOtpSecret,
  SAMPLE_OTP_INPUT,
  type OtpAlgorithm,
  type OtpDigits,
} from "@/lib/qr/otp";
import { track } from "@/lib/analytics";

export function QrCodeForOtpSetupTool() {
  const [issuer, setIssuer] = useState(SAMPLE_OTP_INPUT.issuer);
  const [account, setAccount] = useState(SAMPLE_OTP_INPUT.account);
  const [secret, setSecret] = useState(SAMPLE_OTP_INPUT.secret);
  const [algorithm, setAlgorithm] = useState<OtpAlgorithm>("SHA1");
  const [digits, setDigits] = useState<OtpDigits>(6);
  const [period, setPeriod] = useState(30);
  const [dataUrl, setDataUrl] = useState("");
  const [started, setStarted] = useState(false);

  const otpResult = buildOtpAuthUri({ issuer, account, secret, algorithm, digits, period });

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "qr-code-for-otp-setup", family: "tools" });
    }
  }, [started]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = buildOtpAuthUri({ issuer, account, secret, algorithm, digits, period });
      if (!result.ok) {
        if (!cancelled) setDataUrl("");
        return;
      }
      try {
        const url = await generateQrDataUrl(result.uri, {
          errorCorrection: "M",
          size: 280,
          margin: 2,
          darkColor: "#111827",
          lightColor: "#ffffff",
        });
        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) setDataUrl("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [issuer, account, secret, algorithm, digits, period]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Issuer
          <input value={issuer} onChange={(e) => { markStart(); setIssuer(e.target.value); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Account
          <input value={account} onChange={(e) => { markStart(); setAccount(e.target.value); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)] sm:col-span-2">
          Secret (Base32)
          <div className="flex gap-2">
            <input value={secret} onChange={(e) => { markStart(); setSecret(e.target.value); }}
              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]" />
            <button type="button" onClick={() => { markStart(); setSecret(generateOtpSecret(32)); }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]">
              Generate
            </button>
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Algorithm
          <select value={algorithm} onChange={(e) => { markStart(); setAlgorithm(e.target.value as OtpAlgorithm); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]">
            <option value="SHA1">SHA1</option>
            <option value="SHA256">SHA256</option>
            <option value="SHA512">SHA512</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Digits / Period
          <div className="flex gap-2">
            <select value={digits} onChange={(e) => { markStart(); setDigits(Number(e.target.value) as OtpDigits); }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]">
              <option value={6}>6 digits</option>
              <option value={8}>8 digits</option>
            </select>
            <input type="number" min={15} max={120} value={period} onChange={(e) => { markStart(); setPeriod(Number(e.target.value)); }}
              className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]" />
          </div>
        </label>
      </div>
      {!otpResult.ok ? <ToolErrorState message={otpResult.error} /> : (
        <div className="flex flex-wrap items-start gap-6">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="OTP setup QR code" className="rounded-lg border border-[var(--border)] bg-white p-3" width={280} height={280} />
          ) : null}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm text-[var(--muted)]">Scan with Google Authenticator, 1Password, Authy, etc.</p>
            <code className="block break-all rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs font-[family-name:var(--font-mono)] text-[var(--foreground)]">
              {otpResult.uri}
            </code>
            <CopyButton getText={() => otpResult.uri} label="Copy otpauth URI" />
          </div>
        </div>
      )}
      <p className="text-xs text-[var(--muted)]">Educational 2FA setup helper — stores nothing on a server. Use only with secrets you control.</p>
    </div>
  );
}
