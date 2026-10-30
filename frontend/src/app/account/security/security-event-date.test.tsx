import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  parseSecurityEventDateRange,
  securityEventsMatchDateRange,
} from '@/lib/security-event-date';
const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: gate }));
vi.mock('./actions', () => ({
  terminateSession: vi.fn(),
  terminateOtherSessions: vi.fn(),
  terminateAllSessions: vi.fn(),
  beginSecurityReauthentication: vi.fn(),
  reauthenticateWithLocalPassword: vi.fn(),
  changeLocalPassword: vi.fn(),
  requestLocalEmailChange: vi.fn(),
}));
import Page from './page';

beforeEach(() => {
  vi.clearAllMocks();
  read.mockResolvedValue({ events: [] });
});
const render = async (params: Record<string, string | string[] | undefined>) =>
  renderToStaticMarkup(await Page({ searchParams: Promise.resolve(params) }));

describe('member owner security event KST dates', () => {
  it('parses leap days and rejects ambiguous, partial and overlong ranges', () => {
    expect(parseSecurityEventDateRange('2024-02-29', '2024-02-29')).toHaveProperty('startMs');
    for (const [from, to] of [
      ['2026-10-30', undefined],
      ['2026-02-29', '2026-03-01'],
      ['2026-10-31', '2026-10-30'],
      ['2025-01-01', '2026-10-30'],
      [['2026-10-30'], '2026-10-30'],
    ]) {
      expect(parseSecurityEventDateRange(from, to)).toBeNull();
    }
  });
  it('accepts inclusive Korean day boundaries, excluding next day', () => {
    const range = parseSecurityEventDateRange('2026-10-30', '2026-10-30')!;
    expect(
      securityEventsMatchDateRange(
        [
          { type: 'local_login_succeeded', createdAt: '2026-10-29T15:00:00.000Z' },
          { type: 'local_login_succeeded', createdAt: '2026-10-30T14:59:59.999Z' },
        ],
        range,
      ),
    ).toBe(true);
    expect(
      securityEventsMatchDateRange(
        [{ type: 'local_login_succeeded', createdAt: '2026-10-30T15:00:00.000Z' }],
        range,
      ),
    ).toBe(false);
  });
  it('shows date controls and forwards valid date range with category', async () => {
    const html = await render({ category: 'login', from: '2026-10-30', to: '2026-10-30' });
    expect(html).toContain('name="from"');
    expect(html).toContain('name="to"');
    expect(html).toContain('type="date"');
    expect(html).toContain(
      'href="/account/security?category=settings&amp;from=2026-10-30&amp;to=2026-10-30"',
    );
    expect(read).toHaveBeenCalledWith(
      '/api/v1/account/security/events?category=login&from=2026-10-30&to=2026-10-30',
    );
  });
  it('rejects invalid range and unverified out-of-range successful response', async () => {
    const invalid = await render({ from: '2026-10-30' });
    expect(invalid).toContain('올바르지 않은 보안 활동 날짜');
    expect(read).not.toHaveBeenCalledWith('/api/v1/account/security/events');
    read.mockResolvedValue({
      events: [{ type: 'local_login_succeeded', createdAt: '2026-10-30T15:00:00.000Z' }],
    });
    const html = await render({ from: '2026-10-30', to: '2026-10-30' });
    expect(html).toContain('보안 활동을 확인할 수 없습니다');
    expect(html).not.toContain('이메일 계정 로그인</span>');
  });
});
