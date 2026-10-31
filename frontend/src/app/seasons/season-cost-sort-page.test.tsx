import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SeasonsPage from './page';
import { apiOrNull } from '@/lib/api';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => ({ id: 'owner' })) }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('./season-pass-track', () => ({ SeasonPassTrack: () => null }));
vi.mock('./season-hall-of-fame-ticker', () => ({ SeasonHallOfFameTicker: () => null }));
vi.mock('./season-reward-claim-banner', () => ({ SeasonRewardClaimBanner: () => null }));
vi.mock('./enter-button', () => ({ EnterButton: () => null }));
const id = '11111111-1111-4111-8111-111111111111';
const events = [{ event_id: id, season_id: id, season_name: 'S', title: 'Event', description: 'D', cost_wld: '5', points_per_entry: 2, ends_at: '2026-11-01T00:00:00Z' }];

describe('member season event cost controls', () => {
  beforeEach(() => vi.mocked(apiOrNull).mockClear());
  it('shows accessible sort links and retains selected sort when opening the leaderboard', async () => {
    vi.mocked(apiOrNull).mockImplementation(async (path) => {
      if (path === '/api/v1/seasons/events?sort=cost_asc') return { events } as never;
      if (typeof path === 'string' && path.startsWith('/api/v1/seasons/events/')) return { entries: [] } as never;
      return null;
    });
    const html = renderToStaticMarkup(await SeasonsPage({ searchParams: Promise.resolve({ sort: 'cost_asc' }) }));
    expect(html).toContain('aria-label="시즌 이벤트 참가비 정렬"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('sort=cost_asc');
    expect(html).toContain(`event=${id}&amp;sort=cost_asc`);
  });

  it('rejects duplicate sort values without requesting unverified event data', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(null);
    const html = renderToStaticMarkup(await SeasonsPage({ searchParams: Promise.resolve({ sort: ['cost_asc', 'cost_desc'] }) }));
    expect(html).toContain('참가비 순서 또는 이벤트 정보를 확인할 수 없어요.');
    expect(vi.mocked(apiOrNull).mock.calls.some(([path]) => typeof path === 'string' && path.startsWith('/api/v1/seasons/events'))).toBe(false);
  });
});
