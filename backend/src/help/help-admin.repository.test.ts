import { describe, expect, it, vi } from 'vitest';
import { HelpRepository } from './help.repository';

const actor = '00000000-0000-0000-0000-000000000001';
const session = '00000000-0000-0000-0000-000000000010';
const key = '00000000-0000-0000-0000-000000000099';

describe('admin help SQL authority', () => {
  it('passes the verified actor/session and idempotency key to the DB command', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ article_id: 'draft-id' }] });
    const repo = new HelpRepository({ query });
    const draft = { locale:'ko', slug:'login-help', category:'account', title:'Title', summary:'Summary', body:'Body', sourceUrl:'https://example.org', sourceSha256:'a'.repeat(64), reviewedUntil:'2026-12-01T00:00:00Z' };
    expect(await repo.adminCreate(actor, session, key, draft)).toEqual('draft-id');
    expect(query.mock.calls[0]?.[0]).toMatch(/public\.help_admin_create_draft\(/);
    expect(query.mock.calls[0]?.[1]).toEqual([actor,session,key,'ko','login-help','account','Title','Summary','Body','https://example.org','a'.repeat(64),'2026-12-01T00:00:00Z']);
  });
  it('passes the optimistic version to the independent approval command', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ article_id: 'published-id' }] });
    const repo = new HelpRepository({ query });
    expect(await repo.adminPublish(actor,session,key,'article-id','1')).toBe('published-id');
    expect(query.mock.calls[0]?.[0]).toMatch(/public\.help_admin_publish\(/);
    expect(query.mock.calls[0]?.[1]).toEqual([actor,session,key,'article-id','1']);
  });
});
