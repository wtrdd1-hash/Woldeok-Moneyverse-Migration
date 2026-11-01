import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const mocks = vi.hoisted(() => ({ read: vi.fn(), member: vi.fn(), locale: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.read }));
vi.mock('@/lib/session', () => ({ requireMember: mocks.member }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: mocks.locale }));
import DashboardPage from './page';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.locale.mockResolvedValue('ko');
  mocks.read.mockImplementation(async (path: string) => {
    if (path.includes('/wallet')) return null;
    if (path.includes('/watchlist')) return { stocks: [] };
    if (path.includes('/portfolio')) return { holdings: [] };
    if (path.includes('/history')) return { trades: [] };
    if (path.includes('/events')) return { events: [] };
    return null;
  });
});

const renderPage = async () => renderToStaticMarkup(await DashboardPage());

describe('member dashboard source states', () => {
  it('shows unknown rather than zero for failed counts, but zero for verified empty lists', async () => {
    mocks.read.mockResolvedValue(null);
    const html = await renderPage();
    expect(html).toContain('—');
    expect(html).not.toContain('아직 관심 종목이 없어요');
    expect(html).not.toContain('보유 중인 가상 주식이 없어요');
    expect(html).not.toContain('아직 발생한 알림이 없어요');
    expect(html).toContain('다시 조회');
  });

  it('does not crash on success-shaped malformed upstream data', async () => {
    mocks.read.mockResolvedValue({ stocks: null, holdings: null, trades: null, events: null });
    const html = await renderPage();
    expect(html).toContain('불러오지 못했어요');
    expect(html).not.toContain('최근 활동이 없어요');
  });

  it('keeps genuinely verified empty sources distinct from an outage', async () => {
    const html = await renderPage();
    expect(html).toContain('아직 관심 종목이 없어요');
    expect(html).toContain('보유 중인 가상 주식이 없어요');
    expect(html).toContain('아직 발생한 알림이 없어요');
  });
});
