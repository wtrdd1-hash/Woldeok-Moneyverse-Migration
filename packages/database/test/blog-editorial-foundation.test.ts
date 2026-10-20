import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** v976 static guards. Separate isolated PostgreSQL integration smoke is required. */
const sql = () => readFileSync(join(__dirname, '../migrations/278-blog-editorial-foundation.sql'), 'utf8');

describe('AI blog editorial foundation (safe by default)', () => {
  it('separates durable topics, evidence, revisions, reviews and immutable audit', () => {
    const text = sql();
    for (const name of ['blog_editorial_topics', 'blog_editorial_sources', 'blog_editorial_drafts', 'blog_editorial_reviews', 'blog_editorial_audit']) {
      expect(text).toContain(`CREATE TABLE public.${name}`);
      expect(text).toContain(`REVOKE ALL ON TABLE public.${name} FROM PUBLIC, moneyverse_app`);
    }
    expect(text).toMatch(/UNIQUE\s*\(topic_id, locale, revision\)/);
    expect(text).toMatch(/content_sha256\s+text\s+NOT NULL/);
    expect(text).toContain('CREATE TRIGGER blog_editorial_drafts_immutable');
  });

  it('does not touch financial grants or enable unapproved publication', () => {
    const text = sql();
    expect(text).not.toMatch(/CREATE (?:OR REPLACE )?FUNCTION\s+public\.blog_editorial_(?:publish|schedule)\b/i);
    expect(text).not.toMatch(/REVOKE ALL ON ALL TABLES IN SCHEMA/i);
    expect(text).not.toMatch(/GRANT\s+(?:INSERT|UPDATE|DELETE).*TO\s+moneyverse_app/i);
    expect(text).not.toMatch(/ALTER TABLE public\.(?:account_balances|ledger_postings|ledger_transactions)/i);
  });

  it('keeps all new SECURITY DEFINER functions invisible to PUBLIC and app until secure BFF authorization', () => {
    const text = sql();
    for (const functionName of ['blog_editorial_topic_create', 'blog_editorial_source_record', 'blog_editorial_draft_append', 'blog_editorial_review_record']) {
      expect(text).toContain(`REVOKE ALL ON FUNCTION public.${functionName}`);
    }
    expect(text).not.toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION.*moneyverse_app/i);
    expect(text).not.toContain('blog-posts.json');
  });
});
