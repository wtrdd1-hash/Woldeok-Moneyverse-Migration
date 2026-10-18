import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { LocaleProvider } from '@/components/locale-provider';
import { SeoClientView, type SeoInitialData } from './seo-client-view';

const renderKo = (ui: React.ReactElement) => render(<LocaleProvider initialLocale="ko">{ui}</LocaleProvider>);
const initialNowMs = Date.parse('2026-10-06T00:00:00.000Z');

const mockInitialData: SeoInitialData = {
  totalHits24h: 124,
  totalHits7d: 842,
  avgDurationMs: 42,
  botDistribution: { Googlebot: 68, 'Naver Yeti': 34, Bingbot: 16 },
  statusDistribution: { '200': 118, '304': 4, '404': 2 },
  provenance: { source: 'seo-status-api', observedAt: '2026-10-06T00:00:00.000Z', freshness: 'fresh', status: 'operational' },
  stockCoverage: { indexed: 10, total: 10 },
  guideCoverage: { indexed: 5, total: 5 },
  targetUrls: [
    {
      path: '/stocks/CHIPS',
      category: 'stock',
      name: '침팬지 반도체 (CHIPS)',
      lastVisitedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      lastBot: 'Googlebot',
      lastStatusCode: 200,
      healthStatus: 'healthy',
    },
    {
      path: '/guide/stock-trading',
      category: 'guide',
      name: '가상 주식 실전 매매 가이드',
      lastVisitedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      lastBot: 'Naver Yeti',
      lastStatusCode: 200,
      healthStatus: 'healthy',
    },
    {
      path: '/',
      category: 'hub',
      name: '월덕 머니버스 메인 포털',
      lastVisitedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      lastBot: 'Googlebot',
      lastStatusCode: 200,
      healthStatus: 'healthy',
    },
  ],
  recentLogs: [
    {
      id: 'log-1',
      botName: 'Googlebot',
      path: '/stocks/CHIPS',
      statusCode: 200,
      durationMs: 42,
      ipAddress: '66.249.66.1',
      userAgent: 'Mozilla/5.0 Googlebot',
      createdAt: new Date().toISOString(),
    },
  ],
  indexNowKey: 'test-key-2026',
  sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
};

describe('SeoClientView', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders all 4 hero KPI widgets and metrics correctly', () => {
    renderKo(<SeoClientView initialData={mockInitialData} initialNowMs={initialNowMs} />);

    expect(screen.getByText('24시간 봇 크롤링')).toBeTruthy();
    expect(screen.getAllByText('124')[0]).toBeTruthy();
    expect(screen.getByText('Google AdSense 광고 수익화 & 트래픽 관제 타워')).toBeTruthy();
    expect(screen.getByText('10대 가상 주식 봇 방문 현황')).toBeTruthy();
    expect(screen.getByText('10 / 10')).toBeTruthy();
    expect(screen.getByText('5대 금융 가이드 봇 방문 현황')).toBeTruthy();
    expect(screen.getByText('5 / 5')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });


  it('marks crawler observation as distinct from verified search engine indexing', () => {
    renderKo(<SeoClientView initialData={mockInitialData} initialNowMs={initialNowMs} />);
    expect(screen.getByText('10대 가상 주식 봇 방문 현황')).toBeTruthy();
    expect(screen.getByText('5대 금융 가이드 봇 방문 현황')).toBeTruthy();
    expect(screen.getByText(/Google 색인 확인은 Search Console에서 별도 검사/)).toBeTruthy();
    expect(screen.queryByText('정상 색인')).toBeNull();
  });

  it('does not display fabricated zero search coverage when the crawler API is unavailable', () => {
    const unavailable: SeoInitialData = {
      ...mockInitialData,
      provenance: { source: 'fallback', observedAt: null, freshness: 'unknown', status: 'unavailable' },
      stockCoverage: { indexed: 0, total: 10 },
      guideCoverage: { indexed: 0, total: 5 },
      targetUrls: mockInitialData.targetUrls.map((url) => ({
        ...url, lastVisitedAt: null, lastBot: null, healthStatus: 'unindexed' as const,
      })),
    };
    renderKo(<SeoClientView initialData={unavailable} initialNowMs={initialNowMs} />);
    expect(screen.getAllByText('관측 자료 없음').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('자료 없음').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText('초고속 SSR 최적화 (양호)')).toBeNull();
    expect(screen.queryByText('0 / 10')).toBeNull();
    expect(screen.queryByText('0 / 5')).toBeNull();
    expect(screen.queryByText('미방문 (Unindexed)')).toBeNull();
  });

  it('renders target URL cards with health badges and names', () => {
    renderKo(<SeoClientView initialData={mockInitialData} initialNowMs={initialNowMs} />);

    expect(screen.getByText('침팬지 반도체 (CHIPS)')).toBeTruthy();
    expect(screen.getAllByText('/stocks/CHIPS')[0]).toBeTruthy();
    expect(screen.getAllByText('최근 봇 방문').length).toBeGreaterThan(0);
    expect(screen.queryByText('정상 색인')).toBeNull();
    expect(screen.queryByText('미방문 (Unindexed)')).toBeNull();
    expect(screen.getByText('가상 주식 실전 매매 가이드')).toBeTruthy();
    expect(screen.getAllByText('/guide/stock-trading')[0]).toBeTruthy();
  });

  it('filters target cards by category button click', () => {
    renderKo(<SeoClientView initialData={mockInitialData} initialNowMs={initialNowMs} />);

    const stockFilterBtn = screen.getByRole('button', { name: /가상 주식/i });
    fireEvent.click(stockFilterBtn);

    expect(screen.getByText('침팬지 반도체 (CHIPS)')).toBeTruthy();
    expect(screen.queryByText('가상 주식 실전 매매 가이드')).toBeNull();
  });

  it('handles manual submission ping button click with feedback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        submittedUrls: ['https://easy-scraping.com/stocks/CHIPS'],
        indexNowResponses: [
          { endpoint: 'https://api.indexnow.org/indexnow', status: 200, message: 'Notification received' },
          { endpoint: 'https://www.bing.com/indexnow', status: 503, message: 'Unavailable' },
        ],
      }),
    });

    renderKo(<SeoClientView initialData={mockInitialData} initialNowMs={initialNowMs} />);

    const submitBtn = screen.getByRole('button', { name: /IndexNow URL 변경 통보/i });
    fireEvent.click(submitBtn);

    const feedback = await screen.findByText(/URL 변경 알림 접수: 1\/2개 검색엔진 엔드포인트/);
    expect(feedback.textContent).toContain('실제 검색 색인은 보장되지 않습니다.');
  });

  it('renders Google Search Console Search Analytics card with metrics', () => {
    renderKo(<SeoClientView initialData={mockInitialData} initialNowMs={initialNowMs} />);

    expect(screen.getByText(/Google Search Console 검색 성과 분석/i)).toBeTruthy();
    expect(screen.getByText('30일간 검색 트렌드 추이')).toBeTruthy();
    expect(screen.getByText(/서비스 계정 키를 등록하면 Google Search Console의 실제 데이터만 표시됩니다/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /서비스 계정 키 설정/i })).toBeTruthy();
  });

  it('lets a registered Search Console account submit the production sitemap with one click', async () => {
    global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/seo/gsc' && (!init?.method || init.method === 'GET')) {
        return {
          ok: true,
          json: async () => ({
            hasCredentials: true,
            clientEmail: 'seo-sa@moneyverse-gsc.iam.gserviceaccount.com',
            propertyUrl: 'sc-domain:easy-scraping.com',
            source: 'search-console',
            syncError: null,
          }),
        } as Response;
      }
      if (url === '/api/seo/gsc' && init?.method === 'POST') {
        expect(JSON.parse(String(init.body))).toEqual({ action: 'submit-sitemap' });
        return {
          ok: true,
          json: async () => ({
            success: true,
            sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
            propertyUrl: 'sc-domain:easy-scraping.com',
            lastSubmitted: '2026-10-07T00:05:00.000Z',
            lastDownloaded: '2026-10-07T00:06:00.000Z',
            isPending: false,
            warnings: 0,
            errors: 0,
            submittedUrlCount: 642,
          }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    }) as typeof fetch;

    renderKo(<SeoClientView initialData={mockInitialData} initialNowMs={initialNowMs} />);

    const submitButton = await screen.findByRole('button', { name: /Search Console 사이트맵 등록/i });
    await waitFor(() => expect((submitButton as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submitButton);

    expect(await screen.findByText(/사이트맵 등록 완료/i)).toBeTruthy();
    expect(screen.getByText(/642개 URL/i)).toBeTruthy();
  });

  it('does not fabricate a successful indexing batch before an administrator submits one', () => {
    renderKo(<SeoClientView initialData={mockInitialData} initialNowMs={initialNowMs} />);

    expect(screen.queryByText('100개 URL 색인 요청 완료')).toBeNull();
  });
});

