export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Remaining milliseconds (0 when expired). */
  totalMs: number;
  expired: boolean;
};

export type CountdownConfig = {
  title: string;
  /** Optional subtitle under the title. */
  subtitle: string;
  /** Target instant as ISO-8601 string (prefer UTC). */
  targetIso: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  /** Accent color for the embed (CSS color). */
  accent: string;
  /** Background color for the embed. */
  background: string;
  /** Text color for the embed. */
  foreground: string;
};

export const DEFAULT_COUNTDOWN_CONFIG: CountdownConfig = {
  title: "Launch countdown",
  subtitle: "Everything you need. One website.",
  targetIso: "",
  showDays: true,
  showHours: true,
  showMinutes: true,
  showSeconds: true,
  accent: "#c4a70a",
  background: "#243018",
  foreground: "#fffef6",
};

/** Default target: 7 days from a given now (ms). */
export function defaultTargetIso(nowMs = Date.now()): string {
  return new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString();
}

export function remainingParts(
  nowMs: number,
  targetMs: number,
): CountdownParts {
  const diff = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: diff,
    expired: diff <= 0,
  };
}

export function parseTargetInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const ms = Date.parse(trimmed);
  if (!Number.isFinite(ms)) return null;
  return ms;
}

export function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

export function formatCountdownLabel(
  parts: CountdownParts,
  options: Pick<
    CountdownConfig,
    "showDays" | "showHours" | "showMinutes" | "showSeconds"
  >,
): string {
  if (parts.expired) return "Time’s up";
  const chunks: string[] = [];
  if (options.showDays) chunks.push(`${parts.days}d`);
  if (options.showHours) chunks.push(`${pad2(parts.hours)}h`);
  if (options.showMinutes) chunks.push(`${pad2(parts.minutes)}m`);
  if (options.showSeconds) chunks.push(`${pad2(parts.seconds)}s`);
  return chunks.join(" ") || "0s";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Self-contained HTML snippet with an inline countdown (no external deps).
 */
export function buildCountdownEmbedHtml(config: CountdownConfig): string {
  const title = escapeHtml(config.title.trim() || "Countdown");
  const subtitle = escapeHtml(config.subtitle.trim());
  const target = escapeHtml(config.targetIso);
  const accent = escapeHtml(config.accent.trim() || "#c4a70a");
  const background = escapeHtml(config.background.trim() || "#243018");
  const foreground = escapeHtml(config.foreground.trim() || "#fffef6");
  const flags = JSON.stringify({
    showDays: config.showDays,
    showHours: config.showHours,
    showMinutes: config.showMinutes,
    showSeconds: config.showSeconds,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    font-family: ui-sans-serif, system-ui, sans-serif; background: ${background}; color: ${foreground}; }
  .wrap { text-align: center; padding: 2rem; max-width: 40rem; }
  h1 { margin: 0 0 .35rem; font-size: clamp(1.4rem, 4vw, 2rem); font-weight: 650; }
  .sub { margin: 0 0 1.5rem; opacity: .75; }
  .grid { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; }
  .unit { min-width: 4.5rem; padding: .85rem .7rem; border-radius: .75rem;
    background: color-mix(in srgb, ${accent} 18%, transparent);
    border: 1px solid color-mix(in srgb, ${accent} 45%, transparent); }
  .num { font-variant-numeric: tabular-nums; font-size: 1.75rem; font-weight: 700; color: ${accent}; }
  .label { font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; opacity: .7; margin-top: .25rem; }
  .done { font-size: 1.25rem; font-weight: 600; color: ${accent}; }
</style>
</head>
<body>
<div class="wrap">
  <h1>${title}</h1>
  ${subtitle ? `<p class="sub">${subtitle}</p>` : ""}
  <div id="cd" class="grid" data-target="${target}" data-flags='${flags}'></div>
</div>
<script>
(function(){
  var el = document.getElementById('cd');
  if (!el) return;
  var target = Date.parse(el.getAttribute('data-target') || '');
  var flags = {};
  try { flags = JSON.parse(el.getAttribute('data-flags') || '{}'); } catch (e) {}
  function pad(n){ return String(Math.max(0, n|0)).padStart(2,'0'); }
  function render(){
    var diff = Math.max(0, target - Date.now());
    if (!Number.isFinite(target)) { el.textContent = 'Invalid target date'; return; }
    if (diff <= 0) { el.innerHTML = '<p class="done">Time\\u2019s up</p>'; return; }
    var s = Math.floor(diff/1000);
    var parts = [
      flags.showDays !== false ? ['Days', Math.floor(s/86400)] : null,
      flags.showHours !== false ? ['Hours', Math.floor((s%86400)/3600)] : null,
      flags.showMinutes !== false ? ['Minutes', Math.floor((s%3600)/60)] : null,
      flags.showSeconds !== false ? ['Seconds', s%60] : null
    ].filter(Boolean);
    el.innerHTML = parts.map(function(p){
      var val = p[0]==='Days' ? String(p[1]) : pad(p[1]);
      return '<div class="unit"><div class="num">'+val+'</div><div class="label">'+p[0]+'</div></div>';
    }).join('');
  }
  render();
  setInterval(render, 1000);
})();
</script>
</body>
</html>
`;
}
