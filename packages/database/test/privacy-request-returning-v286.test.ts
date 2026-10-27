import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = 'migrations/286-privacy-request-returning-binding.sql';

describe('P0 privacy request first-create SQL binding v286', () => {
  it('replaces only the owner-scoped SECURITY DEFINER intake function', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.privacy_create_my_request\s*\(/);
    expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path = pg_catalog, pg_temp/);
    expect(sql).toMatch(/FOR UPDATE;/);
    expect(sql).not.toMatch(/\bALTER TABLE\b|\bDROP TABLE\b|\bUPDATE public\.account_balances\b/i);
  });

  it('qualifies the INSERT RETURNING fields against the insert target alias', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toMatch(/INSERT INTO public\.privacy_data_subject_requests\s+AS request_row\s*\(/);
    expect(sql).toMatch(/RETURNING request_row\.id, request_row\.created_at INTO v_request_id, v_created_at/);
  });

  it('preserves payload-bound idempotency and redacted immutable audit', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toContain('request_row.idempotency_key = p_idempotency_key');
    expect(sql).toContain('v_existing_hash IS DISTINCT FROM v_request_hash');
    expect(sql).toContain('public.admin_append_audit_event');
    expect(sql).toContain("'privacy.request.created'");
    expect(sql).not.toMatch(/jsonb_build_object\s*\(\s*'requestType'\s*,\s*v_request_type\s*,\s*'detail'/);
  });

  it('restricts execution and leaves direct table DML forbidden', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON FUNCTION public\.privacy_create_my_request\(uuid, text, text, uuid\)\s+FROM PUBLIC, moneyverse_app/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.privacy_create_my_request\(uuid, text, text, uuid\)\s+TO moneyverse_app/);
    expect(sql).not.toMatch(/GRANT\s+(?:SELECT|INSERT|UPDATE|DELETE)\s+ON\s+(?:TABLE\s+)?public\.privacy_data_subject_requests/i);
  });
});
