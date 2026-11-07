import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sqlPath = join(__dirname, "../migrations/321-season-settlement-app-execute-lockdown.sql");

describe("P0 season settlement SQL least-privilege boundary v321", () => {
  it("revokes execution from PUBLIC and the application role in a forward-only transaction", () => {
    const sql = readFileSync(sqlPath, "utf8");
    expect(sql).toMatch(/^BEGIN;/m);
    expect(sql).toMatch(/REVOKE\s+(?:ALL(?:\s+PRIVILEGES)?|EXECUTE)\s+ON\s+FUNCTION\s+public\.season_settle_rewards\(uuid\)\s+FROM\s+PUBLIC,\s*moneyverse_app/i);
    expect(sql).toMatch(/^COMMIT;/m);
  });

  it("never restores app execution or rewrites the settlement implementation", () => {
    const sql = readFileSync(sqlPath, "utf8");
    expect(sql).not.toMatch(/\bGRANT\b/i);
    expect(sql).not.toMatch(/\bCREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\b/i);
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT|DELETE|TRUNCATE)\s+(?:FROM\s+|INTO\s+)?public\./i);
  });
});
