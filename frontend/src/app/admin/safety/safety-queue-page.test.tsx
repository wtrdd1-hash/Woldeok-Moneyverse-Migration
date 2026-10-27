import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const gate = vi.hoisted(() => vi.fn());
const fetchQueue = vi.hoisted(() => vi.fn());
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
vi.mock('@/lib/api', () => ({ apiOrNull: fetchQueue }));
vi.mock('./chat-report-evidence-dialog', () => ({ ChatReportEvidenceDialog: () => null }));
vi.mock('./chat-report-action-dialog', () => ({ ChatReportActionDialog: () => null }));
vi.mock('./takedown-action-dialog', () => ({ TakedownActionDialog: () => null }));
import Page, { metadata } from './page';

const chat = {
  report_id: '11111111-1111-4111-8111-111111111111', reporter_id: '22222222-2222-4222-8222-222222222222', reporter_username: 'reporter',
  reporter_nickname: 'Reporter', reported_user_id: '33333333-3333-4333-8333-333333333333',
  reported_username: 'reported', reported_nickname: 'Reported',
  conversation_id: '44444444-4444-4444-8444-444444444444', reason: 'fraud_scam', details: 'Evidence',
  evidence_count: 3, status: 'SUBMITTED', created_at: '2026-10-27T01:00:00Z',
  actioned_at: null, actioned_by: null, actioner_nickname: null,
};

async function html(params: Record<string, string> = {}) {
  const tree = await Page({ searchParams: Promise.resolve(params) });
  return renderToStaticMarkup(tree);
}

describe('admin moderation queue server-rendered integration', () => {
  beforeEach(() => {
    gate.mockReset();
    fetchQueue.mockReset();
  });

  it('keeps failed APIs distinct from empty queues and prevents false zero counts', async () => {
    fetchQueue.mockResolvedValue(null);
    const rendered = await html();
    expect(gate).toHaveBeenCalledWith('/admin/safety');
    expect(rendered).toContain('확인 불가');
    expect(rendered).toContain('대기 신고가 0건이라는 뜻이 아닙니다');
    expect(rendered).toContain('다시 조회');
    expect(rendered).not.toContain('누적 안전 조치 및 감사 완료');
  });

  it('uses real backend offset and preserves selected tab when paging beyond 50', async () => {
    fetchQueue.mockImplementation((path: string) => {
      if (path.includes('chat-reports')) return Promise.resolve({
        items: Array.from({ length: 50 }, (_, i) => ({ ...chat, report_id: String(i).padStart(8, '0') + '-1111-4111-8111-111111111111' })),
        count: 50,
      });
      return Promise.resolve({ items: [], count: 0 });
    });
    const rendered = await html({ view: 'chat-reports', chatOffset: '50', takedownOffset: '100' });
    expect(fetchQueue).toHaveBeenCalledWith('/api/v1/admin/safety/chat-reports?limit=50&offset=50');
    expect(fetchQueue).toHaveBeenCalledWith('/api/v1/admin/safety/takedowns?limit=50&offset=100');
    expect(rendered).toContain('다음 50건 확인');
    expect(rendered).toContain('전체 건수 아님');
    expect(rendered).toContain('min-h-11');
    expect(rendered).not.toContain('실시간으로 큐에 노출됩니다');
    expect(rendered).toContain('chatOffset=100');
    expect(rendered).toContain('takedownOffset=100');
  });

  it('does not render moderation controls for malformed backend records', async () => {
    fetchQueue.mockResolvedValue({ items: [{ report_id: 'bad' }], count: 1 });
    const rendered = await html({ view: 'takedowns' });
    expect(rendered).toContain('목록을 확인할 수 없습니다');
    expect(rendered).not.toContain('증거 열람');
  });

  it('withholds moderation actions when an otherwise complete record has an invalid report UUID', async () => {
    fetchQueue.mockImplementation((path: string) => path.includes('chat-reports')
      ? Promise.resolve({ items: [{ ...chat, report_id: 'forged-report-id' }], count: 1 })
      : Promise.resolve({ items: [], count: 0 }));
    const rendered = await html();
    expect(rendered).toContain('목록을 확인할 수 없습니다');
    expect(rendered).not.toContain('(@reported)');
    expect(rendered).toContain('확인 불가');
  });

  it('does not index the administrator moderation page', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
