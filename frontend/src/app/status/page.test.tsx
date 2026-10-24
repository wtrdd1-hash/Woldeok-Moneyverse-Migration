import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { publicApi } from '@/lib/api';
import StatusPage, { metadata } from './page';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));
vi.mock('@/components/lobby-count', () => ({ LobbyCount: () => <span>0</span> }));

const recent = () => new Date(Date.now() - 20_000).toISOString();
const source = (freshnessState: 'fresh' | 'stale', observedAt: string | null = recent()) => ({
  sourceKey: 'frontend',
  displayName: 'Frontend',
  state: 'operational',
  detail: null,
  observedAt,
  freshnessState,
  ageMs: 20_000,
  policyVersion: '1',
});

describe('public service status SSR', () => {
  beforeEach(() => vi.resetAllMocks());

  it('does not display an all-green headline for stale collector data', async () => {
    vi.mocked(publicApi).mockResolvedValue({ status: [source('stale')] });
    const html = renderToStaticMarkup(await StatusPage());
    expect(html).toContain('최신 서비스 상태를 확인할 수 없어요.');
    expect(html).toContain('최신 확인 필요');
    expect(html).not.toContain('모든 서비스가 정상입니다.');
    expect(html).toContain('role="status"');
  });

  it('does not trust a fresh flag without a trustworthy timestamp', async () => {
    vi.mocked(publicApi).mockResolvedValue({ status: [source('fresh', null)] });
    const html = renderToStaticMarkup(await StatusPage());
    expect(html).toContain('최신 확인 필요');
    expect(html).not.toContain('모든 서비스가 정상입니다.');
  });

  it('shows operational only for a recent confirmed source and remains non-indexable', async () => {
    vi.mocked(publicApi).mockResolvedValue({ status: [source('fresh')] });
    const html = renderToStaticMarkup(await StatusPage());
    expect(html).toContain('모든 서비스가 정상입니다.');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(html).toContain('연결 상태');
  });

  it('distinguishes an API outage from a healthy system', async () => {
    vi.mocked(publicApi).mockResolvedValue(null);
    const html = renderToStaticMarkup(await StatusPage());
    expect(html).toContain('지금은 상태를 불러올 수 없어요.');
    expect(html).not.toContain('모든 서비스가 정상입니다.');
  });
});
