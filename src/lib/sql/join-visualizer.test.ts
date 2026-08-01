import { describe, expect, it } from "vitest";
import {
  DEFAULT_JOIN_INPUT,
  SAMPLE_JOIN_TABLES,
  buildJoinSql,
  visualizeJoin,
  type JoinVisualizerResult,
} from "./join-visualizer";

function expectJoin(
  result: JoinVisualizerResult | { ok: false; error: string },
): JoinVisualizerResult {
  if ("ok" in result && result.ok === false) {
    throw new Error(result.error);
  }
  return result as JoinVisualizerResult;
}

describe("visualizeJoin", () => {
  it("inner join returns matching rows only", () => {
    const result = expectJoin(
      visualizeJoin(SAMPLE_JOIN_TABLES, {
        ...DEFAULT_JOIN_INPUT,
        joinType: "INNER",
      }),
    );
    expect(result.rowCount).toBe(3);
  });

  it("left join includes users without orders", () => {
    const result = expectJoin(
      visualizeJoin(SAMPLE_JOIN_TABLES, {
        ...DEFAULT_JOIN_INPUT,
        joinType: "LEFT",
      }),
    );
    expect(result.rowCount).toBe(4);
    expect(
      result.rows.some(
        (r) => r["users.name"] === "Alan" && r["orders.order_id"] === null,
      ),
    ).toBe(true);
  });

  it("right join includes orders without users", () => {
    const result = expectJoin(
      visualizeJoin(SAMPLE_JOIN_TABLES, {
        ...DEFAULT_JOIN_INPUT,
        joinType: "RIGHT",
      }),
    );
    expect(
      result.rows.some(
        (r) => r["orders.order_id"] === 104 && r["users.name"] === null,
      ),
    ).toBe(true);
  });

  it("rejects same table on both sides", () => {
    const result = visualizeJoin(SAMPLE_JOIN_TABLES, {
      ...DEFAULT_JOIN_INPUT,
      rightTable: "users",
    });
    expect(result).toEqual({ ok: false, error: "Choose two different tables." });
  });
});

describe("buildJoinSql", () => {
  it("formats a left join statement", () => {
    const sql = buildJoinSql(DEFAULT_JOIN_INPUT);
    expect(sql).toContain("FROM users");
    expect(sql).toContain("LEFT JOIN orders");
    expect(sql).toContain("users.user_id = orders.user_id");
  });
});
