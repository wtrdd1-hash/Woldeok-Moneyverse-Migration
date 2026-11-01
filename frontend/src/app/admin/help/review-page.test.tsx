// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const read = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn().mockResolvedValue(undefined) }));
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('not found'); }) }));
vi.mock('./actions', () => ({
  createVerifiedHelpDraft: vi.fn(), publishVerifiedHelp: vi.fn(), retractVerifiedHelp: vi.fn(),
}));

import AdminHelpPage from './page';

const draft = {
  article_id: '00000000-0000-4000-8000-000000000001', locale: 'ko', slug: 'help', category: 'account',
  title: 'Source article', body_plain: 'Body', source_url: 'https://example.org/help',
  source_sha256: 'a'.repeat(64), reviewed_until: '2026-10-01T00:00:00.000Z',
  state: 'draft', version: '1', author_id: '00000000-0000-4000-8000-000000000002',
  canApprove: true, canRetract: false,
};

const priorFlag = process.env.VERIFIED_HELP_CENTER_V1;
beforeEach(() => { read.mockReset(); process.env.VERIFIED_HELP_CENTER_V1 = 'true'; });
afterEach(() => { if (priorFlag === undefined) delete process.env.VERIFIED_HELP_CENTER_V1; else process.env.VERIFIED_HELP_CENTER_V1 = priorFlag; });

describe('admin verified help queue rendering', () => {
  it('fails closed on malformed 200 and offers accessible retry without actions or false empty', async () => {
    read.mockResolvedValue({ articles: 'broken', canDraft: true });
    const html = renderToStaticMarkup(await AdminHelpPage());
    expect(html).toContain('role="alert"');
    expect(html).toContain('다시 조회');
    expect(html).not.toContain('조회에 성공했으며');
    expect(html).not.toContain('초안 저장(비공개)');
    expect(html).not.toContain('독립 검토 후 승인');
  });

  it('distinguishes verified empty queue from a failed read', async () => {
    read.mockResolvedValue({ articles: [], canDraft: false });
    const html = renderToStaticMarkup(await AdminHelpPage());
    expect(html).toContain('조회에 성공했으며 검토할 항목이 없습니다.');
    expect(html).not.toContain('role="alert"');
  });

  it('disables approval for expired evidence while preserving its review context', async () => {
    read.mockResolvedValue({ articles: [draft], canDraft: false });
    const html = renderToStaticMarkup(await AdminHelpPage());
    expect(html).toContain('Source article');
    expect(html).toContain('근거 검토 기한이 지났습니다');
    expect(html).not.toContain('독립 검토 후 승인');
  });
});
