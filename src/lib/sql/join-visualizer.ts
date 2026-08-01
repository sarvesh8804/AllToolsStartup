export type JoinRow = Record<string, string | number | null>;

export type JoinTable = {
  name: string;
  columns: string[];
  rows: JoinRow[];
};

export type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL";

export type JoinVisualizerInput = {
  leftTable: string;
  rightTable: string;
  leftKey: string;
  rightKey: string;
  joinType: JoinType;
};

export type JoinVisualizerResult = {
  columns: string[];
  rows: JoinRow[];
  sql: string;
  rowCount: number;
};

export const SAMPLE_JOIN_TABLES: JoinTable[] = [
  {
    name: "users",
    columns: ["user_id", "name", "city"],
    rows: [
      { user_id: 1, name: "Ada", city: "London" },
      { user_id: 2, name: "Grace", city: "NYC" },
      { user_id: 3, name: "Alan", city: "Manchester" },
    ],
  },
  {
    name: "orders",
    columns: ["order_id", "user_id", "product"],
    rows: [
      { order_id: 101, user_id: 1, product: "Keyboard" },
      { order_id: 102, user_id: 1, product: "Monitor" },
      { order_id: 103, user_id: 2, product: "Mouse" },
      { order_id: 104, user_id: 4, product: "Dock" },
    ],
  },
  {
    name: "departments",
    columns: ["dept_id", "dept_name"],
    rows: [
      { dept_id: 10, dept_name: "Engineering" },
      { dept_id: 20, dept_name: "Design" },
    ],
  },
];

function prefixRow(
  row: JoinRow | null,
  table: string,
  columns: string[],
): JoinRow {
  const out: JoinRow = {};
  for (const col of columns) {
    const key = `${table}.${col}`;
    out[key] = row ? (row[col] ?? null) : null;
  }
  return out;
}

function mergeRows(
  left: JoinRow | null,
  right: JoinRow | null,
  leftTable: JoinTable,
  rightTable: JoinTable,
): JoinRow {
  return {
    ...prefixRow(left, leftTable.name, leftTable.columns),
    ...prefixRow(right, rightTable.name, rightTable.columns),
  };
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}

function innerJoin(
  left: JoinTable,
  right: JoinTable,
  leftKey: string,
  rightKey: string,
): JoinRow[] {
  const out: JoinRow[] = [];
  for (const l of left.rows) {
    for (const r of right.rows) {
      if (valuesEqual(l[leftKey], r[rightKey])) {
        out.push(mergeRows(l, r, left, right));
      }
    }
  }
  return out;
}

function leftJoin(
  left: JoinTable,
  right: JoinTable,
  leftKey: string,
  rightKey: string,
): JoinRow[] {
  const out: JoinRow[] = [];
  for (const l of left.rows) {
    const matches = right.rows.filter((r) =>
      valuesEqual(l[leftKey], r[rightKey]),
    );
    if (matches.length === 0) {
      out.push(mergeRows(l, null, left, right));
    } else {
      for (const r of matches) {
        out.push(mergeRows(l, r, left, right));
      }
    }
  }
  return out;
}

function rightJoin(
  left: JoinTable,
  right: JoinTable,
  leftKey: string,
  rightKey: string,
): JoinRow[] {
  const out: JoinRow[] = [];
  for (const r of right.rows) {
    const matches = left.rows.filter((l) =>
      valuesEqual(l[leftKey], r[rightKey]),
    );
    if (matches.length === 0) {
      out.push(mergeRows(null, r, left, right));
    } else {
      for (const l of matches) {
        out.push(mergeRows(l, r, left, right));
      }
    }
  }
  return out;
}

function fullJoin(
  left: JoinTable,
  right: JoinTable,
  leftKey: string,
  rightKey: string,
): JoinRow[] {
  const leftPart = leftJoin(left, right, leftKey, rightKey);
  const rightOnly = rightJoin(left, right, leftKey, rightKey).filter((row) =>
    left.columns.every((col) => row[`${left.name}.${col}`] === null),
  );
  return [...leftPart, ...rightOnly];
}

export function buildJoinSql(input: JoinVisualizerInput): string {
  const joinWord =
    input.joinType === "INNER"
      ? "INNER JOIN"
      : input.joinType === "LEFT"
        ? "LEFT JOIN"
        : input.joinType === "RIGHT"
          ? "RIGHT JOIN"
          : "FULL OUTER JOIN";

  return [
    "SELECT",
    `  ${input.leftTable}.*,`,
    `  ${input.rightTable}.*`,
    `FROM ${input.leftTable}`,
    `${joinWord} ${input.rightTable}`,
    `  ON ${input.leftTable}.${input.leftKey} = ${input.rightTable}.${input.rightKey};`,
  ].join("\n");
}

export function visualizeJoin(
  tables: JoinTable[],
  input: JoinVisualizerInput,
): JoinVisualizerResult | { ok: false; error: string } {
  const left = tables.find((t) => t.name === input.leftTable);
  const right = tables.find((t) => t.name === input.rightTable);

  if (!left) return { ok: false, error: `Unknown left table: ${input.leftTable}` };
  if (!right) return { ok: false, error: `Unknown right table: ${input.rightTable}` };
  if (left.name === right.name) {
    return { ok: false, error: "Choose two different tables." };
  }
  if (!left.columns.includes(input.leftKey)) {
    return { ok: false, error: `Column ${input.leftKey} not in ${left.name}` };
  }
  if (!right.columns.includes(input.rightKey)) {
    return { ok: false, error: `Column ${input.rightKey} not in ${right.name}` };
  }

  let rows: JoinRow[];
  switch (input.joinType) {
    case "INNER":
      rows = innerJoin(left, right, input.leftKey, input.rightKey);
      break;
    case "LEFT":
      rows = leftJoin(left, right, input.leftKey, input.rightKey);
      break;
    case "RIGHT":
      rows = rightJoin(left, right, input.leftKey, input.rightKey);
      break;
    case "FULL":
      rows = fullJoin(left, right, input.leftKey, input.rightKey);
      break;
    default:
      rows = [];
  }

  const columns = [
    ...left.columns.map((c) => `${left.name}.${c}`),
    ...right.columns.map((c) => `${right.name}.${c}`),
  ];

  return {
    columns,
    rows,
    sql: buildJoinSql(input),
    rowCount: rows.length,
  };
}

export const DEFAULT_JOIN_INPUT: JoinVisualizerInput = {
  leftTable: "users",
  rightTable: "orders",
  leftKey: "user_id",
  rightKey: "user_id",
  joinType: "LEFT",
};
