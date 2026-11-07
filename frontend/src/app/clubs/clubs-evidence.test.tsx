import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import ClubsPage from './page';
import NewClubPage from './new/page';
import nextConfig from '../../../next.config';

vi.mock('@/lib/api', () => ({ api: vi.fn(), apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const club = {
  id: '7e204b0e-8eaf-4c34-8498-28732d3cf35d',
  tag: 'REAL', name: 'Verified Club', description: 'A real club',
  owner_id: 'd0d7d45b-b589-451d-8a46-48ad22e471a4', owner_name: 'Owner',
  join_mode: 'public', status: 'active', level: 1, experience: '9007199254740993',
  member_count: 7, created_at: '2026-10-30T10:00:00.000Z', is_my_club: true, my_role: 'member',
};
const params = (search = '', offset = '0') => ({ searchParams: Promise.resolve({ search, offset }) });

describe('club directory source evidence', () => {
  afterEach(() => { cleanup(); vi.resetAllMocks(); });

  it('authenticates and renders verified owner data with exact bigint experience', async () => {
    vi.mocked(api).mockResolvedValueOnce({ clubs: [club] });
    render(await ClubsPage(params()));
    expect(requireMember).toHaveBeenCalledOnce();
    expect(api).toHaveBeenCalledWith('/api/v1/clubs?limit=50&offset=0');
    expect(screen.getByText('Verified Club')).toBeTruthy();
    expect(screen.getByText(/9,007,199,254,740,993 EXP/)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /새 클럽 창설/ })).toBeNull();
  });

  it('distinguishes a verified empty result from an upstream outage', async () => {
    vi.mocked(api).mockResolvedValueOnce({ clubs: [] });
    const view = render(await ClubsPage(params('alpha')));
    expect(screen.getByText(/검색 결과가 없습니다/)).toBeTruthy();
    view.unmount();
    vi.mocked(api).mockRejectedValueOnce(new Error('upstream unavailable'));
    render(await ClubsPage(params('alpha')));
    expect(screen.getByRole('alert').textContent).toMatch(/클럽 목록을 확인할 수 없습니다/);
    expect(screen.queryByText(/검색 결과가 없습니다/)).toBeNull();
  });

  it('fails closed on malformed or duplicated club records', async () => {
    for (const bad of [[{ ...club, member_count: '7' }], [club, club], [{ ...club, experience: '-1' }]]) {
      vi.mocked(api).mockResolvedValueOnce({ clubs: bad });
      const view = render(await ClubsPage(params()));
      expect(screen.getByRole('alert').textContent).toMatch(/클럽 목록을 확인할 수 없습니다/);
      view.unmount();
    }
  });

  it('pages the actual 50-row backend window without claiming a global total', async () => {
    vi.mocked(api).mockResolvedValueOnce({ clubs: Array.from({ length: 50 }, (_, i) => ({ ...club, id: `7e204b0e-8eaf-4c34-8498-${String(i).padStart(12, '0')}`, tag: 'C'+String(i).padStart(2, '0') })) });
    render(await ClubsPage(params('alpha', '50')));
    expect(api).toHaveBeenCalledWith('/api/v1/clubs?search=alpha&limit=50&offset=50');
    expect(screen.getByRole('link', { name: /다음 페이지/ }).getAttribute('href')).toContain('offset=100');
    expect(screen.getByRole('link', { name: /이전 페이지/ }).getAttribute('href')).toContain('offset=0');
    expect(screen.queryByText(/총 50개의 클럽 활성 중/)).toBeNull();
  });

  it('sets real HTTP private noindex headers on authenticated club pages', async () => {
    const headers = await nextConfig.headers?.();
    for (const source of ['/clubs', '/clubs/:path*']) {
      const rule = headers?.find((entry) => entry.source === source);
      expect(rule?.headers).toEqual(expect.arrayContaining([
        { key: 'x-robots-tag', value: 'noindex, nofollow' },
        { key: 'cache-control', value: 'private, no-store' },
      ]));
    }
  });

  it('does not expose an unjournaled club creation form as a WLD settlement', async () => {
    render(await NewClubPage());
    expect(screen.queryByRole('button', { name: /창설|등록|확인/ })).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/창설.*이용할 수 없습니다/);
  });
});
