import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  join(__dirname, '..', 'migrations', '280-privacy-request-receipt-binding.sql'),
  'utf8',
);

describe('privacy request receipt migration 280', () => {
  it('repairs the ambiguous RETURNING field without editing applied migration 015', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.privacy_create_my_request');
    expect(sql).toContain('INSERT INTO public.privacy_data_subject_requests AS request_row');
    expect(sql).toContain('RETURNING request_row.id, request_row.created_at');
    expect(sql).not.toMatch(/RETURNING id, created_at INTO/);
  });

  it('keeps SECURITY DEFINER pinned and the app role limited to function EXECUTE', () => {
    expect(sql).toContain('SECURITY DEFINER');
    expect(sql).toContain('SET search_path = pg_catalog, pg_temp');
    expect(sql).toContain('REVOKE ALL PRIVILEGES ON FUNCTION');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION');
    expect(sql).not.toContain('GRANT SELECT ON TABLE public.privacy_data_subject_requests');
  });
});
