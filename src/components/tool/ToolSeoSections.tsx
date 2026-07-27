import type { ToolDefinition } from "@/types/tool";
import { defaultHowToSteps, useCasesBlurb } from "@/lib/seo/tool-copy";

/** SEO body below the interactive workbench — fights thin-content flags. */
export function ToolSeoSections({ tool }: { tool: ToolDefinition }) {
  const steps = defaultHowToSteps(tool);

  return (
    <div className="mt-14 space-y-12 border-t border-[var(--border)] pt-12">
      <section aria-labelledby="about-tool-heading">
        <h2
          id="about-tool-heading"
          className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]"
        >
          About {tool.name}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          {tool.description}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          {useCasesBlurb(tool)}
        </p>
      </section>

      <section aria-labelledby="how-to-heading">
        <h2
          id="how-to-heading"
          className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]"
        >
          How to use {tool.name}
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--muted)]">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="privacy-heading">
        <h2
          id="privacy-heading"
          className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]"
        >
          Privacy &amp; processing
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          {tool.privacyLocal
            ? `${tool.name} runs entirely in your browser. Your input is not uploaded to Forge servers for this tool — ideal when you are working with sensitive snippets, documents, or images.`
            : `${tool.name} may require network access depending on the job. Prefer local-first tools on Forge when privacy matters most.`}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          Free to use. No account required. Results stay in your session unless
          you choose to copy or download them.
        </p>
      </section>
    </div>
  );
}
