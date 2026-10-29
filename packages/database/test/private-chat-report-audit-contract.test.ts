import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = join(__dirname, '../migrations/305-private-chat-report-canonical-audit.sql');

describe('private chat report audit forward migration', () => {
  it('redefines the report function without touching the applied 227 source', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.private_chat_report\(/);
    expect(sql).toContain('SECURITY DEFINER');
    expect(sql).toMatch(/SET search_path\s*=\s*pg_catalog\s*,\s*pg_temp/);
    expect(sql).toContain('public.admin_append_audit_event(');
    expect(sql).toContain("'chat.conversation.reported'");
    expect(sql).not.toMatch(/INSERT INTO public\.audit_logs/);
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.private_chat_report');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.private_chat_report');
  });
});
