import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(join(process.cwd(), 'migrations/196-user-admin-support-chat.sql'), 'utf8');

describe('support owner-scoped database contract', () => {
  it('filters the member thread list by actor and denies foreign thread messages', () => {
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.support_my_threads[\s\S]*?WHERE t\.user_id=p_actor/);
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.support_thread_messages[\s\S]*?t\.id=p_thread AND t\.user_id=p_actor/);
    expect(migration).toContain("ERRCODE='42501', MESSAGE='support thread not available'");
  });
  it('does not give the application direct support table access', () => {
    expect(migration).toMatch(/REVOKE ALL PRIVILEGES ON TABLE public\.support_threads, public\.support_messages\s+FROM PUBLIC, moneyverse_app/);
    expect(migration).not.toMatch(/GRANT\s+(?:SELECT|INSERT|UPDATE|DELETE)[\s\S]{0,100}ON\s+(?:TABLE\s+)?public\.support_(?:threads|messages)/i);
  });
});
