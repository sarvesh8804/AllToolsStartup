import type { ToolFaq } from "@/types/tool";

export function FaqList({ faqs }: { faqs: ToolFaq[] }) {
  if (!faqs.length) return null;

  return (
    <section className="mt-12" aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]"
      >
        FAQ
      </h2>
      <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="cursor-pointer list-none font-medium text-[var(--foreground)] marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {faq.question}
                <span className="text-[var(--copper)] transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
