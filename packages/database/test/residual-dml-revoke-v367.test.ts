import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = 'migrations/367-residual-app-dml-revoke.sql';

// AR02 2026-11-28: 350 kept table DML for direct Spring writes. The Spring API now registers chat
// and board images through chat_media_register / member_board_register_image_upload, no longer
// writes treasury_swf_events or user_progression, and no longer reads the sealed-auction bid log.
// Each unused grant is one SQL injection away from writing or reading those rows directly.
const REVOKED = [
  ['INSERT', 'chat_media_registry'],
  ['INSERT', 'member_board_image_uploads'],
  ['INSERT', 'treasury_swf_events'],
  ['INSERT', 'user_progression'],
  ['SELECT', 'black_market_bid_logs'],
] as const;

function javaSources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? javaSources(p) : p.endsWith('.java') ? [p] : [];
  });
}

describe('367 residual application DML revoke', () => {
  it.each(REVOKED)('revokes %s on %s from the application role', (privilege, table) => {
    const sql = readFileSync(path, 'utf8');
    expect(sql).toMatch(new RegExp(`REVOKE[^;]*\\b${privilege}\\b[^;]*public\\.${table}[^;]*FROM moneyverse_app`, 'i'));
  });

  it('grants nothing and is one transaction', () => {
    const sql = readFileSync(path, 'utf8');
    expect(sql).not.toMatch(/^\s*GRANT\b/im);
    expect(sql).toMatch(/BEGIN;[\s\S]*COMMIT;\s*$/);
  });

  it.each(REVOKED)('leaves no Spring statement depending on %s on %s', (privilege, table) => {
    const verb = privilege === 'INSERT' ? 'INSERT\\s+INTO' : '(?:FROM|JOIN)';
    const pattern = new RegExp(`${verb}\\s+(?:public\\.)?${table}\\b`, 'i');
    const offenders = javaSources('../../spring-backend/src/main/java')
      .filter((file) => pattern.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
