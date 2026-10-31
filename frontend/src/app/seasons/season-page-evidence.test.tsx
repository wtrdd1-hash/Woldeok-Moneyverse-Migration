import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiOrNull } from '@/lib/api';
import SeasonsPage from './page';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('./hall-of-fame-ticker', () => ({ SeasonHallOfFameTicker: () => null }));
vi.mock('./season-pass-track', () => ({ SeasonPassTrack: () => null }));
vi.mock('./enter-button', () => ({ EnterButton: () => <span>Verified entry</span> }));

const ID = '11111111-1111-4111-8111-111111111111';
const seasonId = '22222222-2222-4222-8222-222222222222';
const event = { event_id: ID, season_id: seasonId, season_name: 'Real Season',
  title: 'Verified event', description: 'Details', cost_wld: '10', points_per_entry: 2, ends_at: null };
const status = { seasonId, seasonName: 'Real Season', startsAt: '2026-10-01T00:00:00Z',
  endsAt: '2026-12-01T00:00:00Z', lifecycleState: 'active', totalParticipants: 2,
  myRank: 1, myScore: 20, myTier: 'Silver', tierRewardWld: 500, tierTrophy: null };

const html = async () => renderToStaticMarkup(await SeasonsPage({ searchParams: Promise.resolve({}) }));

describe('authenticated season page source truth', () => {
  beforeEach(() => vi.mocked(apiOrNull).mockReset());

  it('uses the real currentSeason envelope but never presents an unledgered reward as earned', async () => {
    vi.mocked(apiOrNull).mockImplementation(async (path) => {
      if (typeof path === 'string' && path.endsWith('/current')) return { currentSeason: status };
      if (typeof path === 'string' && path.endsWith('/events')) return { events: [event] };
      return { entries: [{ rank: 1, points: '20', entries: '1', display_name: 'Member' }] };
    });
    const output = await html();
    expect(output).toContain('현재 시즌:');
    expect(output).toContain('Real Season');
    expect(output).toContain('Verified event');
    expect(output).toContain('Member');
    expect(output).not.toContain('지급 예정 보상');
    expect(output).not.toContain('+500 WLD');
  });

  it('does not show paid participation or fake empty rankings for malformed sources', async () => {
    vi.mocked(apiOrNull).mockImplementation(async (path) => {
      if (typeof path === 'string' && path.endsWith('/current')) return { currentSeason: { ...status, myRank: -1 } };
      if (typeof path === 'string' && path.endsWith('/events')) return { events: [{ ...event, cost_wld: '-50' }] };
      return { entries: [] };
    });
    const output = await html();
    expect(output).toContain('이벤트를 확인할 수 없어요.');
    expect(output).toContain('현재 시즌 정보를 확인할 수 없습니다.');
    expect(output).not.toContain('Verified event');
    expect(output).not.toContain('Verified entry');
    expect(output).not.toContain('아직 참가자가 없습니다.');
  });
});
