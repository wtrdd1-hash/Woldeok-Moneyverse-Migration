import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migrationFile = 'migrations/277-core-ledger-app-privilege-lockdown.sql';

describe('financial P0: immutable journal permissions', () => {
  it('revokes all non-read app privileges on both canonical posting tables', () => {
    const sql = readFileSync(migrationFile, 'utf8');
    expect(sql).toMatch(/REVOKE\s+ALL\s+PRIVILEGES\s+ON\s+TABLE\s+public\.ledger_transactions\s*,\s*public\.ledger_postings\s+FROM\s+moneyverse_app\s*;/i);
    expect(sql).toMatch(/GRANT\s+SELECT\s+ON\s+TABLE\s+public\.ledger_transactions\s*,\s*public\.ledger_postings\s+TO\s+moneyverse_app\s*;/i);
    expect(sql).not.toMatch(/GRANT\s+(?:ALL|INSERT|UPDATE|DELETE|TRUNCATE)\s+ON\s+(?:TABLE\s+)?public\.ledger_/i);
  });
});
