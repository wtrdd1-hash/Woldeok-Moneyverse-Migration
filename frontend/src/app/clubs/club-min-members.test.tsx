import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ClubsPage from './page';
import { apiOrNull } from '@/lib/api';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn().mockResolvedValue({ clubs: [] }) }));

describe('club discovery minimum-members UI', () => {
  it('sends the minimum to the authenticated backend before rendering results', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce({ clubs: [] });
    const html = renderToStaticMarkup(await ClubsPage({ searchParams: Promise.resolve({ search: 'Alpha', minMembers: '3' }) }));
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/clubs?search=Alpha&minMembers=3');
    expect(html).toContain('name="minMembers"');
    expect(html).toContain('최소 회원 수');
    expect(html).toContain('최대 50개 조회');
  });
  it('does not mislabel unavailable results as a verified empty directory', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce(null);
    const html = renderToStaticMarkup(await ClubsPage({ searchParams: Promise.resolve({ minMembers: '5' }) }));
    expect(html).toContain('클럽 목록을 확인할 수 없습니다');
    expect(html).not.toContain('아직 등록된 다른 클럽이 없습니다');
  });
  it('rejects malformed filters without sending a request', async () => {
    vi.mocked(apiOrNull).mockClear();
    const html = renderToStaticMarkup(await ClubsPage({ searchParams: Promise.resolve({ minMembers: '1e3' }) }));
    expect(apiOrNull).not.toHaveBeenCalled();
    expect(html).toContain('0~100000 사이의 정수');
  });
});
