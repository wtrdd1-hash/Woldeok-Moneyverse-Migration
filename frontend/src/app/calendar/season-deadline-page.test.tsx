import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CalendarPage from './page';
import { apiOrNull } from '@/lib/api';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));

function setup(valid: boolean) {
  vi.mocked(apiOrNull).mockImplementation(async (path) => {
    if (path.startsWith('/api/v1/seasons/events')) {
      return (valid ? { asOfUtc: new Date().toISOString(), events: [{
        event_id: '11111111-1111-4111-8111-111111111111',
        season_id: '22222222-2222-4222-8222-222222222222',
        season_name: 'Autumn', title: 'Ending soon', description: '',
        cost_wld: '100', points_per_entry: 10,
        ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }] } : { events: [] }) as never;
    }
    if (path === '/api/v1/early-game/today') return { event: null } as never;
    if (path === '/api/v1/engagement/early-game') return { goals: [] } as never;
    return { catalogItems: [] } as never;
  });
}

describe('calendar season deadline controls', () => {
  it('renders keyboard accessible seven-day filter and verified deadline', async () => {
    setup(true);
    const html = renderToStaticMarkup(await CalendarPage({ searchParams: Promise.resolve({ endingWithin: '7d' }) }));
    expect(html).toContain('aria-label="시즌 종료 기간 선택"');
    expect(html).toContain('/calendar?endingWithin=7d');
    expect(html).toContain('Ending soon');
    expect(vi.mocked(apiOrNull)).toHaveBeenCalledWith('/api/v1/seasons/events?endingWithin=7d');
  });
  it('does not present a fabricated empty event set when upstream evidence is missing', async () => {
    setup(false);
    const html = renderToStaticMarkup(await CalendarPage({ searchParams: Promise.resolve({ endingWithin: '7d' }) }));
    expect(html).toContain('시즌 이벤트 일정을 불러오지 못했어요.');
    expect(html).not.toContain('7일 이내 종료되는 시즌 이벤트가 없어요.');
  });
});
