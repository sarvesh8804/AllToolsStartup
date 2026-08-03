export type CalendarOptions = {
  year: number;
  month: number;
  /** 0 = Sunday, 1 = Monday */
  weekStartsOn?: 0 | 1;
  title?: string;
};

export type CalendarDay = {
  date: number | null;
  iso: string | null;
};

export type CalendarResult =
  | {
      ok: true;
      year: number;
      month: number;
      monthName: string;
      weeks: CalendarDay[][];
      html: string;
    }
  | { ok: false; error: string };

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_LABELS_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LABELS_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Build a printable month calendar as HTML. */
export function buildMonthCalendar(
  options: CalendarOptions,
): CalendarResult {
  const year = Math.floor(options.year);
  const month = Math.floor(options.month);
  const weekStartsOn = options.weekStartsOn ?? 1;

  if (!Number.isFinite(year) || year < 1 || year > 9999) {
    return { ok: false, error: "Year must be between 1 and 9999." };
  }
  if (month < 1 || month > 12) {
    return { ok: false, error: "Month must be between 1 and 12." };
  }

  const monthName = MONTH_NAMES[month - 1]!;
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = weekStartsOn === 1 ? (firstDay + 6) % 7 : firstDay;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: CalendarDay[] = [];
  for (let i = 0; i < offset; i += 1) {
    cells.push({ date: null, iso: null });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: day,
      iso: `${year}-${pad(month)}-${pad(day)}`,
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, iso: null });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const labels = weekStartsOn === 1 ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN;
  const title = options.title?.trim() || `${monthName} ${year}`;

  const header = labels
    .map((label) => `<th scope="col">${label}</th>`)
    .join("");
  const body = weeks
    .map(
      (week) =>
        `<tr>${week
          .map((cell) =>
            cell.date
              ? `<td><time datetime="${cell.iso}">${cell.date}</time></td>`
              : `<td aria-hidden="true"></td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #111827; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    table { border-collapse: collapse; width: 100%; max-width: 720px; }
    th, td { border: 1px solid #d1d5db; text-align: center; padding: 0.75rem; }
    th { background: #f3f4f6; font-size: 0.85rem; }
    td { height: 3.5rem; vertical-align: top; }
    @media print { body { margin: 0.5in; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <thead><tr>${header}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</body>
</html>
`;

  return { ok: true, year, month, monthName, weeks, html };
}

export const DEFAULT_CALENDAR = {
  year: 2026,
  month: 8,
} as const;
