import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = 'migrations/366-admin-totp-candidate.sql';

function body(sql: string, fn: string): string {
  const start = sql.indexOf(`CREATE OR REPLACE FUNCTION public.${fn}(`);
  expect(start, fn).toBeGreaterThanOrEqual(0);
  const end = sql.indexOf('\n$$;', start);
  return sql.slice(start, end);
}

describe('administrator TOTP candidate v366', () => {
  const sql = readFileSync(migration, 'utf8');

  it('every function follows the definer template', () => {
    const fns = [...sql.matchAll(/CREATE OR REPLACE FUNCTION public\.(admin_totp_\w+)\(/g)].map((m) => m[1]);
    expect(fns.length).toBe(12);
    for (const fn of fns) {
      expect(body(sql, fn), fn).toMatch(/SECURITY DEFINER\s+SET search_path = pg_catalog, pg_temp/);
    }
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON TABLE public\.admin_totp_credentials FROM PUBLIC, moneyverse_app/);
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON TABLE public\.admin_totp_proofs FROM PUBLIC, moneyverse_app/);
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON TABLE public\.admin_totp_attempts FROM PUBLIC, moneyverse_app/);
  });

  it('internal helpers are never granted to the application', () => {
    for (const helper of ['admin_totp_live_session', 'admin_totp_current_step', 'admin_totp_is_admin', 'admin_totp_session_gate']) {
      expect(sql).not.toMatch(new RegExp(`GRANT EXECUTE ON FUNCTION public\\.${helper}\\(`));
    }
  });

  it('seeds the enforcement switch disabled and never overwrites an existing row', () => {
    expect(sql).toMatch(/'admin_totp_required',\s*'disabled'/);
    expect(sql).toMatch(/ON CONFLICT \(feature_key\) DO NOTHING/);
  });

  // Lock order (independent re-review): every function that touches both the credential row and
  // the proofs locks the credential row first, so confirm/verify and revoke cannot deadlock.
  it('revoke locks the target credential row before touching proofs', () => {
    const revoke = body(sql, 'admin_totp_revoke');
    const lock = revoke.search(/FROM public\.admin_totp_credentials AS \w+ WHERE \w+\.user_id = p_target FOR UPDATE/);
    const proofs = revoke.indexOf('DELETE FROM public.admin_totp_proofs');
    expect(lock).toBeGreaterThanOrEqual(0);
    expect(lock).toBeLessThan(proofs);
  });

  it('confirm and verify lock the credential row before touching proofs', () => {
    for (const fn of ['admin_totp_confirm_enrolment', 'admin_totp_verify']) {
      const text = body(sql, fn);
      const lock = text.search(/FROM public\.admin_totp_credentials AS c WHERE c\.user_id = p_actor FOR UPDATE/);
      const proofs = text.search(/(INSERT INTO|DELETE FROM) public\.admin_totp_proofs/);
      expect(lock, fn).toBeGreaterThanOrEqual(0);
      expect(lock, fn).toBeLessThan(proofs);
    }
  });

  it('the session gate is taken before the credential row lock', () => {
    for (const fn of ['admin_totp_confirm_enrolment', 'admin_totp_verify']) {
      const text = body(sql, fn);
      expect(text.indexOf('admin_totp_session_gate'), fn).toBeLessThan(text.search(/FOR UPDATE/));
    }
  });

  it('avoids pg_catalog-qualified SQL constructs', () => {
    expect(sql).not.toMatch(/pg_catalog\.(greatest|least|coalesce|nullif|extract)\b/);
  });
});
