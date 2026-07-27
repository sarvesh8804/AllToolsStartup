"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import {
  CARD_BRAND_LABELS,
  generateTestCard,
  knownTestCard,
  type CardBrand,
  type TestCard,
} from "@/lib/security/test-cards";
import { track } from "@/lib/analytics";

const BRANDS = Object.keys(CARD_BRAND_LABELS) as CardBrand[];

export function FakeCreditCardTool() {
  const [brand, setBrand] = useState<CardBrand>("visa");
  const [card, setCard] = useState<TestCard>(() => knownTestCard("visa"));
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "fake-credit-card",
        family: "tools",
      });
    }
  }, [started]);

  const regenerate = (nextBrand: CardBrand = brand) => {
    markStart();
    setBrand(nextBrand);
    setCard(generateTestCard(nextBrand));
    track({
      name: "tool_complete",
      tool: "fake-credit-card",
      family: "tools",
    });
  };

  const applyKnown = (nextBrand: CardBrand = brand) => {
    markStart();
    setBrand(nextBrand);
    setCard(knownTestCard(nextBrand));
  };

  return (
    <div className="space-y-5">
      <div
        role="alert"
        className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]"
      >
        <strong>Test numbers only.</strong> These pass Luhn checks for payment
        sandbox / UI testing. They are <em>not</em> real cards — do not use for
        real purchases or store as live credentials.
      </div>

      <div className="flex flex-wrap gap-2">
        {BRANDS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => regenerate(b)}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              brand === b
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
            }`}
          >
            {CARD_BRAND_LABELS[b]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,#243018_0%,#3d4f28_50%,#1a1708_100%)] p-6 text-[#fff6b8] shadow-lg">
        <p className="text-xs uppercase tracking-[0.14em] opacity-80">
          {CARD_BRAND_LABELS[card.brand]} · TEST
        </p>
        <p className="mt-6 font-[family-name:var(--font-mono)] text-xl tracking-wider sm:text-2xl">
          {card.formatted}
        </p>
        <div className="mt-8 flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] opacity-70">
              Expiry
            </p>
            <p className="mt-1 font-[family-name:var(--font-mono)]">
              {card.expiryMonth}/{card.expiryYear}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] opacity-70">
              CVV
            </p>
            <p className="mt-1 font-[family-name:var(--font-mono)]">
              {card.cvv}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => regenerate()}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)]"
        >
          Generate new
        </button>
        <button
          type="button"
          onClick={() => applyKnown()}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Use known sandbox number
        </button>
        <CopyButton getText={() => card.number} label="Copy number" />
        <CopyButton
          getText={() =>
            `${card.number}|${card.expiryMonth}/${card.expiryYear}|${card.cvv}`
          }
          label="Copy all"
        />
      </div>

      <p className="text-xs text-[var(--muted)]">
        Numbers are Luhn-valid and generated locally with your browser’s
        CSPRNG. Prefer provider-documented sandbox PANs (Stripe, Braintree,
        etc.) when integrating real gateways.
      </p>
    </div>
  );
}
