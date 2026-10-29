import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import WarfarePage from './page';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));

const verifiedClub = {
  id: '7e204b0e-8eaf-4c34-8498-28732d3cf35d',
  name: 'Verified Test Club',
  tag: 'REAL',
  member_count: 7,
  is_my_club: true,
  my_role: 'member',
  status: 'active',
};

describe('WarfarePage verified club boundary', () => {
  afterEach(() => { cleanup(); vi.resetAllMocks(); });

  it('authenticates and shows only actual PostgreSQL-backed club results without fake payout controls', async () => {
    vi.mocked(api).mockResolvedValueOnce({ clubs: [verifiedClub] });
    render(await WarfarePage());
    expect(requireMember).toHaveBeenCalledOnce();
    expect(api).toHaveBeenCalledWith('/api/v1/clubs?limit=50');
    expect(screen.getByRole('link', { name: /Verified Test Club/ }).getAttribute('href')).toBe(`/clubs/${verifiedClub.id}`);
    expect(screen.getByText(/공성전.*이용할 수 없습니다/)).toBeTruthy();
    expect(screen.queryByText('발할라 파이낸스 길드')).toBeNull();
    expect(screen.queryByRole('button', { name: /배당금 수령|공성전 선포/ })).toBeNull();
  });

  it('distinguishes a verified empty club list from a failed API request', async () => {
    vi.mocked(api).mockResolvedValueOnce({ clubs: [] });
    const { unmount } = render(await WarfarePage());
    expect(screen.getByText(/가입하거나 만든 클럽이 없습니다/)).toBeTruthy();
    unmount();
    vi.mocked(api).mockRejectedValueOnce(new Error('backend unavailable'));
    render(await WarfarePage());
    expect(screen.getByRole('alert').textContent).toMatch(/클럽 정보를 불러오지 못했습니다/);
    expect(screen.queryByText(/가입하거나 만든 클럽이 없습니다/)).toBeNull();
  });

  it('does not mistake malformed server data for an empty club list', async () => {
    vi.mocked(api).mockResolvedValueOnce({ clubs: [{ ...verifiedClub, member_count: '7' }] });
    render(await WarfarePage());
    expect(screen.getByRole('alert').textContent).toMatch(/클럽 정보를 불러오지 못했습니다/);
  });

  it('does not fetch private club records before membership authentication', async () => {
    vi.mocked(requireMember).mockRejectedValueOnce(new Error('unauthenticated'));
    await expect(WarfarePage()).rejects.toThrow('unauthenticated');
    expect(api).not.toHaveBeenCalled();
  });
});
