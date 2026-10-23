// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { publicApi } from '@/lib/api';
import StatusPage from './page';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));
vi.mock('@/components/lobby-count', () => ({ LobbyCount: () => <span>0</span> }));
vi.mock('@/components/time-ago', () => ({ TimeAgo: () => <span>previously</span> }));

const sample = (state: string, freshnessState: string) => ({
  sourceKey: 'web', displayName: 'Web', state, freshnessState,
  observedAt: '2026-10-23T12:00:00Z', detail: null,
  ageMs: freshnessState === 'fresh' ? 1000 : 500000,
  policyVersion: 'status-v1',
});

async function render(rows: ReturnType<typeof sample>[]) {
  vi.mocked(publicApi).mockResolvedValueOnce({ status: rows });
  return renderToStaticMarkup(await StatusPage());
}

describe('public status SSR fail-closed', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renders checking instead of green when an API snapshot claims operational but is stale', async () => {
    const html = await render([sample('operational', 'stale')]);
    expect(html).toContain('아직 확인된 기록이 없어요.');
    expect(html).toContain('최신 확인 필요');
    expect(html).not.toContain('모든 서비스가 정상입니다.');
    expect(html).toContain('role="status"');
  });

  it('keeps an outage ahead of stale operational observations', async () => {
    const html = await render([sample('outage', 'fresh'), sample('operational', 'unknown')]);
    expect(html).toContain('일부 서비스에 장애가 있어요.');
    expect(html).not.toContain('모든 서비스가 정상입니다.');
  });

  it('still shows normal when all source observations are fresh and healthy', async () => {
    const html = await render([sample('operational', 'fresh')]);
    expect(html).toContain('모든 서비스가 정상입니다.');
    expect(html).not.toContain('최신 확인 필요');
  });
});
