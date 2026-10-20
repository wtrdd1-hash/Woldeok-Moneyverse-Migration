import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = () => readFileSync(
  join(__dirname, '../migrations/279-blog-editorial-replay-idempotency.sql'),
  'utf8',
);
const smoke = () => readFileSync(
  join(__dirname, '../../../scripts/test-blog-editorial-foundation.sh'),
  'utf8',
);

describe('v1001 blog editorial replay safety (forward-only)', () => {
  it('replaces only draft/source writer functions without permitting publication', () => {
    const sql = migration();
    for (const name of ['source_record', 'draft_append']) {
      expect(sql).toContain('CREATE OR REPLACE FUNCTION public.blog_editorial_' + name);
      expect(sql).toContain('REVOKE ALL ON FUNCTION public.blog_editorial_' + name);
    }
    expect(sql).not.toMatch(/\b(?:CREATE|ALTER|DROP)\s+TABLE\b/i);
    expect(sql).not.toMatch(/\bGRANT\s+EXECUTE\b/i);
    expect(sql).not.toMatch(/\b(?:account_balances|ledger_postings|ledger_transactions)\b/i);
    expect(sql).not.toContain('blog_editorial_publish(');
  });

  it('requires the original expected revision for any draft replay', () => {
    expect(migration()).toContain('AND revision=p_expected_revision+1');
  });

  it('reuses historical receipts before checking current source freshness', () => {
    const sql = migration();
    const sourceKey = sql.indexOf('CREATE OR REPLACE FUNCTION public.blog_editorial_source_record');
    const draftKey = sql.indexOf('CREATE OR REPLACE FUNCTION public.blog_editorial_draft_append');
    expect(sourceKey).toBeGreaterThan(-1);
    expect(draftKey).toBeGreaterThan(sourceKey);
    const draft = sql.slice(draftKey);
    const retry = draft.indexOf('IF v_id IS NOT NULL THEN RETURN v_id; END IF;');
    const fresh = draft.indexOf('WHERE id=p_source AND topic_id=p_topic AND expires_at > clock_timestamp()');
    expect(retry).toBeGreaterThan(-1);
    expect(fresh).toBeGreaterThan(retry);
    const script = smoke();
    expect(script).toContain('279-blog-editorial-replay-idempotency.sql');
    expect(script).toContain('279-blog-editorial-idempotency-e2e.sql');
  });
});
