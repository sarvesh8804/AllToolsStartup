"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import {
  API_KEY_TOKEN_MAX,
  API_KEY_SECRET_MAX,
  API_KEY_SECRET_MIN,
  DEFAULT_API_KEY_TOKEN_OPTIONS,
  generateApiKeyTokens,
  type ApiKeyEnvironment,
  type ApiKeyRole,
  type ApiKeyStyle,
  type ApiKeyTokenOptions,
} from "@/lib/generate/api-key-token";
import { track } from "@/lib/analytics";

export function ApiKeyStyleTokenGeneratorTool() {
  const [options, setOptions] = useState<ApiKeyTokenOptions>(
    DEFAULT_API_KEY_TOKEN_OPTIONS,
  );
  const [tokens, setTokens] = useState<string[]>(() =>
    generateApiKeyTokens(DEFAULT_API_KEY_TOKEN_OPTIONS),
  );
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "api-key-style-token-generator",
        family: "tools",
      });
    }
  }, [started]);

  const regenerate = useCallback(
    (next: ApiKeyTokenOptions) => {
      markStart();
      setTokens(generateApiKeyTokens(next));
      track({
        name: "tool_complete",
        tool: "api-key-style-token-generator",
        family: "tools",
      });
    },
    [markStart],
  );

  const update = (patch: Partial<ApiKeyTokenOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    regenerate(next);
  };

  const joined = tokens.join("\n");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          How many
          <input
            type="number"
            min={1}
            max={API_KEY_TOKEN_MAX}
            value={options.count ?? 1}
            onChange={(e) => update({ count: Number(e.target.value) })}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Style
          <select
            value={options.style ?? "stripe"}
            onChange={(e) =>
              update({ style: e.target.value as ApiKeyStyle })
            }
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          >
            <option value="stripe">Stripe-like (sk_live_…)</option>
            <option value="generic">Custom prefix</option>
          </select>
        </label>
        {options.style === "stripe" ? (
          <>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Role
              <select
                value={options.role ?? "sk"}
                onChange={(e) =>
                  update({ role: e.target.value as ApiKeyRole })
                }
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
              >
                <option value="sk">Secret (sk)</option>
                <option value="pk">Publishable (pk)</option>
                <option value="api">API (api)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Environment
              <select
                value={options.environment ?? "live"}
                onChange={(e) =>
                  update({
                    environment: e.target.value as ApiKeyEnvironment,
                  })
                }
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
              >
                <option value="live">live</option>
                <option value="test">test</option>
                <option value="none">none</option>
              </select>
            </label>
          </>
        ) : (
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Prefix
            <input
              type="text"
              value={options.prefix ?? "api"}
              onChange={(e) => update({ prefix: e.target.value })}
              className="w-36 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Secret length
          <input
            type="number"
            min={API_KEY_SECRET_MIN}
            max={API_KEY_SECRET_MAX}
            value={options.secretLength ?? 32}
            onChange={(e) =>
              update({ secretLength: Number(e.target.value) })
            }
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <button
          type="button"
          onClick={() => regenerate(options)}
          className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)]"
        >
          Generate
        </button>
        <CopyButton getText={() => joined} label="Copy all" />
      </div>

      <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {tokens.map((token, i) => (
          <li
            key={`${token}-${i}`}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <code className="break-all font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
              {token}
            </code>
            <CopyButton
              getText={() => token}
              label="Copy"
              className="!py-1 !text-xs"
            />
          </li>
        ))}
      </ul>

      <p className="text-xs text-[var(--muted)]">
        Demo tokens for local development and UI mocks only — not connected to
        any real provider. Uses <code>crypto.getRandomValues</code>.
      </p>
    </div>
  );
}
