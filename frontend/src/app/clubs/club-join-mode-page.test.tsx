import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ClubsPage from './page';
import { api } from '@/lib/api';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => ({ id: 'owner' })) }));
vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/components/page-header', () => ({ PageHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

beforeEach(() => vi.mocked(api).mockReset());

describe('member club directory join-mode filter', () => {
  it('forwards both search and mode and renders verified matching results', async () => {
    vi.mocked(api).mockResolvedValue({ clubs: [{ id: '11111111-2222-4333-8444-555555555555', name: '테스트 클럽', tag: 'TEST', owner_name: 'Owner', description: '', join_mode: 'public', status: 'active', level: 1, member_count: 1, experience: '9007199254740993', is_my_club: false }] });
    const html = renderToStaticMarkup(await ClubsPage({ searchParams: Promise.resolve({ search: '테스트', joinMode: 'public' }) }));
    expect(api).toHaveBeenCalledWith('/api/v1/clubs?search=%ED%85%8C%EC%8A%A4%ED%8A%B8&joinMode=public');
    expect(html).toContain('테스트 클럽');
    expect(html).toContain('자유 가입');
    expect(html).toContain('9,007,199,254,740,993');
    expect(html).toContain('전체 클럽 수가 아닙니다');
  });
  it('distinguishes upstream outage from a genuine empty result', async () => {
    vi.mocked(api).mockResolvedValue({ error: 'upstream 503' });
    const html = renderToStaticMarkup(await ClubsPage({ searchParams: Promise.resolve({ joinMode: 'invite' }) }));
    expect(html).toContain('클럽 목록을 확인할 수 없습니다');
    expect(html).not.toContain('선택한 조건에 해당하는 다른 클럽이 없습니다');
  });
  it('does not request an invalid or duplicate mode', async () => {
    const html = renderToStaticMarkup(await ClubsPage({ searchParams: Promise.resolve({ joinMode: ['public', 'invite'] }) }));
    expect(api).not.toHaveBeenCalled();
    expect(html).toContain('가입 방식 또는 검색 조건이 올바르지 않습니다');
  });
});
