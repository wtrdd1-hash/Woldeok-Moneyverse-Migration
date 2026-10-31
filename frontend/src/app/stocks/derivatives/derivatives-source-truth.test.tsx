import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { read, member } = vi.hoisted(() => ({ read: vi.fn(), member: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: member }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));
import DerivativesPage from './page';

beforeEach(() => { read.mockReset(); member.mockReset(); read.mockResolvedValue(null); });

describe('derivatives page cannot invent member money or execute unledgered trades', () => {
  it('checks the authenticated backend market contract and fails closed on 503', async () => {
    render(await DerivativesPage());
    expect(member).toHaveBeenCalledOnce();
    expect(read).toHaveBeenCalledWith('/api/v1/stocks/derivatives/markets');
    expect(screen.getByRole('status').textContent).toMatch(/이용할 수 없|검증되지 않/);
    expect(screen.queryByRole('button', { name: /롱|숏|포지션 오픈|주문 실행|청산/ })).toBeNull();
  });

  it('does not display seeded balances, positions, quotes or insurance guarantees', async () => {
    read.mockResolvedValue({ markets: [{ ticker: 'WDG', currentPrice: 12500 }] });
    const { container } = render(await DerivativesPage());
    expect(container.textContent).not.toMatch(/50,000,000|pos-1|pos-2|실시간 청산 히트맵|보험기금 보호/);
    expect(screen.getByRole('link', { name: /주식 거래소/ }).getAttribute('href')).toBe('/stocks');
  });
});
