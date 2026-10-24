// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { isLoggedInMember } from '@/lib/session';
import { apiOrNull } from '@/lib/api';
import SpacesPage from './page';
import RealEstatePage from './real-estate/page';

vi.mock('@/lib/session', () => ({ isLoggedInMember: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn().mockResolvedValue('ko') }));

const member = vi.mocked(isLoggedInMember);
const fetchSpaces = vi.mocked(apiOrNull);

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => cleanup());

describe('owner-verified personal spaces', () => {
  it('shows a sign-in CTA and never queries owner spaces for a guest', async () => {
    member.mockResolvedValue(false);
    render(await SpacesPage());
    expect(screen.getByRole('link', { name: /로그인/ }).getAttribute('href')).toMatch(/login/);
    expect(fetchSpaces).not.toHaveBeenCalled();
    expect(screen.queryByText(/임대 수익 원터치 수령/)).toBeNull();
  });

  it('shows owner-scoped PostgreSQL holdings, not sample space ownership or imaginary WLD payouts', async () => {
    member.mockResolvedValue(true);
    fetchSpaces.mockResolvedValue({ spaces: [{
      id: '0b46b730-7d33-4aa4-929f-21a8d5e334b1',
      user_id: 'fda234d5-13b7-42b5-946c-a89a60b40215',
      name: '내 실제 공간', space_type: 'SPACE_STUDIO', privacy: 'PRIVATE',
      created_at: '2026-10-24T01:00:00.000Z', updated_at: '2026-10-24T01:00:00.000Z', layout: {},
    }] } as never);
    render(await SpacesPage());
    expect(fetchSpaces).toHaveBeenCalledWith('/api/v1/spaces');
    expect(screen.getByText('내 실제 공간')).toBeTruthy();
    expect(screen.queryByText(/테헤란로 나의 첫 베이스캠프/)).toBeNull();
    expect(screen.queryByRole('button', { name: /수령|매입|분양/ })).toBeNull();
  });

  it('distinguishes empty verified ownership from API failure', async () => {
    member.mockResolvedValue(true);
    fetchSpaces.mockResolvedValueOnce({ spaces: [] } as never);
    render(await SpacesPage());
    expect(screen.getByText(/소유 공간이 없습니다/)).toBeTruthy();
    cleanup();
    fetchSpaces.mockResolvedValueOnce(null);
    render(await SpacesPage());
    expect(screen.getByRole('alert').textContent).toMatch(/조회할 수 없습니다/);
  });

  it('keeps the real estate page read-only while the auction has no ledger-backed contract', async () => {
    member.mockResolvedValue(true);
    fetchSpaces.mockResolvedValue({ spaces: [] } as never);
    render(await RealEstatePage());
    expect(screen.getAllByText(/경매 및 월세 지급 기능은 중단/).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /입찰|배당금 수령|일괄 수령/ })).toBeNull();
  });
});
