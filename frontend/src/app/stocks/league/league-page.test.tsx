// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
import { api } from '@/lib/api';
import StocksLeaguePage, { metadata } from './page';

const current = {
  success: true,
  season: { id: 's-1', title: 'Actual season', status: 'active', totalParticipants: 1 },
  leaderboard: [{ id: 'p-1', userName: 'Actual member', rankPosition: 1, roiRate: 5.25 }],
  whales: [],
};

describe('stock league SSR evidence and accessible states', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders only verified server records and no copy-trading mutation controls', async () => {
    vi.mocked(api).mockResolvedValue(current);
    const html = renderToStaticMarkup(await StocksLeaguePage());
    if (process.env.MV_C_BROWSER_FIXTURE) {
      writeFileSync(process.env.MV_C_BROWSER_FIXTURE, `<!doctype html><html lang="ko"><head><meta name="robots" content="noindex,nofollow"></head><body>${html}</body></html>`);
    }
    expect(api).toHaveBeenCalledWith('/api/v1/stocks/league/current');
    expect(html).toContain('Actual member');
    expect(html).toContain('5.25%');
    expect(html).toContain('Actual season');
    expect(html).toContain('거래 기능');
    expect(html).not.toContain('184.2');
    expect(html).not.toContain('구독하기');
    expect(html).toContain('scope="col"');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('never mistakes backend failure for an empty season', async () => {
    vi.mocked(api).mockRejectedValue(new Error('unavailable'));
    const failed = renderToStaticMarkup(await StocksLeaguePage());
    expect(failed).toContain('리그 기록을 확인할 수 없습니다');
    expect(failed).not.toContain('등록된 진행 중인 리그가 없습니다');
    vi.mocked(api).mockResolvedValue({ success: true, season: null, leaderboard: [], whales: [] });
    const empty = renderToStaticMarkup(await StocksLeaguePage());
    expect(empty).toContain('등록된 진행 중인 리그가 없습니다');
  });
});
