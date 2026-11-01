import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { read, member } = vi.hoisted(() => ({ read: vi.fn(), member: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: member }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
import VenturesPage, { metadata } from './page';

beforeEach(() => { read.mockReset(); member.mockReset(); read.mockResolvedValue(null); });

describe('venture owner finance source integrity', () => {
  it('marks owner finance as non-indexable metadata', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('reads both guarded Nest sources and refuses to present invented balances or claimable dividends on 503', async () => {
    render(await VenturesPage());
    expect(member).toHaveBeenCalledOnce();
    expect(read).toHaveBeenCalledWith('/api/v1/businesses/ventures/pitches');
    expect(read).toHaveBeenCalledWith('/api/v1/businesses/ventures/investments');
    expect(screen.getByRole('alert').textContent).toMatch(/확인할 수 없|이용할 수 없/);
    expect(screen.queryByRole('button', { name: /청약|배당|설립|투자|투표/ })).toBeNull();
    expect(document.body.textContent).not.toMatch(/60,000,000|630,000|380,000|뉴럴마인드 AI/);
  });

  it('does not treat a legacy empty response as proof of a verified empty portfolio', async () => {
    read.mockImplementation(async (path: string) => path.endsWith('pitches') ? { pitches: [] } : { investments: [] });
    render(await VenturesPage());
    expect(screen.getByRole('alert').textContent).toMatch(/확인할 수 없/);
    expect(screen.queryByText(/확인된 투자 내역이 없습니다/)).toBeNull();
  });

  it('does not trust a legacy successful payload without a certified funding source', async () => {
    read.mockResolvedValue({ pitches: [{ id: 'sample', valuation: 99999999 }], investments: [{ id: 'sample', unclaimedDividendsWld: 99999999 }] });
    render(await VenturesPage());
    expect(screen.getByRole('alert').textContent).toMatch(/확인할 수 없|이용할 수 없/);
    expect(document.body.textContent).not.toContain('99,999,999');
  });
});
